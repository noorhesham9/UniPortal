const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:         { type: String, default: "" },
    fileUrl:      { type: String, default: null },
    filePublicId: { type: String, default: null },
    fileName:     { type: String, default: null },
    fileType:     { type: String, default: null }, // "image" | "pdf"
    isRead:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index — speeds up conversation queries and conditional polling
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
// Index for unread count aggregation
messageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model("Message", messageSchema);
