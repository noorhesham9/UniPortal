const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

const { requireAuth } = require('../middleware/authMiddleware'); 

router.patch('/update-token', protect, notificationController.updateFcmToken);

module.exports = router;