const mongoose = require("mongoose");

/**
 * A StudyPlan entry maps one course to a specific
 * department + academic year + semester slot.
 * Multiple entries together form the full study plan for a department.
 */
const studyPlanSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // 1-4  (year of study)
    academic_year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    // 1 = first semester, 2 = second semester, 3 = summer
    semester_num: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    course_type: {
      type: String,
      enum: ["إجباري", "اختياري"],
      default: "إجباري",
    },
  },
  { timestamps: true },
);

// Prevent duplicate entries for the same course in the same plan slot
studyPlanSchema.index(
  { department: 1, course: 1, academic_year: 1, semester_num: 1 },
  { unique: true },
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
