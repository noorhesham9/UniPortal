const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ["news", "document", "event"], default: "news" },
    status: { type: String, enum: ["active", "draft", "archived"], default: "draft" },
    fileUrl:       { type: String },
    filePublicId:  { type: String },
    fileSize:      { type: String },
    fileName:      { type: String }, // display name shown to users
    imageUrl:      { type: String },
    imagePublicId: { type: String },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
