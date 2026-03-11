const mongoose = require("mongoose");

const sliceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },

    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
    levels: [String],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    min_gpa: { type: Number, default: 0 },
    max_gpa: { type: Number, default: 5 },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RegistrationSlice", sliceSchema);
