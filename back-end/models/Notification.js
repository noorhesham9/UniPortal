const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ["advisor", "admin", "system"],
    default: "system",
  },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
