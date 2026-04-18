const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uni-portal/profile-photos",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

const tuitionReceiptStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uni-portal/tuition-receipts",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
  },
});

const chatFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uni-portal/chat-files",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
  },
});

const announcementFileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "uni-portal/announcements",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    type: "upload",        // always public delivery
    resource_type: "auto",
  }),
});

const announcementImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uni-portal/announcements/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // No transformation — preserve original image as uploaded
  },
});

// Memory storage — used when we upload to cloudinary manually in the controller
const memoryStorage = multer({ storage: multer.memoryStorage() });

/**
 * Upload a buffer directly to Cloudinary and return the result.
 * @param {Buffer} buffer
 * @param {object} options  — cloudinary upload_stream options
 */
const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });

exports.uploadProfilePhoto     = multer({ storage: profilePhotoStorage });
exports.uploadTuitionReceipt   = multer({ storage: tuitionReceiptStorage });
exports.uploadChatFile         = multer({ storage: chatFileStorage });
exports.uploadAnnouncementFile = multer({ storage: announcementFileStorage });
exports.uploadAnnouncementImage = multer({ storage: announcementImageStorage });
exports.memoryStorage          = memoryStorage;
exports.uploadToCloudinary     = uploadToCloudinary;
exports.cloudinary             = cloudinary;
