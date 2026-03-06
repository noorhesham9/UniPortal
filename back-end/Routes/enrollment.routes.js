const express = require("express");
const router = express.Router();

const {
  createEnrollment,
  approveEnrollment,
  updateGrades,
  getCompletedHours , 
  joinWaitlist,   
  leaveWaitlist, 
  getWaitlistRank
} = require("../controllers/EnrollmentController");

// Task 1
router.post("/", createEnrollment);

// Task 3
router.patch("/:id/approve", approveEnrollment);

// Task 2
router.patch("/:id/grades", updateGrades);

// Task 4
router.get("/:studentId/completed-hours", getCompletedHours);

// M-ashraf task-3

router.post('/waitlist/join', enrollmentController.joinWaitlist); 
router.delete('/waitlist/leave/:id', enrollmentController.leaveWaitlist);
router.get('/waitlist/rank/:id', enrollmentController.getWaitlistRank);
module.exports = router;