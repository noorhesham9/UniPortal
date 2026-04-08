const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const { requirePermission } = require("../middleware/authorize");
const {
  getAvailableCourses,
  createCourse,
  getAllCourses,
  toggleCourseActive,
  offerCourse,
  getOfferedCourses,
  getCourseById,
  updateCourse,
} = require("../controllers/courseController");

router.get("/available", requireAuth, getAvailableCourses);
router.get("/offered", requireAuth, getOfferedCourses);
router.get("/", requireAuth, getAllCourses);
router.get("/:id", requireAuth, getCourseById);
router.post("/", requireAuth, requirePermission("create_course"), createCourse);
router.patch("/:id", requireAuth, requirePermission("manage_courses"), updateCourse);
router.patch("/:id/toggle-active", requireAuth, requirePermission("manage_courses"), toggleCourseActive);
router.post("/:id/offer", requireAuth, requirePermission("manage_courses"), offerCourse);

module.exports = router;
