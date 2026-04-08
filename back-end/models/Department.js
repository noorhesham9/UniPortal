const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    head_member: {
      type: String, // name of the head of department
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Hold"],
      default: "Active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Department", departmentSchema);
