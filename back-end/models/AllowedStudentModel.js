const mongoose = require('mongoose');

const allowedUserSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    trim: true,
  },
  examSeatNumber: {
    type: String,
    required: [true, 'Exam seat number is required'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    set: (v) => (v?.trim() === "" ? undefined : v?.trim()?.toLowerCase()),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('AllowedUser', allowedUserSchema);
