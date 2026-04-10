const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const Department = require("../models/Department");

// GET /api/v1/departments — returns active departments, accessible to all authenticated users
router.get("/", requireAuth, async (req, res) => {
  try {
    const departments = await Department.find({ status: "Active" })
      .select("name code description head_member status")
      .sort({ name: 1 });
    res.status(200).json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
