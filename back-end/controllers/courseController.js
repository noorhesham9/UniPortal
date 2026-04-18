const Course = require("../models/course.model");
const Semester = require("../models/Semester");
const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");
const RegistrationSlice = require("../models/RegistrationSlice");

// Get courses available for the authenticated student
exports.getAvailableCourses = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, message: "Authentication required" });
    }

    // 0. Check registration slice eligibility
    const now = new Date();
    const activeSlices = await RegistrationSlice.find({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
    }).populate("departments", "name");

    if (activeSlices.length > 0) {
      const eligible = activeSlices.some((slice) => {
        const inStudents = slice.students?.some((id) =>
          id.equals(req.user._id),
        );
        const inDepartment = slice.departments?.some((d) =>
          d._id.equals(req.user.department),
        );
        const inLevel = slice.levels?.includes(String(req.user.level));
        return inStudents || inDepartment || inLevel;
      });

      if (!eligible) {
        const slice = activeSlices[0];
        return res.status(403).json({
          success: false,
          message: "Registration is not open for your group yet.",
          sliceLocked: true,
          activeSlice: {
            name: slice.name,
            start_date: slice.start_date,
            end_date: slice.end_date,
            levels: slice.levels,
            departments: slice.departments,
          },
        });
      }
    } else {
      // No active slices at all — registration is fully closed
      return res.status(403).json({
        success: false,
        message:
          "Registration is currently closed. No active registration window.",
        sliceLocked: true,
        registrationClosed: true,
      });
    }

    // 1. Find active semester
    const activeSemester = await Semester.findOne({ is_active: true });
    if (!activeSemester) {
      return res
        .status(404)
        .json({ success: false, message: "No active semester found" });
    }

    const userLevel = Number(req.user.level) || 1;

    // 2. Get enrollments for CURRENT semester only (to exclude already-enrolled this term)
    const currentEnrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: "section",
        populate: { path: "course_id", select: "_id" },
      })
      .lean();

    // Courses enrolled in the ACTIVE semester (exclude from available list)
    const enrolledThisSemesterCourseIds = currentEnrollments
      .filter((e) => {
        const sec = e.section;
        return sec?.semester_id?.toString() === activeSemester._id.toString();
      })
      .map((e) => e.section?.course_id?._id)
      .filter(Boolean);

    // 3. Get all passed course IDs (for prerequisite checking)
    // A course is "passed" if the enrollment is grade-locked and letter_grade != 'F'
    const passedCourseIds = new Set(
      currentEnrollments
        .filter((e) => {
          const g = e.grades_object || {};
          return e.isGradeLocked && g.letter_grade && g.letter_grade !== "F";
        })
        .map((e) => e.section?.course_id?._id?.toString())
        .filter(Boolean),
    );

    // 4. Build filters
    const departmentFilter = req.user.department
      ? {
          $or: [
            { department: null },
            { department: { $exists: false } },
            { department: req.user.department },
          ],
        }
      : { $or: [{ department: null }, { department: { $exists: false } }] };

    const levelFilter = {
      $or: [
        { min_level: { $lte: userLevel } },
        { min_level: null },
        { min_level: { $exists: false } },
      ],
    };

    // 5. Fetch candidate courses
    const candidateCourses = await Course.find({
      $and: [
        departmentFilter,
        levelFilter,
        { _id: { $nin: enrolledThisSemesterCourseIds } },
        { is_activated: true },
      ],
    })
      .populate("prerequisites_array", "code title _id")
      .sort({ code: 1 });

    // 6. Filter by prerequisites — student must have PASSED all prerequisites
    const availableCourses = candidateCourses.filter((course) => {
      if (
        !course.prerequisites_array ||
        course.prerequisites_array.length === 0
      )
        return true;
      return course.prerequisites_array.every((prereq) =>
        passedCourseIds.has(prereq._id.toString()),
      );
    });

    const availableCourseIds = availableCourses.map((c) => c._id);

    // 7. Fetch sections for those courses in the active semester
    const sections = await Section.find({
      semester_id: activeSemester._id,
      course_id: { $in: availableCourseIds },
    })
      .populate("course_id", "code title credits")
      .populate("instructor_id", "name")
      .populate("room_id", "room_name type capacity")
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
      },
      enrolledCoursesCount: enrolledThisSemesterCourseIds.length,
      availableCoursesCount: availableCourses.length,
      courses: availableCourses,
      sections,
    });
  } catch (error) {
    console.error("❌ Error fetching available courses:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching available courses",
      error: error.message,
    });
  }
};

