const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const { requirePermission } = require("../middleware/authorize");
const {
  getStudyPlan,
  addCourseToStudyPlan,
  updateStudyPlanEntry,
  removeCourseFromStudyPlan,
} = require("../controllers/studyPlanController");

// GET  /api/v1/study-plan?department_id=&academic_year=&semester_num=
// All authenticated users (students + admins)
router.get("/", requireAuth, getStudyPlan);

// POST /api/v1/study-plan  — admin only
router.post(
  "/",
  requireAuth,
  requirePermission("admin_allowed_ids"),
  addCourseToStudyPlan,
);

// PATCH /api/v1/study-plan/:entryId  — admin only
router.patch(
  "/:entryId",
  requireAuth,
  requirePermission("admin_allowed_ids"),
  updateStudyPlanEntry,
);

// DELETE /api/v1/study-plan/:entryId  — admin only
router.delete(
  "/:entryId",
  requireAuth,
  requirePermission("admin_allowed_ids"),
  removeCourseFromStudyPlan,
);

module.exports = router;
