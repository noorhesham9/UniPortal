const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const { checkSectionSchedule } = require("../middleware/scheduleConflict");
const {
  getSections,
  createSection,
  updateSection,
} = require("../controllers/sectionController");

router.get("/", requireAuth, getSections);

router.post("/", requireAuth, checkSectionSchedule, createSection);
router.patch("/:id", requireAuth, checkSectionSchedule, updateSection);

module.exports = router;
