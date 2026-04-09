const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");
const User = require("../models/User");
const { sendPushNotification } = require("../services/notificationService"); // جلب تسجيلات الطالب الحالي (للعرض في واجهة التسجيل)
exports.getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { semesterId } = req.query;
    const query = { student: studentId };
    if (semesterId) {
      const enrollments = await Enrollment.find(query)
        .populate({
          path: "section",
          match: { semester_id: semesterId },
          populate: [
            { path: "course_id", select: "code title credits" },
            { path: "instructor_id", select: "name" },
            { path: "room_id", select: "room_number type capacity" },
          ],
        })
        .sort({ createdAt: -1 })
        .lean();
      const filtered = enrollments.filter((e) => e.section != null);
      return res.status(200).json({ success: true, enrollments: filtered });
    }
    const enrollments = await Enrollment.find(query)
      .populate({
        path: "section",
        populate: [
          { path: "course_id", select: "code title credits" },
          { path: "instructor_id", select: "name" },
          { path: "room_id", select: "room_number type capacity" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, enrollments });
  } catch (error) {
    console.error("Error fetching my enrollments:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching enrollments",
      error: error.message,
    });
  }
};

// Task 1: تسجيل طالب في سكشن
exports.createEnrollment = async (req, res) => {
  try {
    const { student, section } = req.body;

    // تشيك لو الطالب مسجل في نفس السكشن قبل كده
    const existingEnrollment = await Enrollment.findOne({ student, section });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Student already enrolled in this section" });
    }

    // نتحقق أولاً من سعة السكشن
    const sectionDoc = await Section.findById(section);
    if (!sectionDoc) {
      return res.status(404).json({ message: "Section not found" });
    }

    const enrolledCount = await Enrollment.countDocuments({
      section,
      status: { $in: ["Enrolled", "Approved"] },
    });

    let statusToUse = "Enrolled";
    if (enrolledCount >= sectionDoc.capacity) {
      statusToUse = "Waitlist";
    }

    const enrollment = await Enrollment.create({
      student,
      section,
      status: statusToUse,
    });

    if (statusToUse === "Enrolled") {
      const studentUser = await User.findById(student);
      if (studentUser && studentUser.fcmToken) {
        await sendPushNotification(
          studentUser.fcmToken,
          "!تم قبولك",
          "تم تسجيلك في السكشن بنجاح.",
        );
      }
    }

    if (statusToUse === "Waitlist") {
      return res
        .status(200)
        .json({ message: "Section full, added to waitlist", enrollment });
    }

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Task 3: الـ Advisor يوافق على التسجيل ويضيف notes
exports.approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { advisor_notes } = req.body;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.status = "Approved";
    enrollment.advisor_notes = advisor_notes || "";
    await enrollment.save();
    // إشعار ملاحظات المرشد (قبول أو رفض)
    const studentUser = await User.findById(enrollment.student);
    if (studentUser && studentUser.fcmToken) {
      const title =
        enrollment.status === "Approved" ? "تم قبول جدولك" : "تنبيه من المرشد";
      const body = `ملاحظات المرشد: ${enrollment.advisor_notes || "لا يوجد ملاحظات "}`;

      try {
        await sendPushNotification(studentUser.fcmToken, title, body);
      } catch (err) {
        console.log("Notification failed but data saved:", err.message);
      }
    }
    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Task 2: تحديث الدرجات مع التحقق من isGradeLocked
exports.updateGrades = async (req, res) => {
  try {
    const { id } = req.params;
    const { grades_object } = req.body;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (enrollment.isGradeLocked) {
      return res
        .status(400)
        .json({ message: "Grades are locked and cannot be modified" });
    }

    enrollment.grades_object = grades_object;
    await enrollment.save();

    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Task 4: Virtual field جيب الساعات المنجازه  للطالب عن طريق الـ
exports.getCompletedHours = async (req, res) => {
  try {
    const { studentId } = req.params;

    const enrollments = await Enrollment.find({
      student: studentId,
      status: "Approved",
    });

    const totalHours = enrollments.reduce((total, enrollment) => {
      return total + (enrollment.completed_hours || 0);
    }, 0);

    res.status(200).json({ totalCompletedHours: totalHours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 1. طلب انضمام لقائمة الانتظار
exports.joinWaitlist = async (req, res) => {
  try {
    const { student, section } = req.body;
    const existing = await Enrollment.findOne({ student, section });
    if (existing) {
      return res.status(400).json({
        message: "You are already enrolled or in the waitlist for this section",
      });
    }
    const enrollment = await Enrollment.create({
      student,
      section,
      status: "Waitlist",
    });
    res
      .status(201)
      .json({ message: "Added to waitlist successfully", enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. الخروج من قائمة الانتظار
exports.leaveWaitlist = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    if (!enrollment || enrollment.status !== "Waitlist") {
      return res
        .status(404)
        .json({ message: "Record not found or student is not in waitlist" });
    }
    await Enrollment.findByIdAndDelete(id);
    res.status(200).json({ message: "Left waitlist successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// utility used by several endpoints when a spot frees up
async function promoteNextFromWaitlist(sectionId) {
  // find the oldest waitlist entry for this section
  const next = await Enrollment.findOne({
    section: sectionId,
    status: "Waitlist",
  }).sort("createdAt");

  if (!next) return;

  next.status = "Enrolled";
  await next.save();

  const studentUser = await User.findById(next.student);
  if (studentUser && studentUser.fcmToken) {
    try {
      await sendPushNotification(
        studentUser.fcmToken,
        "!تم قبولك",
        "تمت ترقيتك من قائمة الانتظار وأصبحت مسجلاً في السكشن الآن.",
      );
    } catch (err) {
      console.log("Notification failed during auto-promotion:", err.message);
    }
  }
}

// expose helper for other modules
exports.promoteNextFromWaitlist = promoteNextFromWaitlist;

// 3. جلب ترتيب الطالب الحالي
exports.getWaitlistRank = async (req, res) => {
  try {
    const { id } = req.params;
    const myEnrollment = await Enrollment.findById(id);
    if (!myEnrollment || myEnrollment.status !== "Waitlist") {
      return res.status(404).json({ message: "Student is not in waitlist" });
    }
    const rank = await Enrollment.countDocuments({
      section: myEnrollment.section,
      status: "Waitlist",
      createdAt: { $lt: myEnrollment.createdAt },
    });
    res.status(200).json({ rank: rank + 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. حذف تسجيل (drop) ويقوم بترقية طالب من الويتب ليست
exports.deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    const sectionId = enrollment.section;
    await Enrollment.findByIdAndDelete(id);

    // بعد المسح، نترقى طالب من الويتب ليست إذا وجد
    await promoteNextFromWaitlist(sectionId);

    res.status(200).json({ message: "Enrollment dropped" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get academic records (GPA, semesters, grades)
exports.getAcademicRecords = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch all approved enrollments with populated section and course data
    const enrollments = await Enrollment.find({
      student: studentId,
      status: "Approved",
    })
      .populate({
        path: "section",
        populate: [
          { path: "course_id", select: "code title credits" },
          { path: "semester_id", select: "year term is_active" },
        ],
      })
      .sort({ createdAt: -1 });

    if (!enrollments || enrollments.length === 0) {
      return res.status(200).json({
        success: true,
        cumulativeGPA: 0,
        totalCredits: 0,
        averageGrade: "N/A",
        semesters: [],
      });
    }

    // Group enrollments by semester
    const semesterMap = {};
    let totalGradePoints = 0;
    let totalCredits = 0;
    const gradeToPoint = {
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      D: 1.0,
      F: 0.0,
    };

    enrollments.forEach((enrollment) => {
      if (enrollment.section?.semester_id) {
        const semester = enrollment.section.semester_id;
        const semesterId = semester._id.toString();
        const credit = enrollment.section.course_id?.credits || 0;
        const grade = enrollment.grades_object?.grade || "N/A";
        const gradePoint = gradeToPoint[grade] ?? 0;

        if (!semesterMap[semesterId]) {
          semesterMap[semesterId] = {
            _id: semesterId,
            year: semester.year,
            term: semester.term,
            displayName: `${semester.term} ${semester.year}`,
            isActive: semester.is_active,
            courses: [],
            totalCredits: 0,
            totalGradePoints: 0,
          };
        }

        semesterMap[semesterId].courses.push({
          code: enrollment.section.course_id?.code,
          title: enrollment.section.course_id?.title,
          credits: credit,
          grade: grade,
          gradePoint: gradePoint,
        });

        semesterMap[semesterId].totalCredits += credit;
        semesterMap[semesterId].totalGradePoints += gradePoint * credit;

        totalCredits += credit;
        totalGradePoints += gradePoint * credit;
      }
    });

    // Calculate GPA for each semester
    const semesters = Object.values(semesterMap).map((sem) => ({
      ...sem,
      gpa:
        sem.totalCredits > 0
          ? (sem.totalGradePoints / sem.totalCredits).toFixed(2)
          : 0,
    }));

    // Sort semesters by year and term (most recent first)
    semesters.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      const termOrder = { Fall: 3, Spring: 2, Summer: 1 };
      return (termOrder[b.term] || 0) - (termOrder[a.term] || 0);
    });

    // Calculate cumulative GPA and average grade
    const cumulativeGPA =
      totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

    // Calculate average grade letter
    const averageGradePoint = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    let averageGrade = "N/A";
    if (averageGradePoint >= 3.7) averageGrade = "A";
    else if (averageGradePoint >= 3.3) averageGrade = "B+";
    else if (averageGradePoint >= 3.0) averageGrade = "B";
    else if (averageGradePoint >= 2.7) averageGrade = "B-";
    else if (averageGradePoint >= 2.3) averageGrade = "C+";
    else if (averageGradePoint >= 2.0) averageGrade = "C";
    else if (averageGradePoint >= 1.7) averageGrade = "C-";
    else if (averageGradePoint >= 1.0) averageGrade = "D";
    else if (averageGradePoint > 0) averageGrade = "F";

    res.status(200).json({
      success: true,
      cumulativeGPA: parseFloat(cumulativeGPA),
      totalCredits,
      averageGrade,
      semesters,
    });
  } catch (error) {
    console.error("Error fetching academic records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching academic records",
      error: error.message,
    });
  }
};

// Get current semester grades (coursework and final exam)
exports.getCurrentSemesterGrades = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch active semester
    const activeSemester = await require("../models/Semester").findOne({
      is_active: true,
    });

    if (!activeSemester) {
      return res.status(200).json({
        success: true,
        semester: {},
        courses: [],
        averageCoursework: 0,
        averageFinal: 0,
        overallAverage: 0,
      });
    }

    // Fetch enrollments for current semester
    const enrollments = await Enrollment.find({
      student: studentId,
      status: "Approved",
    })
      .populate({
        path: "section",
        match: { semester_id: activeSemester._id },
        populate: [
          { path: "course_id", select: "code title credits" },
          { path: "semester_id", select: "year term is_active" },
        ],
      })
      .lean();

    // Filter only current semester enrollments with valid sections
    const currentSemesterEnrollments = enrollments.filter((e) => e.section != null);

    const courses = currentSemesterEnrollments.map((enrollment) => ({
      _id: enrollment._id,
      code: enrollment.section.course_id?.code || "N/A",
      title: enrollment.section.course_id?.title || "Course",
      coursework: enrollment.grades_object?.coursework || 0,
      final: enrollment.grades_object?.final || 0,
      total: (enrollment.grades_object?.coursework || 0) + (enrollment.grades_object?.final || 0),
    }));

    // Calculate averages
    let averageCoursework = 0;
    let averageFinal = 0;
    let totalOverall = 0;

    if (courses.length > 0) {
      averageCoursework =
        courses.reduce((sum, course) => sum + (course.coursework || 0), 0) /
        courses.length;
      averageFinal =
        courses.reduce((sum, course) => sum + (course.final || 0), 0) /
        courses.length;
      totalOverall =
        courses.reduce((sum, course) => sum + course.total, 0) / courses.length;
    }

    res.status(200).json({
      success: true,
      semester: {
        year: activeSemester.year,
        term: activeSemester.term,
        displayName: `${activeSemester.term} ${activeSemester.year}`,
        isActive: activeSemester.is_active,
      },
      courses,
      averageCoursework: parseFloat(averageCoursework.toFixed(2)),
      averageFinal: parseFloat(averageFinal.toFixed(2)),
      overallAverage: parseFloat(totalOverall.toFixed(2)),
    });
  } catch (error) {
    console.error("Error fetching current semester grades:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching current semester grades",
      error: error.message,
    });
  }
};
