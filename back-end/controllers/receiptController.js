const User = require("../models/User");
const { cloudinary } = require("../utils/cloudinary");

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

// GET all students who have uploaded a receipt (admin) — filtered by academic year
exports.getAllReceipts = async (req, res) => {
  try {
    const { status, department, search, page = 1, limit = 10, academicYear } = req.query;
    const year = academicYear || getCurrentAcademicYear();

    const filter = { "tuitionReceipts.academicYear": year };
    if (status) filter["tuitionReceipts.status"] = status;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);
    const students = await User.find(filter)
      .populate("department", "name")
      .select("name studentId department tuitionReceipts feesPaid profilePhoto")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Attach only the relevant year's receipt for convenience
    const result = students.map((s) => {
      const obj = s.toObject();
      obj.tuitionReceipt = obj.tuitionReceipts.find((r) => r.academicYear === year) || null;
      return obj;
    });

    res.status(200).json({ success: true, total, academicYear: year, students: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH approve a receipt for a given academic year
exports.approveReceipt = async (req, res) => {
  try {
    const { studentId } = req.params;
    const academicYear = req.body.academicYear || getCurrentAcademicYear();

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const receipt = student.tuitionReceipts.find((r) => r.academicYear === academicYear);
    if (!receipt?.url) {
      return res.status(400).json({ success: false, message: `No receipt uploaded for ${academicYear}` });
    }

    await User.findByIdAndUpdate(
      studentId,
      {
        $set: {
          "tuitionReceipts.$[elem].status": "approved",
          "tuitionReceipts.$[elem].rejectionReason": null,
          "tuitionReceipts.$[elem].reviewedAt": new Date(),
          feesPaid: true,
        },
      },
      { arrayFilters: [{ "elem.academicYear": academicYear }] }
    );

    res.status(200).json({ success: true, message: `Receipt approved for ${academicYear}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH reject a receipt for a given academic year
exports.rejectReceipt = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reason, academicYear } = req.body;
    const year = academicYear || getCurrentAcademicYear();

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    await User.findByIdAndUpdate(
      studentId,
      {
        $set: {
          "tuitionReceipts.$[elem].status": "rejected",
          "tuitionReceipts.$[elem].rejectionReason": reason || "No reason provided",
          "tuitionReceipts.$[elem].reviewedAt": new Date(),
          feesPaid: false,
        },
      },
      { arrayFilters: [{ "elem.academicYear": year }] }
    );

    res.status(200).json({ success: true, message: `Receipt rejected for ${year}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE remove a receipt for a given academic year
exports.deleteReceipt = async (req, res) => {
  try {
    const { studentId } = req.params;
    const academicYear = req.query.academicYear || getCurrentAcademicYear();

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const receipt = student.tuitionReceipts.find((r) => r.academicYear === academicYear);
    if (receipt?.publicId) {
      await cloudinary.uploader.destroy(receipt.publicId);
    }

    await User.findByIdAndUpdate(studentId, {
      $pull: { tuitionReceipts: { academicYear } },
    });

    res.status(200).json({ success: true, message: `Receipt deleted for ${academicYear}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
