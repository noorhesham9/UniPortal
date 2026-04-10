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
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
      { head_member: { $regex: search, $options: "i" } },
    ];
    if (status) query.status = status;

    const sortOrder = order === "asc" ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    const [departments, total, statusCounts] = await Promise.all([
      Department.find(query)
        .select("name code description head_member status createdAt")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Department.countDocuments(query),
      Department.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const counts = { Active: 0, Inactive: 0, "On Hold": 0 };
    statusCounts.forEach(({ _id, count }) => { if (_id in counts) counts[_id] = count; });

    res.status(200).json({
      departments,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      counts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description, head_member, status } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "name and code are required" });
    }
    const dept = await Department.create({ name, code, description, head_member, status });
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndUpdate(id, req.body, { new: true });
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.status(200).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
