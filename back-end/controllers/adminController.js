const AllowedUser = require("../models/AllowedStudentModel");

// إضافة طالب واحد مسموح له بالتسجيل
exports.addAllowedStudent = async (req, res) => {
  try {
    const { studentId, email } = req.body;

    // التأكد إذا كان موجوداً مسبقاً
    const existing = await AllowedUser.findOne({ studentId });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Student ID already in the allowlist.",
        });
    }

    const newAllowedStudent = await AllowedUser.create({
      studentId,
      email,
      addedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: newAllowedStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// إضافة قائمة طلاب (مثلاً من ملف Excel أو Array)
exports.bulkAddAllowedStudents = async (req, res) => {
  try {
    const { studentsList } = req.body; // Array of objects [{studentId: '123'}, {studentId: '456'}]

    // استخدام insertMany لإضافة الكل مرة واحدة (أسرع)
    const result = await AllowedUser.insertMany(studentsList, {
      ordered: false,
    });

    res.status(201).json({
      success: true,
      message: `${result.length} students added to the allowlist.`,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Some IDs might be duplicates or invalid.",
        error: error.message,
      });
  }
};
