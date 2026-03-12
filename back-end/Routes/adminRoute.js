const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");
const User = require("../models/User");
const Role = require("../models/Role");

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

router.get(
  "/departments",
  requireAuth,
  requireRole("admin"),
  adminController.getDepartments,
);

router.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) query.role = roleDoc._id;
    }
    const users = await User.find(query)
      .populate("role", "name")
      .populate("department", "name");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
