const StudyPlan = require("../models/StudyPlan");
const Course = require("../models/course.model");
const Department = require("../models/Department");

/**
 * GET /api/v1/study-plan
 * Query params: department_id, academic_year (optional), semester_num (optional)
 * Accessible by all authenticated users.
 */
exports.getStudyPlan = async (req, res) => {
  try {
    const { department_id, academic_year, semester_num } = req.query;

    if (!department_id) {
      return res.status(400).json({
        success: false,
        message: "department_id is required",
      });
    }

    const filter = { department: department_id };
    if (academic_year) filter.academic_year = Number(academic_year);
    if (semester_num) filter.semester_num = Number(semester_num);

    const entries = await StudyPlan.find(filter)
      .populate({
        path: "course",
        populate: { path: "prerequisites_array", select: "code title" },
        select: "code title credits required_room_type prerequisites_array is_activated",
      })
      .sort({ academic_year: 1, semester_num: 1, "course.code": 1 });

    // Flatten: attach plan-level fields onto the course object for easy frontend use
    const courses = entries.map((entry) => ({
      _id: entry.course._id,
      planEntryId: entry._id,
      code: entry.course.code,
      title: entry.course.title,
      credits: entry.course.credits,
      required_room_type: entry.course.required_room_type,
      prerequisites_array: entry.course.prerequisites_array,
      is_activated: entry.course.is_activated,
      course_type: entry.course_type,
      academic_year: entry.academic_year,
      semester_num: entry.semester_num,
    }));

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("getStudyPlan error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching study plan",
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/study-plan
 * Body: { department_id, course_id, academic_year, semester_num, course_type }
 * Admin only.
 */
exports.addCourseToStudyPlan = async (req, res) => {
  try {
    const { department_id, course_id, academic_year, semester_num, course_type } = req.body;

    if (!department_id || !course_id || !academic_year || !semester_num) {
      return res.status(400).json({
        success: false,
        message: "department_id, course_id, academic_year, and semester_num are required",
      });
    }

    // Verify department and course exist
    const [dept, course] = await Promise.all([
      Department.findById(department_id),
      Course.findById(course_id),
    ]);

    if (!dept) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const entry = await StudyPlan.create({
      department: department_id,
      course: course_id,
      academic_year: Number(academic_year),
      semester_num: Number(semester_num),
      course_type: course_type || "إجباري",
    });

    const populated = await StudyPlan.findById(entry._id).populate(
      "course",
      "code title credits required_room_type",
    );

    return res.status(201).json({
      success: true,
      message: "Course added to study plan",
      entry: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This course is already in the study plan for this department/year/semester",
      });
    }
    console.error("addCourseToStudyPlan error:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding course to study plan",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/v1/study-plan/:entryId
 * Body: { course_type, academic_year, semester_num }
 * Admin only — update a plan entry.
 */
exports.updateStudyPlanEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { course_type, academic_year, semester_num } = req.body;

    const entry = await StudyPlan.findById(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Study plan entry not found" });
    }

    if (course_type !== undefined) entry.course_type = course_type;
    if (academic_year !== undefined) entry.academic_year = Number(academic_year);
    if (semester_num !== undefined) entry.semester_num = Number(semester_num);

    await entry.save();

    const populated = await StudyPlan.findById(entry._id).populate(
      "course",
      "code title credits",
    );

    return res.status(200).json({
      success: true,
      message: "Study plan entry updated",
      entry: populated,
    });
  } catch (error) {
    console.error("updateStudyPlanEntry error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating study plan entry",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/v1/study-plan/:entryId
 * Admin only — remove a course from the study plan.
 */
exports.removeCourseFromStudyPlan = async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await StudyPlan.findByIdAndDelete(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Study plan entry not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Course removed from study plan",
    });
  } catch (error) {
    console.error("removeCourseFromStudyPlan error:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing course from study plan",
      error: error.message,
    });
  }
};
