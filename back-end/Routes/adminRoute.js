const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");
const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");

const isAdmin = requireRole("admin", "super_admin");

router.post("/allow_Student", requireAuth, isAdmin, adminController.addAllowedStudent);
router.get("/allowed_students", requireAuth, isAdmin, adminController.getAllowedStudents);

router.get("/departments", requireAuth, isAdmin, adminController.getDepartments);
router.post("/departments", requireAuth, requireRole("super_admin"), adminController.createDepartment);
router.patch("/departments/:id", requireAuth, isAdmin, adminController.updateDepartment);
router.delete("/departments/:id", requireAuth, requireRole("super_admin"), adminController.deleteDepartment);

router.get("/users", requireAuth, isAdmin, async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) query.role = roleDoc._id;
    }
    const users = await User.find(query)
      .populate("role", "name")
      .populate("department", "name")
      .populate("advisor", "name");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign advisor to a student
router.patch("/users/:studentId/assign-advisor", requireAuth, isAdmin, async (req, res) => {
  try {
    const { advisorId } = req.body;
    const student = await User.findByIdAndUpdate(
      req.params.studentId,
      { advisor: advisorId || null },
      { new: true }
    ).populate("advisor", "name email");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stop impersonation — must be defined BEFORE /:userId to avoid route conflict
router.post("/impersonate/stop", requireAuth, async (req, res) => {
  res.clearCookie("impersonation_token");
  res.json({ success: true });
});

// Impersonate a user — super_admin only
router.post("/impersonate/:userId", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const target = await User.findById(req.params.userId)
      .populate({ path: "role", populate: { path: "permissions" } })
      .populate("department");

    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    const impersonationToken = jwt.sign(
      { impersonatedUserId: target._id.toString(), adminId: req.user._id.toString() },
      process.env.SECRET_STR,
      { expiresIn: "2h" }
    );

    res.cookie("impersonation_token", impersonationToken, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({ success: true, user: target });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Site lock ──────────────────────────────────────────────────────────────
// Public read — any authenticated user can check lock status
router.get("/site-lock", requireAuth, (req, res) => {
  res.json({ locked: process.env.SITE_LOCKED === "true" });
});

router.post("/site-lock", requireAuth, requireRole("super_admin"), (req, res) => {
  const { locked } = req.body;
  process.env.SITE_LOCKED = locked ? "true" : "false";
  const isLocked = process.env.SITE_LOCKED === "true";

  // Push the new state to all connected clients instantly via socket
  const { emitToAll } = require("../socket");
  emitToAll("site_lock_changed", { locked: isLocked });

  res.json({ success: true, locked: isLocked });
});

module.exports = router;
