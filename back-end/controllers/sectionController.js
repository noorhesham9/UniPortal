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

    return res.status(200).json({ success: true, sections });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// جلب السكشنز حسب الترم واختياريًا حسب الكورس (للعرض للطالب)
exports.getSections = async (req, res) => {
  try {
    const { semesterId, courseId } = req.query;
    if (!semesterId) {
      return res.status(400).json({
        success: false,
        message: "semesterId query is required",
      });
    }
    const filter = { semester_id: semesterId };
    if (courseId) filter.course_id = courseId;

    const sections = await Section.find(filter)
      .populate("course_id", "code title credits")
      .populate("instructor_id", "name")
      .populate("room_id", "room_name building_section type capacity")
      .sort({ course_id: 1, sectionNumber: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      sections,
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

// يمكن إضافة دوال أخرى مثل الحذف أو الاستعلام، ولكن لم يتم طلبها هنا
