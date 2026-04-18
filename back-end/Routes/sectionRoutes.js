const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");
const { checkSectionSchedule } = require("../middleware/scheduleConflict");
const {
  getSections,
  getMySections,
  createSection,
  updateSection,
} = require("../controllers/sectionController");

const canWrite = requireRole("admin", "super_admin");

// Fix frontend calls that use /my-sections alias
router.get("/my-sections", requireAuth, getMySections);
router.get("/my",          requireAuth, getMySections);
router.get("/",            requireAuth, getSections);
router.post("/",           requireAuth, canWrite, checkSectionSchedule, createSection);
router.patch("/:id",       requireAuth, canWrite, checkSectionSchedule, updateSection);

module.exports = router;
