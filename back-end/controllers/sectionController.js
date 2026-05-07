const Section = require("../models/Section");
const { promoteNextFromWaitlist } = require("./enrollmentcontroller");

// جلب كل السكشنز الخاصة بالأستاذ المسجل دخوله
exports.getMySections = async (req, res) => {
  try {
    const { semesterId } = req.query;
    const filter = { instructor_id: req.user._id };
    if (semesterId) filter.semester_id = semesterId;

    const sections = await Section.find(filter)
      .populate("course_id", "code title credits required_room_type")
      .populate("semester_id", "term year is_active")
      .populate("room_id", "room_name building_section type capacity")
      .sort({ day: 1, start_time: 1 })
      .lean();

    // Count actual enrolled students from Enrollment collection
    const Enrollment = require("../models/Enrollment");
    const sectionIds = sections.map((s) => s._id);
    const enrollmentCounts = await Enrollment.aggregate([
      {
        $match: {
          section: { $in: sectionIds },
          status: { $in: ["Enrolled", "Approved", "Pending"] },
        },
      },
      { $group: { _id: "$section", count: { $sum: 1 } } },
    ]);

    const countMap = Object.fromEntries(
      enrollmentCounts.map((e) => [e._id.toString(), e.count]),
    );

    // Replace enrolled_students array with actual count
    const sectionsWithCount = sections.map((sec) => ({
      ...sec,
      enrolled_students: Array(countMap[sec._id.toString()] || 0).fill(null),
    }));

    return res.status(200).json({ success: true, sections: sectionsWithCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// جلب السكشنز حسب الترم واختياريًا حسب الكورس (للعرض للطالب)
exports.getSections = async (req, res) => {
  try {
    const {
      semesterId,
      courseId,
      search = "",
      day = "",
      status = "",
      sort = "course_id",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    if (!semesterId) {
      return res.status(400).json({
        success: false,
        message: "semesterId query is required",
      });
    }

    const filter = { semester_id: semesterId };
    if (courseId) filter.course_id = courseId;
    if (day) filter.day = day;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "desc" ? -1 : 1;

    // Fetch all matching sections first (we need populated fields for search)
    // For large datasets a text-index would be better, but sections per semester
    // are typically small enough that post-populate filtering is fine.
    let sections = await Section.find(filter)
      .populate("course_id", "code title credits required_room_type")
      .populate("instructor_id", "name")
      .populate("room_id", "room_name building_section type capacity")
      .lean();

    // Text search across course code, title, instructor name, room name
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      sections = sections.filter(
        (s) =>
          s.course_id?.code?.toLowerCase().includes(q) ||
          s.course_id?.title?.toLowerCase().includes(q) ||
          s.instructor_id?.name?.toLowerCase().includes(q) ||
          s.room_id?.room_name?.toLowerCase().includes(q),
      );
    }

    // Sort
    sections.sort((a, b) => {
      let va, vb;
      if (sort === "course_id") {
        va = a.course_id?.code || "";
        vb = b.course_id?.code || "";
      } else if (sort === "instructor_id") {
        va = a.instructor_id?.name || "";
        vb = b.instructor_id?.name || "";
      } else if (sort === "day") {
        const dayOrder = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        va = dayOrder.indexOf(a.day);
        vb = dayOrder.indexOf(b.day);
        return sortOrder === 1 ? va - vb : vb - va;
      } else if (sort === "start_time") {
        va = a.start_time || "";
        vb = b.start_time || "";
      } else if (sort === "enrolled_count") {
        va = a.enrolled_count || 0;
        vb = b.enrolled_count || 0;
        return sortOrder === 1 ? va - vb : vb - va;
      } else {
        va = a[sort] ?? "";
        vb = b[sort] ?? "";
      }
      return sortOrder === 1
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });

    const total = sections.length;
    const totalPages = Math.max(1, Math.ceil(total / Number(limit)));
    const paginated = sections.slice(skip, skip + Number(limit));

    return res.status(200).json({
      success: true,
      sections: paginated,
      total,
      page: Number(page),
      totalPages,
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching sections",
      error: error.message,
    });
  }
};

// إنشاء سكشن مع التحقق من التضارب (المادة، المعلم، القاعة)
exports.createSection = async (req, res) => {
  try {
    const {
      sectionNumber,
      course_id,
      semester_id,
      instructor_id,
      room_id,
      day,
      start_time,
      end_time,
      capacity,
    } = req.body;

    const section = await Section.create({
      sectionNumber,
      course_id,
      semester_id,
      instructor_id,
      room_id,
      day,
      start_time,
      end_time,
      capacity,
    });

    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تعديل سكشن - إذا كانت السعة زادت، حاول ترقية طلاب من الويتب ليست
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const existing = await Section.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Section not found" });
    }

    const oldCapacity = existing.capacity;
    Object.assign(existing, updates);
    await existing.save();

    if (updates.capacity && updates.capacity > oldCapacity) {
      // إمكانية ترقية عدد من الطلاب وفق الفارق
      const spots = updates.capacity - oldCapacity;
      for (let i = 0; i < spots; i++) {
        await promoteNextFromWaitlist(id);
      }
    }

    res.status(200).json(existing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف سكشن
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }
    await section.deleteOne();
    res.status(200).json({ success: true, message: "Section deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
