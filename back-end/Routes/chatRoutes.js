const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const { memoryStorage } = require("../utils/cloudinary");
const chatController = require("../controllers/chatController");

router.get("/advisor",    requireAuth, chatController.getMyAdvisor);
router.get("/students",   requireAuth, chatController.getMyStudents);
router.get("/unread",     requireAuth, chatController.getUnreadCounts);
router.get("/:userId",    requireAuth, chatController.getConversation);
router.post("/send",      requireAuth, chatController.sendMessage);
router.post("/send-file", requireAuth, memoryStorage.single("file"), chatController.sendFile);

module.exports = router;
