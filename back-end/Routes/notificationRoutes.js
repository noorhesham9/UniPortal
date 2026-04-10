const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/requireAuth");

router.patch("/update-token", requireAuth, notificationController.updateFcmToken);
router.post("/send", requireAuth, notificationController.sendAdvisorNotification);
router.get("/students", requireAuth, notificationController.getStudents);

module.exports = router;