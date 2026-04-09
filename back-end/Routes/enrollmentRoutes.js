const express = require("express");
const router = express.Router();

const {
  getMyEnrollments,
  createEnrollment,
  approveEnrollment,
  updateGrades,
  getCompletedHours,
  joinWaitlist,
  leaveWaitlist,
  getWaitlistRank,
  deleteEnrollment,
  getAcademicRecords,
  getCurrentSemesterGrades,
} = require("../controllers/enrollmentcontroller");

const { requireAuth } = require("../middleware/requireAuth");
const {
  checkEnrollmentEligibility,
} = require("../middleware/enrollmentValidation");

router.get("/my", requireAuth, getMyEnrollments);
router.post("/enroll", requireAuth, checkEnrollmentEligibility, createEnrollment);

// // Task 3
// router.patch("/:id/approve", approveEnrollment);

// // Task 2
// router.patch("/:id/grades", updateGrades);

// // Task 4
// router.get("/:studentId/completed-hours", getCompletedHours);

// M-ashraf task-3

router.post("/waitlist/join", joinWaitlist);
router.delete("/waitlist/leave/:id", leaveWaitlist);
router.get("/waitlist/rank/:id", getWaitlistRank);

// حذف تسجيل (drop) student من سكشن
router.delete("/:id", deleteEnrollment);

// Get academic records (GPA, semesters, grades)
router.get("/:studentId/academic-records", requireAuth, getAcademicRecords);

// Get current semester grades (coursework and final)
router.get("/:studentId/current-semester-grades", requireAuth, getCurrentSemesterGrades);

module.exports = router;
