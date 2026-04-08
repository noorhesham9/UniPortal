const express = require("express");
const router = express.Router();
const Room = require("../models/room.model");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");

router.get("/", requireAuth, async (req, res) => {
  try {
    const { search, type, is_active, sort = "room_name", order = "asc", page = 1, limit = 10 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (is_active !== undefined) filter.is_active = is_active === "true";
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ room_name: regex }, { building_section: regex }, { equipment_notes: regex }];
    }

    const sortObj = { [sort]: order === "desc" ? -1 : 1 };
    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (p - 1) * l;

    const [rooms, total] = await Promise.all([
      Room.find(filter).sort(sortObj).skip(skip).limit(l),
      Room.countDocuments(filter),
    ]);

    res.json({ rooms, pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAuth, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    const { room_name, building_section, type, capacity, equipment_notes, is_active, keycard_access } = req.body;
    if (!room_name || !building_section || !type || !capacity) {
      return res.status(400).json({ message: "room_name, building_section, type, and capacity are required" });
    }
    const room = await Room.create({ room_name, building_section, type, capacity, equipment_notes, is_active, keycard_access });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", requireAuth, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
