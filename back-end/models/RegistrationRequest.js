const mongoose = require('mongoose');

const registrationRequestSchema = new mongoose.Schema({
  // Data entered by student
  studentId:      { type: String, required: true, trim: true },
  nationalId:     { type: String, required: true, trim: true },
  examSeatNumber: { type: String, required: true, trim: true },
  fullName:       { type: String, required: true, trim: true },
  personalEmail:  { type: String, required: true, lowercase: true, trim: true },

  // ID card photo uploaded to Cloudinary
  idCardImageUrl:      { type: String },
  idCardImagePublicId: { type: String },

  // Email verification
  emailVerified:      { type: Boolean, default: false },
  emailVerifyToken:   { type: String },
  emailVerifyExpires: { type: Date },

  // Admin approval
  status: {
    type: String,
    enum: ['pending_email', 'pending_approval', 'approved', 'rejected'],
    default: 'pending_email',
  },
  adminNote:    { type: String },
  reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt:   { type: Date },

  // Activation token — generated on approval, sent via email
  activationToken:   { type: String },
  activationExpires: { type: Date },

  // Brute force protection for security challenge
  challengeAttempts:   { type: Number, default: 0 },
  challengeLockedUntil: { type: Date },

  // Firebase UID — set after student completes Firebase registration post-approval
  firebaseUid: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('RegistrationRequest', registrationRequestSchema);
