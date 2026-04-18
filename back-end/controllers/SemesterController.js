const Semester = require("../models/Semester");

// جلب جميع الترمات
exports.getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find().sort({ year: -1, term: 1 });
    return res.status(200).json({
      success: true,
      semesters,
    });
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching semesters",
      error: error.message,
    });
  }
};

// جلب ترم بالـ ID
exports.getSemesterById = async (req, res) => {
  try {
    const { id } = req.params;
    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }
    return res.status(200).json({
      success: true,
      semester,
    });
  } catch (error) {
    console.error("Error fetching semester:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching semester",
      error: error.message,
    });
  }
};

// إنشاء ترم جديد
exports.createSemester = async (req, res) => {
  try {
    const {
      year,
      term,
      is_active,
      start_date,
      end_date,
      max_credits_rules,
      add_drop_start,
      add_drop_end,
      course_visibility_levels,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (
      !year ||
      !term ||
      !start_date ||
      !end_date ||
      !add_drop_start ||
      !add_drop_end
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // إنشاء الترم الجديد
    const newSemester = new Semester({
      year,
      term,
      is_active: is_active || false,
      start_date,
      end_date,
      max_credits_rules,
      add_drop_start,
      add_drop_end,
      ...(course_visibility_levels && { course_visibility_levels }),
    });

    // حفظ الترم
    const savedSemester = await newSemester.save();

    return res.status(201).json({
      success: true,
      message: "Semester created successfully",
      semester: savedSemester,
    });
  } catch (error) {
    console.error("Error creating semester:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating semester",
      error: error.message,
    });
  }
};

// تحديث ترم
exports.updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSemester = await Semester.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedSemester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Semester updated successfully",
      semester: updatedSemester,
    });
  } catch (error) {
    console.error("Error updating semester:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating semester",
      error: error.message,
    });
  }
};

// حذف ترم
exports.deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSemester = await Semester.findByIdAndDelete(id);
    if (!deletedSemester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Semester deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting semester:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting semester",
      error: error.message,
    });
  }
};

// جلب الترم النشط الحالي
exports.getActiveSemester = async (req, res) => {
  try {
    const semester = await Semester.findOne({ is_active: true });
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "No active semester found",
      });
    }
    return res.status(200).json({
      success: true,
      semester,
    });
  } catch (error) {
    console.error("Error fetching active semester:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching active semester",
      error: error.message,
    });
  }
};

// تفعيل ترم معين (وإلغاء تفعيل الباقي)
exports.setActiveSemester = async (req, res) => {
  try {
    const { id } = req.params;
    
    // إلغاء تفعيل جميع الترمات
    await Semester.updateMany({}, { is_active: false });
    
    // تفعيل الترم المحدد
    const semester = await Semester.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true }
    );
    
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Active semester updated successfully",
      semester,
    });
  } catch (error) {
    console.error("Error setting active semester:", error);
    return res.status(500).json({
      success: false,
      message: "Error setting active semester",
      error: error.message,
    });
  }
};

// تبديل عرض النتائج النهائية
exports.toggleFinalResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { show_final_results } = req.body;

    const semester = await Semester.findByIdAndUpdate(
      id,
      { show_final_results },
      { new: true }
    );

    if (!semester) {
      return res.status(404).json({ success: false, message: "Semester not found" });
    }

    // Notify ALL students in the system when results are shown
    if (show_final_results) {
      try {
        const Notification = require("../models/Notification");
        const User         = require("../models/User");
        const Role         = require("../models/Role");
        const { sendPushNotification } = require("../services/notificationService");

        const studentRole = await Role.findOne({ name: "student" }).lean();
        if (studentRole) {
          const students = await User.find(
            { role: studentRole._id, is_active: true },
            "_id fcmToken"
          ).lean();

          const title = `Final Results Available — ${semester.term} ${semester.year}`;
          const body  = `Your final results for ${semester.term} ${semester.year} are now available. Check your results page.`;

          await Notification.insertMany(
            students.map((s) => ({ recipient: s._id, title, body, type: "system" }))
          );

          const withToken = students.filter((s) => s.fcmToken);
          if (withToken.length > 0) {
            await Promise.allSettled(
              withToken.map((s) => sendPushNotification(s.fcmToken, title, body))
            );
          }
        }
      } catch (notifErr) {
        console.error("Failed to send final results notifications:", notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Final results ${show_final_results ? "enabled" : "disabled"} successfully`,
      semester,
    });
  } catch (error) {
    console.error("Error toggling final results:", error);
    return res.status(500).json({ success: false, message: "Error toggling final results", error: error.message });
  }
};
