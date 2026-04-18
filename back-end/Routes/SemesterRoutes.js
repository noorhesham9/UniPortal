const express = require("express");
const router = express.Router();
const {
  getAllSemesters,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester,
  getActiveSemester,
  setActiveSemester,
  toggleFinalResults,
} = require("../controllers/SemesterController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

const isAdmin = requireRole("admin", "super_admin");

// Public reads — no auth needed for active semester and site lock (used on login screen)
router.get("/active/current", getActiveSemester);
router.get("/", requireAuth, getAllSemesters);
router.get("/:id", requireAuth, getSemesterById);

// Admin-only writes
router.post("/", requireAuth, isAdmin, createSemester);
router.put("/:id", requireAuth, isAdmin, updateSemester);
router.patch("/:id/activate", requireAuth, isAdmin, setActiveSemester);
router.patch("/:id/toggle-results", requireAuth, isAdmin, toggleFinalResults);
router.delete("/:id", requireAuth, requireRole("super_admin"), deleteSemester);

module.exports = router;
