const Enrollment = require("../models/Enrollment");
const Semester = require("../models/Semester");
const GradeConfig = require("../models/GradeConfig");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendPushNotification } = require("../services/notificationService");

// Helper: send grade notification to a student
async function notifyStudent(studentId, senderId, title, body) {
  try {
    await Notification.create({ recipient: studentId, sender: senderId, title, body, type: "system" });
    const student = await User.findById(studentId).select("fcmToken").lean();
    if (student?.fcmToken) {
      await sendPushNotification(student.fcmToken, title, body).catch(() => {});
    }
  } catch (_) {}
}

// GET /api/v1/grades/my — student sees their own grades for current semester
exports.getMyGrades = async (req, res) => {
  try {
    const semester = await Semester.findOne({ is_active: true }).lean();

    const enrollments = await Enrollment.find({
      student: req.user._id,
      status: { $in: ["Enrolled", "Approved"] },
    })
      .populate({
        path: "section",
        match: semester ? { semester_id: semester._id } : {},
        populate: { path: "course_id", select: "title code credits" },
      })
      .lean();

    const filtered = enrollments.filter((e) => e.section);

    // Fetch grade configs for all sections in parallel
    const sectionIds = filtered.map((e) => e.section._id);
    const configs = await GradeConfig.find({ section_id: { $in: sectionIds } }).lean();
    const configMap = Object.fromEntries(configs.map((c) => [c.section_id.toString(), c]));

    const data = filtered.map((e) => ({
      enrollmentId: e._id,
      course: e.section.course_id,
      sectionId: e.section._id,
      grades: e.grades_object || {},
      config: configMap[e.section._id.toString()] || null,
      isGradeLocked: e.isGradeLocked,
    }));

    res.json({ success: true, semester, grades: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/grades/results — final results after semester ends (all completed semesters)
exports.getFinalResults = async (req, res) => {
  try {
    // Get all semesters with show_final_results enabled (active or inactive)
    const semesters = await Semester.find({ 
      show_final_results: true 
    })
      .sort({ end_date: -1 })
      .lean();

    const results = await Promise.all(
      semesters.map(async (sem) => {
        const enrollments = await Enrollment.find({
          student: req.user._id,
          status: { $in: ["Enrolled", "Approved"] },
        })
          .populate({
            path: "section",
            match: { semester_id: sem._id },
            populate: { path: "course_id", select: "title code credits" },
          })
          .lean();

        const courses = await Promise.all(
          enrollments
            .filter((e) => e.section && e.isFinalExamLocked)
            .map(async (e) => {
              const g = e.grades_object || {};
              const cfg = await GradeConfig.findOne({ section_id: e.section._id }).lean();
              const ywMax = cfg?.year_work_max || 40;
              const finalMax = cfg?.final_max || 60;
              const totalMax = ywMax + finalMax;
              const total = parseFloat(g.final_total ?? g.total ?? 0);
              const passed = totalMax > 0 ? total >= totalMax / 2 : total >= 60;
              const letter = g.letter_grade || calcLetter(total, totalMax);
              return {
                enrollmentId: e._id,
                course: e.section.course_id,
                total,
                totalMax,
                passed,
                grade: letter,
              };            })
        );

        if (courses.length === 0) return null;

        const semGPA = calcGPA(courses);
        return { semester: sem, courses, gpa: semGPA };
      })
    );

    res.json({ 
      success: true, 
      results: results.filter(Boolean),
      showResults: semesters.length > 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Convert total score (out of totalMax) to grade points.
 * Pass mark = 60% of totalMax
 * Pass:  1.0 at pass mark, +0.1 per mark above pass, max 5.0 at 100%
 * Fail:  0
 */
function calcPoints(total, totalMax = 100) {
  const passMark = totalMax * 0.6;
  if (total < passMark) return 0;
  // scale: passMark → 1.0, totalMax → 5.0
  const points = 1.0 + ((total - passMark) / (totalMax - passMark)) * 4.0;
  return Math.min(5.0, Math.round(points * 10) / 10); // round to 1 decimal
}

function calcLetter(total, totalMax = 100) {
  const pct = totalMax > 0 ? (total / totalMax) * 100 : 0;
  if (pct >= 90) return "A+";
  if (pct >= 85) return "A";
  if (pct >= 80) return "B+";
  if (pct >= 75) return "B";
  if (pct >= 70) return "C+";
  if (pct >= 65) return "C";
  if (pct >= 60) return "D";
  return "F";
}

/**
 * GPA calculation:
 * - Numerator:   Σ (credits × points)  — failed courses contribute 0 points
 * - Denominator: Σ effective_credits
 *     passed  → credits
 *     failed  → credits × 2  (capped: even if failed multiple times, only counted once as ×2)
 *
 * courses: [{ course: { credits }, total, totalMax, passed }]
 * For courses repeated multiple times, caller should pass only the latest attempt
 * and mark failed ones; the ×2 penalty applies once per unique course.
 */
function calcGPA(courses) {
  // Group by course code to handle repeats — keep latest attempt per course
  const byCode = new Map();
  courses.forEach((c) => {
    const code = c.course?.code || c.course?._id?.toString() || Math.random();
    if (!byCode.has(code)) {
      byCode.set(code, c);
    } else {
      // keep the one with higher total (latest/best attempt)
      if ((c.total || 0) > (byCode.get(code).total || 0)) byCode.set(code, c);
    }
  });

  let numerator   = 0;
  let denominator = 0;

  byCode.forEach((c) => {
    const credits  = c.course?.credits || 0;
    const total    = c.total ?? 0;
    const totalMax = c.totalMax ?? 100;
    const points   = calcPoints(total, totalMax);
    const passed   = points > 0;

    numerator   += credits * points;
    denominator += passed ? credits : credits * 2;
  });

  return denominator > 0 ? (numerator / denominator).toFixed(2) : "0.00";
}

// PATCH /api/v1/grades/:enrollmentId — professor/admin updates grades
exports.updateGrades = async (req, res) => {
  try {
    const { grades_object } = req.body;
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
    if (enrollment.isFinalExamLocked)
      return res.status(403).json({ success: false, message: "Grades are locked" });

    enrollment.grades_object = grades_object;
    await enrollment.save();
    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/grades/:enrollmentId/lock — admin locks grades
exports.lockGrades = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.enrollmentId,
      { isGradeLocked: req.body.lock ?? true },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/grades/section/:sectionId — professor sees all students in a section
exports.getSectionGrades = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      section: req.params.sectionId,
      status: { $in: ["Enrolled", "Approved"] },
    })
      .populate("student", "name studentId")
      .lean();

    res.json({ success: true, enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Lock/Unlock Year Work for a student
exports.toggleYearWorkLock = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { isLocked } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({ path: "section", populate: { path: "course_id", select: "code title" } });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    enrollment.isYearWorkLocked = isLocked;
    enrollment.isGradeLocked = isLocked && enrollment.isFinalExamLocked;
    await enrollment.save();

    // Notify student when year work is locked (grades published)
    if (isLocked) {
      const courseLabel = enrollment.section?.course_id
        ? `${enrollment.section.course_id.code} — ${enrollment.section.course_id.title}`
        : "المادة";
      await notifyStudent(
        enrollment.student,
        req.user._id,
        `تم نشر درجات أعمال السنة — ${enrollment.section?.course_id?.code || ""}`,
        `تم نشر درجات أعمال السنة لمادة ${courseLabel}. تحقق من صفحة الدرجات.`
      );
    }

    res.json({ 
      success: true, 
      message: `Year work ${isLocked ? 'locked' : 'unlocked'} successfully`,
      enrollment 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lock/Unlock Final Exam for a student
exports.toggleFinalExamLock = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { isLocked } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({ path: "section", populate: { path: "course_id", select: "code title" } });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    enrollment.isFinalExamLocked = isLocked;
    enrollment.isGradeLocked = isLocked && enrollment.isYearWorkLocked;
    await enrollment.save();

    // Notify student when final exam is locked (grades published)
    if (isLocked) {
      const courseLabel = enrollment.section?.course_id
        ? `${enrollment.section.course_id.code} — ${enrollment.section.course_id.title}`
        : "المادة";
      await notifyStudent(
        enrollment.student,
        req.user._id,
        `تم نشر درجات الامتحان النهائي — ${enrollment.section?.course_id?.code || ""}`,
        `تم نشر درجات الامتحان النهائي لمادة ${courseLabel}. تحقق من صفحة الدرجات.`
      );
    }

    res.json({ 
      success: true, 
      message: `Final exam ${isLocked ? 'locked' : 'unlocked'} successfully`,
      enrollment 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Bulk lock/unlock year work for entire section
exports.bulkToggleYearWorkLock = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { isLocked } = req.body;

    const Section = require("../models/Section");
    const section = await Section.findById(sectionId)
      .populate("course_id", "code title").lean();

    const enrollments = await Enrollment.find({ section: sectionId });
    
    for (const enrollment of enrollments) {
      enrollment.isYearWorkLocked = isLocked;
      enrollment.isGradeLocked = isLocked && enrollment.isFinalExamLocked;
      await enrollment.save();
    }

    // Notify all students when bulk-locked
    if (isLocked && enrollments.length > 0) {
      const courseLabel = section?.course_id
        ? `${section.course_id.code} — ${section.course_id.title}`
        : "المادة";
      const title = `تم نشر درجات أعمال السنة — ${section?.course_id?.code || ""}`;
      const body = `تم نشر درجات أعمال السنة لمادة ${courseLabel}. تحقق من صفحة الدرجات.`;

      const studentIds = enrollments.map((e) => e.student);
      await Notification.insertMany(
        studentIds.map((id) => ({ recipient: id, sender: req.user._id, title, body, type: "system" }))
      );
      const students = await User.find(
        { _id: { $in: studentIds }, fcmToken: { $exists: true, $ne: null } },
        "fcmToken"
      ).lean();
      await Promise.allSettled(
        students.map((s) => sendPushNotification(s.fcmToken, title, body))
      );
    }

    res.json({ 
      success: true, 
      message: `Year work ${isLocked ? 'locked' : 'unlocked'} for ${enrollments.length} students`,
      modifiedCount: enrollments.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Bulk lock/unlock final exam for entire section
exports.bulkToggleFinalExamLock = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { isLocked } = req.body;

    const Section = require("../models/Section");
    const section = await Section.findById(sectionId)
      .populate("course_id", "code title").lean();

    const enrollments = await Enrollment.find({ section: sectionId });
    
    for (const enrollment of enrollments) {
      enrollment.isFinalExamLocked = isLocked;
      enrollment.isGradeLocked = isLocked && enrollment.isYearWorkLocked;
      await enrollment.save();
    }

    // Notify all students when bulk-locked
    if (isLocked && enrollments.length > 0) {
      const courseLabel = section?.course_id
        ? `${section.course_id.code} — ${section.course_id.title}`
        : "المادة";
      const title = `تم نشر درجات الامتحان النهائي — ${section?.course_id?.code || ""}`;
      const body = `تم نشر درجات الامتحان النهائي لمادة ${courseLabel}. تحقق من صفحة الدرجات.`;

      const studentIds = enrollments.map((e) => e.student);
      await Notification.insertMany(
        studentIds.map((id) => ({ recipient: id, sender: req.user._id, title, body, type: "system" }))
      );
      const students = await User.find(
        { _id: { $in: studentIds }, fcmToken: { $exists: true, $ne: null } },
        "fcmToken"
      ).lean();
      await Promise.allSettled(
        students.map((s) => sendPushNotification(s.fcmToken, title, body))
      );
    }

    res.json({ 
      success: true, 
      message: `Final exam ${isLocked ? 'locked' : 'unlocked'} for ${enrollments.length} students`,
      modifiedCount: enrollments.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET /api/v1/grades/my-summary — quick stats for student profile (GPA, current hours, remaining)
exports.getMySummary = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).populate('department').lean();
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const requiredCredits = student.department?.required_credits || 132;

    // Get active semester
    const activeSemester = await Semester.findOne({ is_active: true }).lean();

    // All enrollments for cumulative GPA + earned credits
    const allEnrollments = await Enrollment.find({
      student: req.user._id,
      status: { $in: ["Enrolled", "Approved"] },
    })
      .populate({
        path: 'section',
        populate: [
          { path: 'course_id', select: 'credits' },
          { path: 'semester_id', select: '_id' },
        ],
      })
      .lean();

    let totalCreditsEarned    = 0;
    let totalGradePoints      = 0;
    let totalCreditsAttempted = 0;
    let currentSemesterHours  = 0;

    // Group by course to apply the ×2 penalty only once per failed course
    const courseMap = new Map(); // courseId → best enrollment

    for (const e of allEnrollments) {
      if (!e.section?.course_id) continue;
      const credits  = e.section.course_id.credits || 0;
      const courseId = e.section.course_id._id?.toString();

      // Current semester registered hours
      if (activeSemester && e.section.semester_id?._id?.toString() === activeSemester._id.toString()) {
        currentSemesterHours += credits;
      }

      if (!e.isFinalExamLocked) continue;

      const g      = e.grades_object || {};
      const total  = parseFloat(g.final_total ?? 0);
      const points = calcPoints(total, 100);

      // Keep best attempt per course
      const existing = courseMap.get(courseId);
      if (!existing || total > (existing.total || 0)) {
        courseMap.set(courseId, { credits, total, points });
      }
    }

    courseMap.forEach(({ credits, total, points }) => {
      const passed = points > 0;
      totalGradePoints      += credits * points;
      totalCreditsAttempted += passed ? credits : credits * 2;
      if (passed) totalCreditsEarned += credits;
    });

    const cumulativeGPA = totalCreditsAttempted > 0
      ? parseFloat((totalGradePoints / totalCreditsAttempted).toFixed(2))
      : 0;

    const remainingCredits = Math.max(0, requiredCredits - totalCreditsEarned);
    const completionPercentage = parseFloat(((totalCreditsEarned / requiredCredits) * 100).toFixed(1));

    res.json({
      success: true,
      summary: {
        cumulativeGPA,
        currentSemesterHours,
        totalCreditsEarned,
        requiredCredits,
        remainingCredits,
        completionPercentage,
        activeSemester: activeSemester ? `${activeSemester.term} ${activeSemester.year}` : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/grades/academic-record/:studentId — Get complete academic record
exports.getAcademicRecord = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get student info with department
    const student = await User.findById(studentId).populate('department').lean();
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Get all semesters
    const semesters = await Semester.find().sort({ year: 1, term: 1 }).lean();

    // Get all enrollments for this student
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: 'section',
        populate: [
          { path: 'course_id', select: 'title code credits' },
          { path: 'semester_id', select: 'term year' }
        ]
      })
      .lean();

    // Group by semester
    const semesterRecords = [];
    let totalCreditsEarned = 0;
    let totalGradePoints = 0;
    let totalCreditsAttempted = 0;

    for (const sem of semesters) {
      const semEnrollments = enrollments.filter(e => 
        e.section?.semester_id?._id?.toString() === sem._id.toString()
      );

      if (semEnrollments.length === 0) continue;

      const courses = await Promise.all(
        semEnrollments.map(async (e) => {
          const g = e.grades_object || {};
          const cfg = await GradeConfig.findOne({ section_id: e.section._id }).lean();
          const ywMax    = cfg?.year_work_max || 40;
          const finalMax = cfg?.final_max || 60;
          const totalMax = ywMax + finalMax;
          const total    = parseFloat(g.final_total ?? 0);
          const points   = calcPoints(total, totalMax);
          const letter   = g.letter_grade || calcLetter(total, totalMax);
          const credits  = e.section.course_id?.credits || 0;
          const passed   = points > 0;

          return {
            courseCode:  e.section.course_id?.code,
            courseTitle: e.section.course_id?.title,
            credits,
            grade: letter,
            gradePoint: points,
            total,
            totalMax,
            passed,
            isLocked: e.isFinalExamLocked,
            status: e.status,
          };
        })
      );

      // Semester GPA — apply ×2 penalty for failed courses
      let semNumerator   = 0;
      let semDenominator = 0;
      courses.forEach((c) => {
        if (!c.isLocked) return;
        semNumerator   += c.credits * c.gradePoint;
        semDenominator += c.passed ? c.credits : c.credits * 2;
      });
      const semGPA = semDenominator > 0 ? (semNumerator / semDenominator).toFixed(2) : "0.00";

      // Cumulative totals
      const earnedCredits = courses.filter(c => c.passed && c.isLocked).reduce((s, c) => s + c.credits, 0);
      totalCreditsEarned  += earnedCredits;
      totalGradePoints    += semNumerator;
      totalCreditsAttempted += semDenominator;

      semesterRecords.push({
        semester: sem,
        courses,
        semesterGPA: semGPA,
        creditsEarned:    earnedCredits,
        creditsAttempted: semDenominator,
      });
    }

    // Calculate cumulative GPA
    const cumulativeGPA = totalCreditsAttempted > 0 
      ? (totalGradePoints / totalCreditsAttempted).toFixed(2) 
      : "0.00";

    // Calculate remaining credits
    const requiredCredits = student.department?.required_credits || 132;
    const remainingCredits = Math.max(0, requiredCredits - totalCreditsEarned);

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        department: student.department?.name,
        departmentCode: student.department?.code,
      },
      summary: {
        cumulativeGPA,
        totalCreditsEarned,
        totalCreditsAttempted,
        requiredCredits,
        remainingCredits,
        completionPercentage: ((totalCreditsEarned / requiredCredits) * 100).toFixed(1),
      },
      semesterRecords,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/grades/admin/final-lock-status — admin sees final lock status for all sections in active semester
exports.getFinalLockStatus = async (req, res) => {
  try {
    const semester = await Semester.findOne({ is_active: true }).lean();
    if (!semester) return res.status(404).json({ success: false, message: "No active semester found" });

    const Section = require("../models/Section");
    const sections = await Section.find({ semester_id: semester._id })
      .populate("course_id", "title code credits")
      .populate("instructor_id", "name email")
      .lean();

    const results = await Promise.all(
      sections.map(async (sec) => {
        const enrollments = await Enrollment.find({
          section: sec._id,
          status: { $in: ["Enrolled", "Approved"] },
        }).lean();

        const total = enrollments.length;
        const finalLocked = enrollments.filter((e) => e.isFinalExamLocked).length;
        const fullyLocked = enrollments.filter((e) => e.isGradeLocked).length;

        // Check if final grades have been entered (at least one student has final grade)
        const hasGradesEntered = enrollments.some(
          (e) => e.grades_object?.final_exam != null && e.grades_object?.final_exam !== ""
        );

        return {
          sectionId: sec._id,
          sectionNumber: sec.sectionNumber,
          course: sec.course_id,
          instructor: sec.instructor_id,
          day: sec.day,
          startTime: sec.start_time,
          endTime: sec.end_time,
          totalStudents: total,
          finalLockedCount: finalLocked,
          fullyLockedCount: fullyLocked,
          hasGradesEntered,
          isFinalFullyLocked: total > 0 && finalLocked === total,
          isFullyLocked: total > 0 && fullyLocked === total,
        };
      })
    );

    res.json({ success: true, semester, sections: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper function to convert letter grade to grade point
function letterToGradePoint(letter) {
  const gradeMap = {
    'A+': 4.0, 'A': 4.0,
    'B+': 3.5, 'B': 3.0,
    'C+': 2.5, 'C': 2.0,
    'D': 1.0,
    'F': 0.0,
  };
  return gradeMap[letter] || 0.0;
}
