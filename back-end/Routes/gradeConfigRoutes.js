const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/gradeConfigController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

const canManage = requireRole("professor", "admin", "super_admin");

router.get("/:sectionId", requireAuth, ctrl.getConfig);
router.put("/:sectionId", requireAuth, canManage, ctrl.saveConfig);

module.exports = router;
