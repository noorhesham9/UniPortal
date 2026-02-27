const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

router.post(
  "/allow_Student",
  requireAuth,
  requireRole("admin"),
  adminController.addAllowedStudent,
);
router.get(
  "/allowed_students",
  requireAuth,
  requireRole("admin"),
  adminController.getAllowedStudents,
);

router.post(
  "/allow_Students",
  requireAuth,
  requireRole("admin"),
  adminController.bulkAddAllowedStudents,
);

module.exports = router;
