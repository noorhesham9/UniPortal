const Course = require("../models/course.model");
const Semester = require("../models/Semester");
const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");
const StudyPlan = require("../models/StudyPlan");
const RegistrationSlice = require("../models/RegistrationSlice");

// Get courses available for the authenticated student
exports.getAvailableCourses = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ success: false, message: "Authentication required" });
    }
    if (!req.user.level) {
      return res.status(400).json({ success: false, message: "User level is required" });
    }

    // 0. Check registration slice eligibility
    const now = new Date();
    const activeSlices = await RegistrationSlice.find({
      is_active: true,
      start_date: { $lte: now },
      end_date:   { $gte: now },
    }).populate("departments", "name");

    if (activeSlices.length > 0) {
      const eligible = activeSlices.some((slice) => {
        const inStudents   = slice.students?.some((id) => id.equals(req.user._id));
        const inDepartment = slice.departments?.some((d) => d._id.equals(req.user.department));
        const inLevel      = slice.levels?.includes(String(req.user.level));
        return inStudents || inDepartment || inLevel;
      });

      if (!eligible) {
        // Return the active slice info so the frontend can show why
        const slice = activeSlices[0];
        return res.status(403).json({
          success: false,
          message: "Registration is not open for your group yet.",
          sliceLocked: true,
          activeSlice: {
            name:        slice.name,
            start_date:  slice.start_date,
            end_date:    slice.end_date,
            levels:      slice.levels,
            departments: slice.departments,
          },
        });
      }
    }

    // 1. Find active semester
    const activeSemester = await Semester.findOne({ is_active: true });
    if (!activeSemester) {
      return res.status(404).json({ success: false, message: "No active semester found" });
    }

    // 2. Get course IDs the student is already enrolled in
    const enrollments = await Enrollment.find({ student: req.user._id }).populate({
      path: "section",
      select: "course_id",
    });
    const enrolledCourseIds = enrollments
      .map((e) => e.section?.course_id)
      .filter(Boolean);

    // 3. Build StudyPlan query based on semester visibility setting
    const userLevel = Number(req.user.level);
    const yearFilter =
      activeSemester.course_visibility_levels === "current_and_lower"
        ? { $lte: userLevel }
        : userLevel;

    const studyPlanQuery = { academic_year: yearFilter };
    if (req.user.department) {
      studyPlanQuery.department = req.user.department;
    }

    const planEntries = await StudyPlan.find(studyPlanQuery).select("course");
    const eligibleCourseIds = planEntries.map((e) => e.course);

    // 4. Filter out already-enrolled courses, keep only activated ones
    const availableCourses = await Course.find({
      _id: { $in: eligibleCourseIds, $nin: enrolledCourseIds },
      is_activated: true,
    })
      .populate("prerequisites_array", "code title")
      .sort({ code: 1 });

    const availableCourseIds = availableCourses.map((c) => c._id);

    // 5. Fetch sections for those courses in the active semester
    const sections = await Section.find({
      semester_id: activeSemester._id,
      course_id: { $in: availableCourseIds },
    })
      .populate("course_id", "code title credits")
      .populate("instructor_id", "name")
      .populate("room_id", "room_number type capacity")
      .sort({ course_id: 1, sectionNumber: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      activeSemesterId: activeSemester._id,
      semester: {
        year: activeSemester.year,
        term: activeSemester.term,
        startDate: activeSemester.start_date,
        endDate: activeSemester.end_date,
        courseVisibilityLevels: activeSemester.course_visibility_levels,
      },
      enrolledCoursesCount: enrolledCourseIds.length,
      availableCoursesCount: availableCourses.length,
      courses: availableCourses,
      sections,
    });
  } catch (error) {
    console.error("Error fetching available courses:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching available courses",
      error: error.message,
    });
  }
};

// Create a new course (catalog entry only — no department/level placement)
exports.createCourse = async (req, res) => {
  try {
    const { code, title, credits, required_room_type, prerequisites_array, is_activated } = req.body;

    if (!code || !title || !credits || !required_room_type) {
      return res.status(400).json({
        success: false,
        message: "Required fields: code, title, credits, required_room_type",
      });
    }

    const validRoomTypes = ["Lab", "Lecture Hall", "Tutorial"];
    if (!validRoomTypes.includes(required_room_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid required_room_type. Must be one of: Lab, Lecture Hall, Tutorial",
      });
    }

    const newCourse = new Course({
      code: code.toUpperCase().trim(),
      title: title.trim(),
      credits,
      required_room_type,
      prerequisites_array: prerequisites_array || [],
      is_activated: is_activated !== undefined ? is_activated : true,
    });

    const savedCourse = await newCourse.save();
    const populatedCourse = await Course.findById(savedCourse._id).populate(
      "prerequisites_array",
      "code title"
    );

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: populatedCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating course",
      error: error.message,
    });
  }
};

