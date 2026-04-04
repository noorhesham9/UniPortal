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
} = require("../controllers/enrollmentcontroller");

const { requireAuth } = require("../middleware/requireAuth");
const { requirePermission } = require("../middleware/authorize");
const { checkEnrollmentEligibility } = require("../middleware/enrollmentValidation");

router.get("/my", requireAuth, getMyEnrollments);
router.get("/all", requireAuth, requirePermission("view_enrollments"), getAllEnrollments);
router.post("/enroll", requireAuth, checkEnrollmentEligibility, createEnrollment);

// Admin direct enrollment — bypasses capacity, slice, and fee checks
router.post("/admin-enroll", requireAuth, requirePermission("view_enrollments"), adminEnrollStudent);

router.post("/waitlist/join", joinWaitlist);
router.delete("/waitlist/leave/:id", leaveWaitlist);
router.get("/waitlist/rank/:id", getWaitlistRank);

router.delete("/:id", deleteEnrollment);
module.exports = router;
