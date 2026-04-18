const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/gradesController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

router.get("/admin/final-lock-status", requireAuth, requireRole("admin", "super_admin"), ctrl.getFinalLockStatus);
router.get("/my", requireAuth, ctrl.getMyGrades);
router.get("/my-summary", requireAuth, ctrl.getMySummary);
router.get("/results", requireAuth, ctrl.getFinalResults);
router.get("/academic-record/:studentId", requireAuth, ctrl.getAcademicRecord);
router.get("/section/:sectionId", requireAuth, requireRole("professor", "admin", "super_admin"), ctrl.getSectionGrades);
router.patch("/:enrollmentId", requireAuth, requireRole("professor", "admin", "super_admin"), ctrl.updateGrades);
router.patch("/:enrollmentId/lock", requireAuth, requireRole("admin", "super_admin"), ctrl.lockGrades);
router.patch("/:enrollmentId/lock-yearwork", requireAuth, requireRole("professor", "admin", "super_admin"), ctrl.toggleYearWorkLock);
router.patch("/:enrollmentId/lock-final", requireAuth, requireRole("professor", "admin", "super_admin"), ctrl.toggleFinalExamLock);
router.patch("/section/:sectionId/bulk-lock-yearwork", requireAuth, requireRole("professor", "admin", "super_admin"), ctrl.bulkToggleYearWorkLock);
router.patch("/section/:sectionId/bulk-lock-final", requireAuth, requireRole("professor", "admin", "super_admin"), ctrl.bulkToggleFinalExamLock);

module.exports = router;
