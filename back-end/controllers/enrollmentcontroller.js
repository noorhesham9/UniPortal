const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");
const User = require("../models/User");
const { sendPushNotification } = require("../services/notificationService");

// Admin: get all enrollments with filters
exports.getAllEnrollments = async (req, res) => {
  try {
    const { semesterId, status, search, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build section filter first if semesterId provided
    let sectionIds;
    if (semesterId) {
      const sections = await Section.find({ semester_id: semesterId }).select("_id").lean();
      sectionIds = sections.map((s) => s._id);
    }

    const query = {};
    if (sectionIds) query.section = { $in: sectionIds };
    if (status) query.status = status;

    // If search, find matching students first
    if (search) {
      const students = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { studentId: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id").lean();
      query.student = { $in: students.map((s) => s._id) };
    }

    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate({ path: "student", select: "name studentId email" })
        .populate({
          path: "section",
          populate: [
            { path: "course_id", select: "code title credits" },
            { path: "instructor_id", select: "name" },
            { path: "room_id", select: "room_name building_section type" },
            { path: "semester_id", select: "term year" },
          ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Enrollment.countDocuments(query),
    ]);

    return res.status(200).json({ success: true, enrollments, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// جلب تسجيلات الطالب الحالي (للعرض في واجهة التسجيل)
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
            { path: "room_id", select: "room_name building_section type capacity" },
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
          { path: "room_id", select: "room_name building_section type capacity" },
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

// Admin direct enrollment — bypasses all eligibility checks (capacity, slice, fees, conflicts)
exports.adminEnrollStudent = async (req, res) => {
  try {
    const { studentId, sectionId } = req.body;
    if (!studentId || !sectionId) {
      return res.status(400).json({ message: "studentId and sectionId are required" });
    }

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const existing = await Enrollment.findOne({ student: studentId, section: sectionId });
    if (existing) {
      return res.status(400).json({ message: "Student is already enrolled in this section" });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      section: sectionId,
      status: "Enrolled",
    });

    const populated = await enrollment.populate([
      { path: "student", select: "name studentId email" },
      { path: "section", populate: [{ path: "course_id", select: "code title credits" }] },
    ]);

    res.status(201).json({ success: true, enrollment: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
