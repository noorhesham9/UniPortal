const express = require("express");
const router = express.Router();

const {
  createEnrollment,
  approveEnrollment,
  updateGrades,
  getCompletedHours
} = require("../controllers/EnrollmentController");

// Task 1
router.post("/", createEnrollment);

// Task 3
router.patch("/:id/approve", approveEnrollment);

// Task 2
router.patch("/:id/grades", updateGrades);

// Task 4
router.get("/:studentId/completed-hours", getCompletedHours);

module.exports = router;