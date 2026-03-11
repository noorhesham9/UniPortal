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

    // indicates that the student has paid their tuition/fees for the semester
    feesPaid: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("User", userSchema);
