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
const { requirePermission, requireRole } = require("../middleware/authorize");
const { checkEnrollmentEligibility } = require("../middleware/enrollmentValidation");

const isAdmin = requireRole("admin", "super_admin");

router.get("/my",  requireAuth, getMyEnrollments);
router.get("/all", requireAuth, requirePermission("view_enrollments"), getAllEnrollments);
router.post("/",   requireAuth, checkEnrollmentEligibility, createEnrollment);
router.post("/admin-enroll", requireAuth, requirePermission("create_enrollment"), adminEnrollStudent);

// Static routes (must be before dynamic routes)
router.post("/waitlist/join",        requireAuth, joinWaitlist);
router.delete("/waitlist/leave/:id", requireAuth, leaveWaitlist);
router.get("/waitlist/rank/:id",     requireAuth, getWaitlistRank);

// Dynamic routes (must be after static routes)
router.get("/:studentId/completed-hours",        requireAuth, getCompletedHours);
router.get("/:studentId/academic-records",       requireAuth, getAcademicRecords);
router.get("/:studentId/current-semester-grades",requireAuth, getCurrentSemesterGrades);
router.delete("/:id", requireAuth, deleteEnrollment);

// // Future tasks
// router.patch("/:id/approve", approveEnrollment);
// router.patch("/:id/grades", updateGrades);

module.exports = router;
