const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/announcementController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");
const { memoryStorage } = require("../utils/cloudinary");

const isAdmin = requireRole("admin", "super_admin");

// Use memory storage — controller handles Cloudinary upload manually for full control
const uploadFields = memoryStorage.fields([
  { name: "file",  maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

// Public
router.get("/public", ctrl.getPublicAnnouncements);

// Admin
router.get("/",      requireAuth, isAdmin, ctrl.getAllAnnouncements);
router.post("/",     requireAuth, isAdmin, uploadFields, ctrl.createAnnouncement);
router.patch("/:id", requireAuth, isAdmin, uploadFields, ctrl.updateAnnouncement);
router.delete("/:id",requireAuth, isAdmin, ctrl.deleteAnnouncement);

module.exports = router;
