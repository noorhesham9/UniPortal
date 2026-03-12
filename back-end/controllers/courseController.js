const Course = require("../models/course.model");
const Semester = require("../models/Semester");
const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");

// جلب المواد المتاحة للطالب
// شروط:
// 1. الترم يكون is_active = true
// 2. المادة تابعة لقسم الطالب
// 3. المادة مطابقة لمستوى الطالب
// 4. إخفاء المواد التي سجل فيها أو نجح فيها بالفعل
exports.getAvailableCourses = async (req, res) => {
  try {
    // التحقق من أن المستخدم موجود و يملك department و level
    if (!req.user ) {
      return res.status(400).json({
        success: false,
        message: "Authentication required",
      });
    }
    if ( !req.user.level){
      return res.status(400).json({
        success: false,
        message: "level is required for a user ",
      })
    }

    // البحث عن الترم الفعال
    const activeSemester = await Semester.findOne({ is_active: true });
    if (!activeSemester) {
      return res.status(404).json({
        success: false,
        message: "No active semester found",
      });
    }

    // ========== الفلترة المتقدمة ==========
    // 1. جلب جميع التسجيلات الخاصة بالطالب (سواء معتمدة أو لم)
    const enrollments = await Enrollment.find({
      student: req.user._id,
    }).populate({
      path: "section",
      select: "course_id",
    });

    // 2. استخراج جميع course_ids التي التسجيل فيها الطالب
    const enrolledCourseIds = enrollments
      .map((enrollment) => enrollment.section?.course_id)
      .filter((courseId) => courseId !== null && courseId !== undefined);

    // 3. جلب المواد المتاحة بناءً على الشروط الأساسية
    // التحكم بعرض المقررات حسب إعداد الترم: المستوى الحالي فقط أو الحالي + الأدنى
    const userLevel = +req.user.level;
    const levelFilter = activeSemester.course_visibility_levels === 'current_and_lower'
      ? { $lte: userLevel }
      : userLevel;

    const filter = {
      is_activated: true,
      _id: { $nin: enrolledCourseIds },
      level: levelFilter,
    };
    if (req.user.department) filter.department_id = req.user.department;

    const availableCourses = await Course.find(filter)
      .populate("department_id", "name code")
      .sort({ code: 1 });

    const availableCourseIds = availableCourses.map((c) => c._id);

    // 4. جلب السكشنز للترم الفعال والمواد المتاحة فقط
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
      info: {
        totalCourses: enrolledCourseIds.length + availableCourses.length,
        filteredOut: enrolledCourseIds.length,
      },
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

// إنشاء كورس جديد
exports.createCourse = async (req, res) => {
  try {
    const {
      department_id,
      code,
      title,
      credits,
      level,
      required_room_type,
      prerequisites_array,
      is_activated,
    } = req.body;

    // التحقق من الحقول المطلوبة (department_id اختياري)
    if (
      !code ||
      !title ||
      !credits ||
      !level ||
      !required_room_type
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields: code, title, credits, level, required_room_type",
      });
    }

    // التحقق من صحة required_room_type
    const validRoomTypes = ["Lab", "Lecture Hall", "Tutorial"];
    if (!validRoomTypes.includes(required_room_type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid required_room_type. Must be one of: Lab, Lecture Hall, Tutorial",
      });
    }

    // إنشاء الكورس الجديد
    const newCourse = new Course({
      ...(department_id && { department_id }),
      code: code.toUpperCase().trim(),
      title: title.trim(),
      credits,
      level,
      required_room_type,
      prerequisites_array: prerequisites_array || [],
      is_activated: is_activated !== undefined ? is_activated : true,
    });

    // حفظ الكورس
    const savedCourse = await newCourse.save();

    // إرجاع الكورس مع معلومات القسم
    const populatedCourse = await Course.findById(savedCourse._id).populate(
      "department_id",
      "name code",
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

// جلب جميع الكورسات (للـ admin)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("department_id", "name code")
      .sort({ code: 1 });

    return res.status(200).json({
      success: true,
      courses,
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
