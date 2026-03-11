const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

const { requireAuth } = require("../middleware/requireAuth");

router.patch(
  "/update-token",
  requireAuth,
  notificationController.updateFcmToken,
);

module.exports = router;
