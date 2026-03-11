const AllowedUser = require("../models/AllowedStudentModel");
const Department = require("../models/Department");

// إضافة طالب واحد مسموح له بالتسجيل

exports.getAllowedStudents = async (req, res) => {
  try {
    const stats = await AllowedUser.aggregate([
      {
        // 1. ربط جدول المسموح لهم بجدول المستخدمين الحقيقيين
        $lookup: {
          from: "users", // تأكد أن هذا هو اسم الكولكشن في قاعدة البيانات
          localField: "studentId",
          foreignField: "studentId", // بافتراض أنك تخزن studentId في الـ User أيضاً
          as: "registeredUser",
        },
      },
      {
        // 2. إضافة حقل يعبر عن حالة التسجيل (هل المصفوفة فيها بيانات؟)
        $addFields: {
          isRegistered: { $gt: [{ $size: "$registeredUser" }, 0] },
        },
      },
      {
        // 3. تجميع الإحصائيات الكلية
        $facet: {
          items: [
            { $sort: { createdAt: -1 } }, // ترتيب الأحدث
            // لو محتاج Pagination ضيف $skip و $limit هنا
          ],
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: ["$isRegistered", 1, 0] } },
              },
            },
          ],
        },
      },
    ]);

    const items = stats[0].items;
    const summary = stats[0].summary[0] || { total: 0, active: 0 };

    res.status(200).json({
      success: true,
      total: summary.total,
      activeRegistrations: summary.active,
      pendingSeats: summary.total - summary.active,
      items: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.addAllowedStudent = async (req, res) => {
  try {
    const { studentId, email } = req.body;

    // التأكد إذا كان موجوداً مسبقاً
    const existing = await AllowedUser.findOne({ studentId });
    if (existing) {
      return res.status(400).json({
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
    res.status(500).json({
      success: false,
      message: "Some IDs might be duplicates or invalid.",
      error: error.message,
    });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().select("name code");
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
