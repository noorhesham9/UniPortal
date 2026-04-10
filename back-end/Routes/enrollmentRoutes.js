const express = require("express");
const router = express.Router();

const {
  getAllEnrollments,
  getMyEnrollments,
  createEnrollment,
  adminEnrollStudent,
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
const { requirePermission } = require("../middleware/authorize");
const { checkEnrollmentEligibility } = require("../middleware/enrollmentValidation");

router.get("/my", requireAuth, getMyEnrollments);
router.post("/", requireAuth, checkEnrollmentEligibility, createEnrollment);

// Static routes (must be before dynamic routes)
router.post("/waitlist/join", joinWaitlist);
router.delete("/waitlist/leave/:id", leaveWaitlist);
router.get("/waitlist/rank/:id", getWaitlistRank);

// Dynamic routes (must be after static routes)
router.get("/:studentId/completed-hours", requireAuth, getCompletedHours);
router.get("/:studentId/academic-records", requireAuth, getAcademicRecords);
router.get("/:studentId/current-semester-grades", requireAuth, getCurrentSemesterGrades);
router.delete("/:id", deleteEnrollment);

// // Future tasks
// router.patch("/:id/approve", approveEnrollment);
// router.patch("/:id/grades", updateGrades);

module.exports = router;
