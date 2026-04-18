const express = require("express");
const router = express.Router();
const {
  createSlice,
  listSlices,
  updateSlice,
  deleteSlice,
} = require("../controllers/registrationSliceController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

const isAdmin = requireRole("admin", "super_admin");

// CRUD on registration slices - admin/super_admin only
router.post("/",    requireAuth, isAdmin, createSlice);
router.get("/",     requireAuth, isAdmin, listSlices);
router.patch("/:id",requireAuth, isAdmin, updateSlice);
router.delete("/:id",requireAuth, requireRole("super_admin"), deleteSlice);

// Public endpoint — returns active slice info for students
router.get("/active", async (req, res) => {
  try {
    const RegistrationSlice = require("../models/RegistrationSlice");
    const now = new Date();
    const active = await RegistrationSlice.findOne({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
    }).populate("departments", "name");
    res.json({ success: true, slice: active || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student eligibility check — returns whether the student qualifies for the active slice and why not
router.get("/my-eligibility", requireAuth, async (req, res) => {
  try {
    const RegistrationSlice = require("../models/RegistrationSlice");
    const User = require("../models/User");

    const user = await User.findById(req.user._id).populate("department", "name");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const now = new Date();
    const slice = await RegistrationSlice.findOne({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
    }).populate("departments", "name");

    // No active slice — registration is CLOSED for everyone
    if (!slice) {
      return res.json({ success: true, eligible: false, registrationClosed: true, slice: null, reasons: ["Registration is currently closed. No active registration window."] });
    }

    const studentGpa = user.gpa ?? 0;
    const reasons = [];

    // GPA check
    const gpaOk = studentGpa >= slice.min_gpa && studentGpa <= slice.max_gpa;
    if (!gpaOk) {
      reasons.push(`Your GPA (${studentGpa.toFixed(2)}) is outside the required range (${slice.min_gpa} – ${slice.max_gpa})`);
    }

    // Department check
    const deptOk =
      !slice.departments?.length ||
      (user.department && slice.departments.some((d) => d._id.equals(user.department._id)));
    if (!deptOk) {
      const allowed = slice.departments.map((d) => d.name).join(", ");
      reasons.push(`Your department (${user.department?.name || "—"}) is not in the eligible list: ${allowed}`);
    }

    // Level check
    const levelOk =
      !slice.levels?.length ||
      slice.levels.includes(user.level);
    if (!levelOk) {
      reasons.push(`Your academic level (${user.level || "—"}) is not in the eligible levels: ${slice.levels.join(", ")}`);
    }

    // Explicit student override
    const studentOk =
      slice.students?.length > 0 &&
      slice.students.some((id) => id.equals(user._id));

    const eligible = studentOk || (gpaOk && deptOk && levelOk);

    res.json({
      success: true,
      eligible,
      slice: {
        _id: slice._id,
        name: slice.name,
        start_date: slice.start_date,
        end_date: slice.end_date,
        min_gpa: slice.min_gpa,
        max_gpa: slice.max_gpa,
        departments: slice.departments,
        levels: slice.levels,
      },
      student: {
        gpa: studentGpa,
        department: user.department?.name || null,
        level: user.level || null,
      },
      reasons, // empty when eligible
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
