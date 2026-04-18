const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  label: { type: String, default: "" }, // e.g. "Quiz 1"
  max:   { type: Number, default: 10 },
}, { _id: false });

const gradeConfigSchema = new mongoose.Schema({
  section_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
    unique: true,
  },
  quizzes:        { type: [quizSchema], default: [] }, // dynamic list
  year_work_max:  { type: Number, default: 40 },
  final_max:      { type: Number, default: 60 },
  // breakdown inside year_work (optional labels)
  attendance_max: { type: Number, default: 0 },
  midterm_max:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("GradeConfig", gradeConfigSchema);