// Get courses that have at least one section in a given semester
exports.getOfferedCourses = async (req, res) => {
  try {
    const { semesterId, search, department_id } = req.query;
    if (!semesterId) {
      return res.status(400).json({ success: false, message: "semesterId is required" });
    }

    const sectionFilter = { semester_id: semesterId };
    const sections = await Section.find(sectionFilter)
      .populate({
        path: "course_id",
        populate: { path: "prerequisites_array", select: "code title" },
      })
      .populate("instructor_id", "name")
      .populate("room_id", "room_name type capacity")
      .lean();

    const courseMap = new Map();
    for (const sec of sections) {
      const course = sec.course_id;
      if (!course) continue;

      if (search) {
        const re = new RegExp(search.trim(), "i");
        if (!re.test(course.code) && !re.test(course.title)) continue;
      }

      const id = course._id.toString();
      if (!courseMap.has(id)) {
        courseMap.set(id, { ...course, sections: [] });
      }
      courseMap.get(id).sections.push({
        _id: sec._id,
        sectionNumber: sec.sectionNumber,
        day: sec.day,
        start_time: sec.start_time,
        end_time: sec.end_time,
        capacity: sec.capacity,
        instructor: sec.instructor_id,
        room: sec.room_id,
      });
    }

    let courses = Array.from(courseMap.values());

    if (department_id) {
      const planEntries = await StudyPlan.find({ department: department_id }).select("course").lean();
      const planIds = new Set(planEntries.map(e => e.course.toString()));
      courses = courses.filter(c => planIds.has(c._id.toString()));
    }

    courses.sort((a, b) => a.code.localeCompare(b.code));

    return res.status(200).json({ success: true, total: courses.length, courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all courses (admin). Optionally filter by department via StudyPlan.
exports.toggleCourseActive = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    course.is_activated = !course.is_activated;
    await course.save();
    return res.status(200).json({ success: true, course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Offer a course in the active semester by creating a default section
exports.offerCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const activeSemester = await Semester.findOne({ is_active: true });
    if (!activeSemester) return res.status(404).json({ success: false, message: "No active semester" });

    // Check if already offered (section exists for this course in active semester)
    const existing = await Section.findOne({ course_id: course._id, semester_id: activeSemester._id });
    if (existing) return res.status(400).json({ success: false, message: "Course already offered this semester" });

    const { instructor_id, room_id, day, start_time, end_time, capacity, sectionNumber } = req.body;
    if (!instructor_id || !room_id || !day || !start_time || !end_time || !capacity) {
      return res.status(400).json({ success: false, message: "instructor_id, room_id, day, start_time, end_time, capacity are required" });
    }

    const section = await Section.create({
      sectionNumber: sectionNumber || 1,
      course_id: course._id,
      semester_id: activeSemester._id,
      instructor_id,
      room_id,
      day,
      start_time,
      end_time,
      capacity,
    });

    return res.status(201).json({ success: true, section });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Get single course by ID — also returns which departments have it in their study plan
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("prerequisites_array", "code title");
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // Find all study plan entries for this course to know its departments
    const planEntries = await StudyPlan.find({ course: course._id })
      .populate("department", "name code")
      .lean();

    const departments = planEntries.map(e => ({
      _id: e.department._id,
      name: e.department.name,
      code: e.department.code,
      academic_year: e.academic_year,
      semester_num: e.semester_num,
      course_type: e.course_type,
      planEntryId: e._id,
    }));

    return res.status(200).json({ success: true, course, departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update course — also syncs department study plan entries
exports.updateCourse = async (req, res) => {
  try {
    const { title, credits, required_room_type, prerequisites_array, is_activated, departments } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (title !== undefined) course.title = title.trim();
    if (credits !== undefined) course.credits = credits;
    if (required_room_type !== undefined) course.required_room_type = required_room_type;
    if (prerequisites_array !== undefined) course.prerequisites_array = prerequisites_array;
    if (is_activated !== undefined) course.is_activated = is_activated;
    await course.save();

    // Sync departments via StudyPlan
    // departments = array of { department_id, academic_year, semester_num, course_type }
    // null/undefined = don't touch; empty array = remove from all departments
    if (departments !== undefined) {
      // Remove all existing plan entries for this course
      await StudyPlan.deleteMany({ course: course._id });

      // Re-create for each selected department
      if (Array.isArray(departments) && departments.length > 0) {
        const entries = departments.map(d => ({
          department: d.department_id,
          course: course._id,
          academic_year: d.academic_year,
          semester_num: d.semester_num,
          course_type: d.course_type || "إجباري",
        }));
        await StudyPlan.insertMany(entries);
      }
    }

    const populated = await Course.findById(course._id).populate("prerequisites_array", "code title");
    return res.status(200).json({ success: true, course: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    let courseIds = null;

    if (req.query.department_id) {
      const planQuery = { department: req.query.department_id };
      if (req.query.academic_year) planQuery.academic_year = Number(req.query.academic_year);
      if (req.query.semester_num) planQuery.semester_num = Number(req.query.semester_num);
      const entries = await StudyPlan.find(planQuery).select("course");
      courseIds = entries.map((e) => e.course);
    }

    const filter = courseIds ? { _id: { $in: courseIds } } : {};

    // Search by code or title
    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), "i");
      filter.$or = [{ code: regex }, { title: regex }];
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate("prerequisites_array", "code title")
      .sort({ code: 1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      courses,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return res.status(500).json({ success: false, message: "Error fetching courses", error: error.message });
  }
};
