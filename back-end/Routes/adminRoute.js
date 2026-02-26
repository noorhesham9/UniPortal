const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

router.post(
  "/addStudent",
  requireAuth,
  requireRole("admin"),
  adminController.addAllowedStudent,
);
router.get(
  "/allowed-students",
  requireAuth,
  requireRole("admin"),
  //   adminController.getAllowedStudents,
);

router.post(
  "/bulk-add",
  requireAuth,
  requireRole("admin"),
  adminController.bulkAddAllowedStudents,
);

module.exports = router;
