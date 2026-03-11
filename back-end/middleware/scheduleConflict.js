const Section = require("../models/Section");

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * ensure that the requested section does not place the instructor or room in
 * two places at once. This middleware can be used on both create and update
 * endpoints; when updating pass the section's own id in req.params.id so the
 * query excludes it.
 */
exports.checkSectionSchedule = async (req, res, next) => {
  try {
    const { instructor_id, room_id, day, start_time, end_time, semester_id } =
      req.body;

    if (!instructor_id || !room_id || !day || !start_time || !end_time) {
      return res
        .status(400)
        .json({ message: "Missing required scheduling information" });
    }

    const newStart = timeToMinutes(start_time);
    const newEnd = timeToMinutes(end_time);
    const excludeId = req.params.id;

    const candidates = await Section.find({
      semester_id,
      day,
      _id: { $ne: excludeId },
      $or: [{ instructor_id }, { room_id }],
    });

    for (const sec of candidates) {
      const start = timeToMinutes(sec.start_time);
      const end = timeToMinutes(sec.end_time);
      if (newStart < end && newEnd > start) {
        if (sec.instructor_id.equals(instructor_id)) {
          return res
            .status(400)
            .json({ message: "Instructor has another class at this time" });
        }
        if (sec.room_id.equals(room_id)) {
          return res
            .status(400)
            .json({ message: "Room is occupied at this time" });
        }
      }
    }

    next();
  } catch (err) {
    console.error("schedule conflict check failed", err);
    res.status(500).json({ message: err.message });
  }
};
