const express = require("express");
const router = express.Router();
const {
  generateSchedules,
  validateScheduleEndpoint,
  saveSchedule,
  getAvailableResources,
} = require("../controllers/scheduleGeneratorController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

// All routes require admin or super_admin role
const isAdmin = requireRole("admin", "super_admin");

router.get("/resources", requireAuth, isAdmin, getAvailableResources);
router.post("/generate", requireAuth, isAdmin, generateSchedules);
router.post("/validate", requireAuth, isAdmin, validateScheduleEndpoint);
router.post("/save", requireAuth, isAdmin, saveSchedule);

module.exports = router;
