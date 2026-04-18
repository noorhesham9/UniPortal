const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

const canNotify = requireRole("professor", "admin", "super_admin");

router.patch("/update-token",    requireAuth, notificationController.updateFcmToken);
router.post("/send",             requireAuth, canNotify, notificationController.sendAdvisorNotification);
router.post("/section-grades",   requireAuth, canNotify, notificationController.notifySectionGrades);
router.get("/students",          requireAuth, canNotify, notificationController.getStudents);
router.get("/my",                requireAuth, notificationController.getMyNotifications);
router.patch("/mark-read",       requireAuth, notificationController.markAsRead);

module.exports = router;