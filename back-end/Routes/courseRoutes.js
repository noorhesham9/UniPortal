const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const { requirePermission } = require("../middleware/authorize");
const {
  getAvailableCourses,
  createCourse,
  getAllCourses,
} = require("../controllers/courseController");

// جلب المواد المتاحة للطالب
// الطالب يجب أن يكون مصرح (لديه account فعال)
router.get("/available", requireAuth, getAvailableCourses);

// جلب جميع الكورسات
router.get("/", requireAuth, getAllCourses);

// إنشاء كورس جديد
// يتطلب صلاحية create_course
router.post("/", requireAuth, requirePermission("CREATE_COURSE"), createCourse);

module.exports = router;