// Create a new course with department and level info
exports.createCourse = async (req, res) => {
  try {
    const {
      code,
      title,
      credits,
      required_room_type,
      prerequisites_array,
      is_activated,
      department,
      min_level,
    } = req.body;

    if (!code || !title || !credits || !required_room_type) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Required fields: code, title, credits, required_room_type",
      });
    }

    const validRoomTypes = ["Lab", "Lecture Hall", "Tutorial"];
    if (!validRoomTypes.includes(required_room_type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid required_room_type. Must be one of: Lab, Lecture Hall, Tutorial",
      });
    }

    const newCourse = new Course({
      code: code.toUpperCase().trim(),
      title: title.trim(),
      credits,
      required_room_type,
      prerequisites_array: prerequisites_array || [],
      is_activated: is_activated !== undefined ? is_activated : true,
      department: department || null,
      min_level: min_level || 1,
    });

    console.log("📝 Creating new course:");
    console.log("  - Code:", newCourse.code);
    console.log("  - Title:", newCourse.title);
    console.log("  - Department:", newCourse.department || "NONE");
    console.log("  - Min Level:", newCourse.min_level);
    console.log("  - Activated:", newCourse.is_activated);

    const savedCourse = await newCourse.save();
    const populatedCourse = await Course.findById(savedCourse._id).populate(
      "prerequisites_array",
      "code title",
    );

    console.log("✅ Course created successfully:", populatedCourse._id);

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: populatedCourse,
    });
  } catch (error) {
    console.error("❌ Error creating course:", error.message);
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
      return res
        .status(400)
        .json({ success: false, message: "semesterId is required" });
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
      courses = courses.filter(
        (c) => !c.department || c.department.toString() === department_id,
      );
    }

    courses.sort((a, b) => a.code.localeCompare(b.code));

    return res
      .status(200)
      .json({ success: true, total: courses.length, courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all courses (admin). Optionally filter by department via StudyPlan.
exports.toggleCourseActive = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
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
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const activeSemester = await Semester.findOne({ is_active: true });
    if (!activeSemester)
      return res
        .status(404)
        .json({ success: false, message: "No active semester" });

    // Check if already offered (section exists for this course in active semester)
    const existing = await Section.findOne({
      course_id: course._id,
      semester_id: activeSemester._id,
    });
    if (existing)
      return res.status(400).json({
        success: false,
        message: "Course already offered this semester",
      });

    const {
      instructor_id,
      room_id,
      day,
      start_time,
      end_time,
      capacity,
      sectionNumber,
    } = req.body;
    if (
      !instructor_id ||
      !room_id ||
      !day ||
      !start_time ||
      !end_time ||
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "instructor_id, room_id, day, start_time, end_time, capacity are required",
      });
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
// Get single course by ID — also returns department and level info
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("prerequisites_array", "code title")
      .populate("department", "name code");
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    return res.status(200).json({ success: true, course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update course — directly update department and level fields
exports.updateCourse = async (req, res) => {
  try {
    const {
      title,
      credits,
      required_room_type,
      prerequisites_array,
      is_activated,
      department,
      min_level,
    } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (title !== undefined) course.title = title.trim();
    if (credits !== undefined) course.credits = credits;
    if (required_room_type !== undefined)
      course.required_room_type = required_room_type;
    if (prerequisites_array !== undefined)
      course.prerequisites_array = prerequisites_array;
    if (is_activated !== undefined) course.is_activated = is_activated;
    if (department !== undefined) course.department = department || null;
    if (min_level !== undefined) course.min_level = min_level || 1;
    await course.save();

    const populated = await Course.findById(course._id).populate(
      "prerequisites_array",
      "code title",
    );
    return res.status(200).json({ success: true, course: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const filter = {};

    if (req.query.department_id) {
      filter.$or = [
        { department: req.query.department_id },
        { department: null },
      ];
    }

    // Search by code or title
    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), "i");
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: [{ code: regex }, { title: regex }] },
        ];
        delete filter.$or;
      } else {
        filter.$or = [{ code: regex }, { title: regex }];
      }
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
    return res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message,
    });
  }
};
