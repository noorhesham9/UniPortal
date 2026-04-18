const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");
const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");

const isAdmin = requireRole("admin", "super_admin");

router.post("/allow_Student",      requireAuth, isAdmin, adminController.addAllowedStudent);
router.get("/allowed_students",    requireAuth, isAdmin, adminController.getAllowedStudents);
router.delete("/allowed_students/:id", requireAuth, isAdmin, adminController.deleteAllowedStudent);

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

// Update user (is_active, department, etc.)
router.patch("/users/:userId", requireAuth, isAdmin, async (req, res) => {
  try {
    const allowed = ["is_active", "department", "advisor", "level"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true })
      .populate("role", "name")
      .populate("department", "name")
      .populate("advisor", "name email");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
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
// Fully public — needed on login screen before auth
router.get("/site-lock", (req, res) => {
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

// ── Create admin or professor account ─────────────────────────────────────────
// POST /api/v1/admin/create-staff
// Body: { name, email, password, role: "admin"|"professor", department? }
router.post("/create-staff", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const { name, email, password, role: roleName, department } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ success: false, message: "name, email, password, and role are required." });
    }
    if (!["admin", "professor"].includes(roleName)) {
      return res.status(400).json({ success: false, message: "role must be 'admin' or 'professor'." });
    }
    // Only super_admin can create another admin
    if (roleName === "admin" && req.user.role.name !== "super_admin") {
      return res.status(403).json({ success: false, message: "Only super_admin can create admin accounts." });
    }

    // Check email not already used
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "This email is already registered." });
    }

    // Create Firebase user
    const firebaseAdmin = require("../utils/firebaseAdmin");
    let firebaseUser;
    try {
      firebaseUser = await firebaseAdmin.auth().createUser({
        email: email.toLowerCase(),
        password,
        displayName: name,
      });
    } catch (fbErr) {
      return res.status(400).json({ success: false, message: `Firebase error: ${fbErr.message}` });
    }

    const roleDoc = await Role.findOne({ name: roleName });
    if (!roleDoc) return res.status(500).json({ success: false, message: "Role not found." });

    const newUser = await User.create({
      firebaseUid: firebaseUser.uid,
      name,
      email: email.toLowerCase(),
      role: roleDoc._id,
      department: department || undefined,
      is_active: true,
    });

    // Send credentials email
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
      tls: { rejectUnauthorized: false },
    });

    const roleLabel = roleName === "admin" ? "Administrator" : "Professor";
    await transporter.sendMail({
      from: `"University Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your ${roleLabel} Account — University Portal`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
          <h2>Welcome, ${name}!</h2>
          <p>Your <strong>${roleLabel}</strong> account has been created on the University Portal.</p>
          <div style="background:#f0f4f8;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0 0 8px"><strong>Email:</strong> ${email}</p>
            <p style="margin:0"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please log in at <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login">the portal</a> and change your password after first login.</p>
          <p style="color:#888;font-size:12px">If you did not expect this email, please contact the administration.</p>
        </div>
      `,
    }).catch((err) => console.error("Failed to send credentials email:", err.message));

    res.status(201).json({
      success: true,
      message: `${roleLabel} account created and credentials sent to ${email}.`,
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: roleName },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
