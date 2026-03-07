const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const {
  createSlice,
  listSlices,
  updateSlice,
  deleteSlice,
} = require("../controllers/registrationSliceController");

// CRUD on registration slices - only admins or advisors should call these
router.post("/", requireAuth, createSlice);
router.get("/", requireAuth, listSlices);
router.patch("/:id", requireAuth, updateSlice);
router.delete("/:id", requireAuth, deleteSlice);

module.exports = router;
