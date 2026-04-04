const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true, // يسمح بتركه فارغاً للأدوار الأخرى غير الطلاب
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    level: {
      type: String,
      enum: ["1", "2", "3", "4"],
      default : "1",
      sparse: true, 
    },
    is_active: {
      type: Boolean,
      default: true,
    },

    // indicates that the student has paid their tuition/fees for the current academic year
    feesPaid: {
      type: Boolean,
      default: false,
    },

    // convenience flag — true when the user's role is "student"
    isStudent: {
      type: Boolean,
      default: false,
    },

    profilePhoto: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    // One receipt entry per academic year e.g. "2025-2026"
    tuitionReceipts: {
      type: [
        {
          academicYear: { type: String, required: true }, // e.g. "2025-2026"
          url: { type: String, default: null },
          publicId: { type: String, default: null },
          uploadedAt: { type: Date, default: null },
          status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
          rejectionReason: { type: String, default: null },
          reviewedAt: { type: Date, default: null },
        },
      ],
      default: [],
    },

    // Academic advisor assigned to this student
    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Cumulative GPA (0.0 – 4.0 or 5.0 depending on your scale)
    gpa: {
      type: Number,
      default: 0,
      min: 0,
    },

    fcmToken: {
      type: String,
      default: null,
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto-set isStudent based on the populated role name
userSchema.pre("save", async function () {
  if (this.isModified("role")) {
    try {
      const Role = mongoose.model("Role");
      const role = await Role.findById(this.role).select("name");
      this.isStudent = role?.name === "student";
    } catch (_) {
      // non-blocking — leave isStudent as-is
    }
  }
});

module.exports = mongoose.model("User", userSchema);
