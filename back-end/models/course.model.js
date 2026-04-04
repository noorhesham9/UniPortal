const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: [0, "Credits cannot be negative"],
      max: [6, "Credits cannot exceed 6"],
    },
    required_room_type: {
      type: String,
      enum: {
        values: ["Lab", "Lecture Hall", "Tutorial"],
        message: "{VALUE} is not a supported room type",
      },
      required: true,
    },
    prerequisites_array: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    is_activated: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Course", courseSchema);
