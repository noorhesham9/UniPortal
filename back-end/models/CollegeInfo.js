const mongoose = require("mongoose");

const collegeInfoSchema = new mongoose.Schema(
  {
    deanMessage: {
      name: { type: String, default: "" },
      title: { type: String, default: "عميد الكلية" },
      message: { type: String, default: "" },
      imageUrl: { type: String, default: "" },
    },
    viceMessage: {
      name: { type: String, default: "" },
      title: { type: String, default: "وكيل الكلية" },
      message: { type: String, default: "" },
      imageUrl: { type: String, default: "" },
    },
    aboutText: { type: String, default: "" },
    vision: { type: String, default: "" },
    mission: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollegeInfo", collegeInfoSchema);
