const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const { getAvailableCourses } = require('../controllers/courseController');

// جلب المواد المتاحة للطالب
// الطالب يجب أن يكون مصرح (لديه account فعال)
router.get('/available', requireAuth, getAvailableCourses);

module.exports = router;
