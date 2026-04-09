const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const { checkSectionSchedule } = require("../middleware/scheduleConflict");
const {
  getSections,
  getMySections,
  createSection,
  updateSection,
} = require("../controllers/sectionController");

router.get("/my", requireAuth, getMySections);
router.get("/", requireAuth, getSections);
router.post("/", requireAuth, checkSectionSchedule, createSection);
router.patch("/:id", requireAuth, checkSectionSchedule, updateSection);

module.exports = router;
