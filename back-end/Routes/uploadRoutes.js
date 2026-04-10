const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const { memoryStorage } = require("../utils/cloudinary");
const uploadController = require("../controllers/uploadController");

router.post(
  "/profile-photo",
  requireAuth,
  memoryStorage.single("photo"),
  uploadController.uploadProfilePhoto
);

router.post(
  "/tuition-receipt",
  requireAuth,
  memoryStorage.single("receipt"),
  uploadController.uploadTuitionReceipt
);

module.exports = router;

module.exports = router;
