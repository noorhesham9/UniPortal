const express = require("express");
const router = express.Router();
const Department = require("../models/Department");

// Fully public — no auth
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find({ status: "Active" })
      .select("name code description head_member")
      .sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
