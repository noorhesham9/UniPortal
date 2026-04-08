const User = require("../models/User");
const { cloudinary, uploadToCloudinary } = require("../utils/cloudinary");

// Derive current academic year string e.g. "2025-2026"
// Academic year starts in September
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    // Block students from uploading while site is locked
    if (process.env.SITE_LOCKED === "true" && req.user.role?.name === "student") {
      return res.status(403).json({ success: false, message: "Profile photo upload is disabled while the site is locked.", locked: true });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.profilePhoto?.publicId) {
      await cloudinary.uploader.destroy(user.profilePhoto.publicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "uni-portal/profile-photos",
      transformation: [{ width: 400, height: 400, crop: "fill" }],
    });

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { "profilePhoto.url": result.secure_url, "profilePhoto.publicId": result.public_id } },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Profile photo updated", profilePhoto: updated.profilePhoto });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadTuitionReceipt = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    // Block students from uploading while site is locked
    if (process.env.SITE_LOCKED === "true" && req.user.role?.name === "student") {
      return res.status(403).json({ success: false, message: "Receipt upload is disabled while the site is locked.", locked: true });
    }

    const academicYear = req.body.academicYear || getCurrentAcademicYear();
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const existing = user.tuitionReceipts.find((r) => r.academicYear === academicYear);

    // Block upload if already pending or approved
    if (existing && (existing.status === "pending" || existing.status === "approved")) {
      return res.status(400).json({
        success: false,
        message: `Receipt for ${academicYear} is already ${existing.status}. You can only re-upload after rejection.`,
      });
    }

    // Delete old cloudinary file if re-uploading after rejection
    if (existing?.publicId) {
      await cloudinary.uploader.destroy(existing.publicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "uni-portal/tuition-receipts",
      resource_type: req.file.mimetype === "application/pdf" ? "raw" : "image",
    });

    const newEntry = {
      academicYear,
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date(),
      status: "pending",
      rejectionReason: null,
      reviewedAt: null,
    };

    const update = existing
      ? {
          $set: {
            "tuitionReceipts.$[elem].url": newEntry.url,
            "tuitionReceipts.$[elem].publicId": newEntry.publicId,
            "tuitionReceipts.$[elem].uploadedAt": newEntry.uploadedAt,
            "tuitionReceipts.$[elem].status": "pending",
            "tuitionReceipts.$[elem].rejectionReason": null,
            "tuitionReceipts.$[elem].reviewedAt": null,
          },
        }
      : { $push: { tuitionReceipts: newEntry } };

    const arrayFilters = existing ? [{ "elem.academicYear": academicYear }] : [];

    const updated = await User.findByIdAndUpdate(req.user._id, update, { new: true, arrayFilters });
    const receipt = updated.tuitionReceipts.find((r) => r.academicYear === academicYear);
    res.status(200).json({ success: true, message: "Tuition receipt uploaded", tuitionReceipt: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
