const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendPushNotification } = require("../services/notificationService");
const { emitToUser } = require("../socket");

exports.updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res
      .status(200)
      .json({ status: "success", message: "FCM Token updated successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Send notification to one or more students (saves to DB + push)
exports.sendAdvisorNotification = async (req, res) => {
  try {
    const { studentIds, title, body } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "studentIds array is required" });
    }
    if (!title || !body) {
      return res
        .status(400)
        .json({ status: "error", message: "title and body are required" });
    }

    const senderRole = req.user?.role?.name || "system";
    const type = ["admin", "super_admin"].includes(senderRole)
      ? "admin"
      : "advisor";

    // Save to DB for each recipient
    const saved = await Notification.insertMany(
      studentIds.map((id) => ({
        recipient: id,
        sender: req.user._id,
        title,
        body,
        type,
      })),
    );

    // Emit real-time socket event to each recipient
    saved.forEach((notif) => {
      emitToUser(String(notif.recipient), "new_notification", {
        _id: notif._id,
        title: notif.title,
        body: notif.body,
        type: notif.type,
        isRead: false,
        createdAt: notif.createdAt,
      });
    });

    // Send push notifications
    const students = await User.find(
      { _id: { $in: studentIds }, fcmToken: { $exists: true, $ne: null } },
      "name fcmToken",
    );

    let sent = 0,
      failed = 0;
    if (students.length > 0) {
      const results = await Promise.allSettled(
        students.map((s) => sendPushNotification(s.fcmToken, title, body)),
      );
      sent = results.filter((r) => r.status === "fulfilled").length;
      failed = results.filter((r) => r.status === "rejected").length;
    }

    res.status(200).json({
      status: "success",
      message: `Notification sent to ${studentIds.length} student(s)`,
      sent,
      failed,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get my notifications (for the logged-in user)
exports.getMyNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .populate("sender", "name role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: req.user._id }),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.json({ success: true, notifications, total, unreadCount, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification(s) as read
exports.markAsRead = async (req, res) => {
  try {
    const { ids } = req.body; // array of notification IDs, or empty to mark all

    if (ids && ids.length > 0) {
      await Notification.updateMany(
        { _id: { $in: ids }, recipient: req.user._id },
        { isRead: true },
      );
    } else {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true },
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get students list — professors see only their advisees, admins see all
exports.getStudents = async (req, res) => {
  try {
    const roleName = req.user?.role?.name;
    const isAdmin = roleName === "admin" || roleName === "super_admin";

    const Role = require("../models/Role");
    const studentRole = await Role.findOne({ name: "student" }).lean();
    if (!studentRole)
      return res.status(200).json({ status: "success", data: [] });

    let query = { role: studentRole._id };

    // Professors only see students they are assigned as advisor to
    if (!isAdmin) {
      query.advisor = req.user._id;
    }

    const students = await User.find(
      query,
      "name studentId email department advisor",
    ).lean();

    res.status(200).json({ status: "success", data: students });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Auto-notify all enrolled students in a section when grades are saved
// POST /api/notifications/section-grades
exports.notifySectionGrades = async (req, res) => {
  try {
    const { sectionId, type } = req.body; // type: "year_work" | "final"
    if (!sectionId)
      return res
        .status(400)
        .json({ success: false, message: "sectionId is required" });

    const Enrollment = require("../models/Enrollment");
    const Section = require("../models/Section");

    const section = await Section.findById(sectionId)
      .populate("course_id", "code title")
      .lean();
    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    const enrollments = await Enrollment.find({
      section: sectionId,
      status: { $in: ["Enrolled", "Approved"] },
    })
      .select("student")
      .lean();

    if (enrollments.length === 0) return res.json({ success: true, sent: 0 });

    const studentIds = enrollments.map((e) => e.student);
    const courseLabel = section.course_id
      ? `${section.course_id.code} — ${section.course_id.title}`
      : "your course";

    const title =
      type === "final"
        ? `Final Exam Grades Posted — ${section.course_id?.code || ""}`
        : `Year Work Grades Updated — ${section.course_id?.code || ""}`;

    const body =
      type === "final"
        ? `Your final exam grades for ${courseLabel} have been submitted. Check your grades page.`
        : `Your year work grades for ${courseLabel} have been updated. Check your grades page.`;

    const saved2 = await Notification.insertMany(
      studentIds.map((id) => ({
        recipient: id,
        sender: req.user._id,
        title,
        body,
        type: "system",
      })),
    );

    // Emit real-time socket event to each recipient
    saved2.forEach((notif) => {
      emitToUser(String(notif.recipient), "new_notification", {
        _id: notif._id,
        title: notif.title,
        body: notif.body,
        type: notif.type,
        isRead: false,
        createdAt: notif.createdAt,
      });
    });

    // Push notifications
    const students = await User.find(
      { _id: { $in: studentIds }, fcmToken: { $exists: true, $ne: null } },
      "fcmToken",
    ).lean();

    if (students.length > 0) {
      await Promise.allSettled(
        students.map((s) => sendPushNotification(s.fcmToken, title, body)),
      );
    }

    res.json({ success: true, sent: studentIds.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
