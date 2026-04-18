const Announcement = require("../models/Announcement");
const { cloudinary } = require("../utils/cloudinary");

const fmtSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * Upload a buffer to Cloudinary with explicit public delivery type.
 * resource_type "auto" handles both images and PDFs correctly.
 */
const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { type: "upload", ...options },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// PUBLIC — no auth required
exports.getPublicAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ status: "active" })
      .sort({ date: -1 })
      .limit(10)
      .lean();
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN — get all (any status)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name")
      .lean();
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };

    const fileUpload  = req.files?.file?.[0];
    const imageUpload = req.files?.image?.[0];

    if (fileUpload) {
      const displayName = (req.body.fileName?.trim() || fileUpload.originalname)
        .replace(/\.[^/.]+$/, ""); // strip extension for public_id
      const ext = fileUpload.originalname.split(".").pop().toLowerCase();

      const result = await uploadBuffer(fileUpload.buffer, {
        folder: "uni-portal/announcements",
        resource_type: "auto",
        public_id: `${displayName}-${Date.now()}`,
      });
      console.log("[Cloudinary file upload result]", JSON.stringify({
        secure_url: result.secure_url,
        resource_type: result.resource_type,
        type: result.type,
        access_mode: result.access_mode,
      }));
      data.fileUrl      = result.secure_url;
      data.filePublicId = result.public_id;
      data.fileSize     = fmtSize(fileUpload.size);
      data.fileName     = `${displayName}.${ext}`;
    }

    if (imageUpload) {
      const result = await uploadBuffer(imageUpload.buffer, {
        folder: "uni-portal/announcements/images",
        resource_type: "image",
      });
      data.imageUrl      = result.secure_url;
      data.imagePublicId = result.public_id;
    }

    const ann = await Announcement.create(data);
    res.status(201).json({ success: true, announcement: ann });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const update   = { ...req.body };
    const existing = await Announcement.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });

    const fileUpload  = req.files?.file?.[0];
    const imageUpload = req.files?.image?.[0];

    if (fileUpload) {
      if (existing.filePublicId) {
        await cloudinary.uploader.destroy(existing.filePublicId, { resource_type: "raw" }).catch(() => {});
        await cloudinary.uploader.destroy(existing.filePublicId, { resource_type: "image" }).catch(() => {});
      }
      const displayName = (req.body.fileName?.trim() || fileUpload.originalname)
        .replace(/\.[^/.]+$/, "");
      const ext = fileUpload.originalname.split(".").pop().toLowerCase();

      const result = await uploadBuffer(fileUpload.buffer, {
        folder: "uni-portal/announcements",
        resource_type: "auto",
        public_id: `${displayName}-${Date.now()}`,
      });
      update.fileUrl      = result.secure_url;
      update.filePublicId = result.public_id;
      update.fileSize     = fmtSize(fileUpload.size);
      update.fileName     = `${displayName}.${ext}`;
    }

    if (imageUpload) {
      if (existing.imagePublicId) {
        await cloudinary.uploader.destroy(existing.imagePublicId, { resource_type: "image" }).catch(() => {});
      }
      const result = await uploadBuffer(imageUpload.buffer, {
        folder: "uni-portal/announcements/images",
        resource_type: "image",
      });
      update.imageUrl      = result.secure_url;
      update.imagePublicId = result.public_id;
    }

    const ann = await Announcement.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, announcement: ann });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id).lean();
    if (ann?.filePublicId) {
      await cloudinary.uploader.destroy(ann.filePublicId, { resource_type: "raw" }).catch(() => {});
      await cloudinary.uploader.destroy(ann.filePublicId, { resource_type: "image" }).catch(() => {});
    }
    if (ann?.imagePublicId) {
      await cloudinary.uploader.destroy(ann.imagePublicId, { resource_type: "image" }).catch(() => {});
    }
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
