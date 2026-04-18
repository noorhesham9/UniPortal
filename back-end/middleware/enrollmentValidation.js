const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");
const Course = require("../models/course.model");
const RegistrationSlice = require("../models/RegistrationSlice");

// maximum credit hours a student may register for in one semester
const MAX_CREDITS = process.env.MAX_CREDITS
  ? parseInt(process.env.MAX_CREDITS, 10)
  : 18;

// helper to convert "HH:MM" string to minutes
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * middleware used on enrollment creation endpoint.
 * - ensures the requesting student has paid fees
 * - prevents credit-hour limit exceedance
 * - prevents time clashes with existing registrations
 * - checks that the student belongs to an active registration slice
 */
exports.checkEnrollmentEligibility = async (req, res, next) => {
  try {
    const studentId = req.body.student || req.user?._id;
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }
    req.body.student = studentId;

    // load user to examine fee status and other info
    const user = await require("../models/User").findById(studentId);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 1. fees must be paid
    if (!user.feesPaid) {
      return res
        .status(403)
        .json({
          message: "Payment of tuition/fees is required before enrollment",
        });
    }

    // 2. check registration slice membership
    const now = new Date();
    const activeSlices = await RegistrationSlice.find({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
    });

    // No active slice = registration is closed for everyone
    if (activeSlices.length === 0) {
      return res.status(403).json({
        message: "Registration is currently closed. No active registration window.",
      });
    }

    // Check if student belongs to any of the active slices
    let allowed = false;
    for (const slice of activeSlices) {
      const studentGpa = user.gpa ?? 0;

      const gpaOk = studentGpa >= slice.min_gpa && studentGpa <= slice.max_gpa;

      const deptOk =
        !slice.departments?.length ||
        (user.department && slice.departments.some((id) => id.equals(user.department)));

      const levelOk =
        !slice.levels?.length ||
        slice.levels.includes(user.level);

      const studentOk =
        slice.students?.length > 0 &&
        slice.students.some((id) => id.equals(user._id));

      if (gpaOk && (studentOk || (deptOk && levelOk))) {
        allowed = true;
        break;
      }
    }

    if (!allowed) {
      // Build specific reasons for the student
      const reasons = [];
      for (const slice of activeSlices) {
        const studentGpa = user.gpa ?? 0;
        if (studentGpa < slice.min_gpa || studentGpa > slice.max_gpa) {
          reasons.push(`Your GPA (${studentGpa.toFixed(2)}) is outside the required range (${slice.min_gpa} – ${slice.max_gpa})`);
        }
        const deptOk =
          !slice.departments?.length ||
          (user.department && slice.departments.some((id) => id.equals(user.department)));
        if (!deptOk) {
          reasons.push(`Your department is not included in the active registration window`);
        }
        const levelOk =
          !slice.levels?.length ||
          slice.levels.includes(user.level);
        if (!levelOk) {
          reasons.push(`Your academic level (${user.level || "—"}) is not eligible. Allowed levels: ${slice.levels.join(", ")}`);
        }
      }

      return res.status(403).json({
        message: reasons.length > 0
          ? reasons.join(" | ")
          : "You are not eligible for the current registration window.",
        reasons,
      });
    }

    // 3. gather the section the student is trying to enroll in
    const { section: sectionId } = req.body;
    if (!sectionId) {
      return res.status(400).json({ message: "Section ID is required" });
    }
    const section = await Section.findById(sectionId).populate("course_id");
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // 4. compute current registered hours for this semester
    const existingEnrollments = await Enrollment.find({
      student: studentId,
      status: { $in: ["Enrolled", "Approved", "Pending"] },
    }).populate({
      path: "section",
      populate: { path: "course_id", select: "credits semester_id" },
    });

    let totalCredits = 0;
    existingEnrollments.forEach((enr) => {
      if (
        enr.section &&
        enr.section.course_id &&
        enr.section.course_id.credits
      ) {
        totalCredits += enr.section.course_id.credits;
      }
    });

    // add the credits of the section we are attempting to register to
    if (section.course_id && section.course_id.credits) {
      totalCredits += section.course_id.credits;
    }

    if (totalCredits > MAX_CREDITS) {
      return res
        .status(400)
        .json({ message: `Credit limit exceeded (${MAX_CREDITS} hrs)` });
    }

    // 5. time conflict - only check against enrollments in the same semester
    const semesterId = section.semester_id;
    const sameSemSections = existingEnrollments
      .filter(
        (enr) =>
          enr.section &&
          enr.section.semester_id &&
          enr.section.semester_id.equals(semesterId),
      )
      .map((enr) => enr.section);

    const newStart = timeToMinutes(section.start_time);
    const newEnd = timeToMinutes(section.end_time);

    for (const sec of sameSemSections) {
      const start = timeToMinutes(sec.start_time);
      const end = timeToMinutes(sec.end_time);
      if (sec.day === section.day && newStart < end && newEnd > start) {
        return res.status(400).json({
          message: `Time conflict with section ${sec._id} (${sec.day} ${sec.start_time}-${sec.end_time})`,
        });
      }
    }

    // passed all the checks
    next();
  } catch (err) {
    console.error("enrollment eligibility check failed", err);
    res.status(500).json({ message: err.message });
  }
};
