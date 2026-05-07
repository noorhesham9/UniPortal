const {
  generateScheduleOptions,
  validateSchedule,
} = require("../utils/scheduleGenerator");
const { generateSchedulesWithGemini } = require("../utils/geminiScheduler");
const Course = require("../models/course.model");
const User = require("../models/User");
const Room = require("../models/room.model");
const Section = require("../models/Section");
const Semester = require("../models/Semester");

/**
 * Generate schedule options based on input
 * POST /api/v1/schedule-generator/generate
 */
const generateSchedules = async (req, res) => {
  try {
    const {
      courseIds,
      instructorIds,
      roomIds,
      semesterId,
      departmentId,
      numOptions = 3,
      courseConstraints = {},
      instructorConstraints = {},
      roomConstraints = {},
      courseInstructorMap = {}, // { [courseId]: [instructorId, ...] }
    } = req.body;

    // Validate input
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one course",
      });
    }

    // Fetch data
    const [courses, instructors, rooms, semester] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }).lean(),
      User.find({ _id: { $in: instructorIds }, role: { $exists: true } })
        .populate("role")
        .lean(),
      Room.find({ _id: { $in: roomIds } }).lean(),
      Semester.findById(semesterId).lean(),
    ]);

    // Validate fetched data
    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found",
      });
    }

    if (instructors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No instructors found",
      });
    }

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No rooms found",
      });
    }

    // Generate schedule options — try Gemini first, fall back to CSP algorithm
    let schedules;
    let generatedBy = "gemini";
    let geminiError = null;

    if (
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
    ) {
      try {
        schedules = await generateSchedulesWithGemini(
          courses,
          instructors,
          rooms,
          numOptions,
          courseConstraints,
          instructorConstraints,
          roomConstraints,
          courseInstructorMap,
        );
      } catch (geminiErr) {
        console.error("Gemini error details:", geminiErr.message);
        console.error("Gemini error stack:", geminiErr.stack);
        generatedBy = "csp_fallback";
        geminiError = geminiErr.message;
        schedules = await generateScheduleOptions(
          {
            courses,
            instructors,
            rooms,
            semester,
            department: departmentId,
            courseInstructorMap,
          },
          numOptions,
        );
      }
    } else {
      generatedBy = "csp";
      schedules = await generateScheduleOptions(
        {
          courses,
          instructors,
          rooms,
          semester,
          department: departmentId,
          courseInstructorMap,
        },
        numOptions,
      );
    }

    res.status(200).json({
      success: true,
      schedules,
      generatedBy,
      geminiError,
      metadata: {
        coursesCount: courses.length,
        instructorsCount: instructors.length,
        roomsCount: rooms.length,
        optionsGenerated: schedules.length,
      },
    });
  } catch (error) {
    console.error("Error generating schedules:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate schedules",
      error: error.message,
    });
  }
};

/**
 * Validate a schedule for conflicts
 * POST /api/v1/schedule-generator/validate
 */
const validateScheduleEndpoint = async (req, res) => {
  try {
    const { schedule } = req.body;

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule format",
      });
    }

    const conflicts = validateSchedule(schedule);

    res.status(200).json({
      success: true,
      valid: conflicts.length === 0,
      conflicts,
    });
  } catch (error) {
    console.error("Error validating schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate schedule",
      error: error.message,
    });
  }
};

/**
 * Save a generated schedule to database
 * POST /api/v1/schedule-generator/save
 */
const saveSchedule = async (req, res) => {
  try {
    const { schedule, semesterId } = req.body;

    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule data",
      });
    }

    if (!semesterId) {
      return res.status(400).json({
        success: false,
        message: "Semester ID is required",
      });
    }

    // Validate schedule first
    const conflicts = validateSchedule(schedule);
    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Schedule has conflicts and cannot be saved",
        conflicts,
      });
    }

    // Create sections
    const sectionsToCreate = schedule.map((section) => ({
      sectionNumber: section.sectionNumber,
      course_id: section.course,
      semester_id: semesterId,
      instructor_id: section.instructor,
      room_id: section.room,
      day: section.day,
      start_time: section.timeSlot.start,
      end_time: section.timeSlot.end,
      capacity: section.capacity,
      enrolled_count: 0,
      status: "Open",
    }));

    const createdSections = await Section.insertMany(sectionsToCreate);

    console.log(
      `✅ Saved ${createdSections.length} sections for semester ${semesterId}`,
    );
    createdSections.forEach((s) =>
      console.log(
        `  - Section ${s._id}: course=${s.course_id}, semester=${s.semester_id}`,
      ),
    );

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdSections.length} sections`,
      sections: createdSections,
    });
  } catch (error) {
    console.error("Error saving schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save schedule",
      error: error.message,
    });
  }
};

/**
 * Get available resources for schedule generation
 * GET /api/v1/schedule-generator/resources
 */
const getAvailableResources = async (req, res) => {
  try {
    const { departmentId, semesterId } = req.query;

    const query = {};
    if (departmentId) {
      query.department = departmentId;
    }

    const [courses, instructors, rooms, semesters] = await Promise.all([
      Course.find({ is_activated: true }).populate("department").lean(),
      User.find({ role: { $exists: true } })
        .populate("role")
        .populate("department")
        .lean()
        .then((users) => users.filter((u) => u.role?.name === "professor")),
      Room.find({}).lean(),
      Semester.find({}).sort({ year: -1, term: -1 }).lean(),
    ]);

    res.status(200).json({
      success: true,
      resources: {
        courses,
        instructors,
        rooms,
        semesters,
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resources",
      error: error.message,
    });
  }
};

module.exports = {
  generateSchedules,
  validateScheduleEndpoint,
  saveSchedule,
  getAvailableResources,
};
