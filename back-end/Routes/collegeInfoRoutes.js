const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/collegeInfoController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

router.get("/", ctrl.getCollegeInfo); // public
router.patch("/", requireAuth, requireRole("admin", "super_admin"), ctrl.updateCollegeInfo); // admin

module.exports = router;
