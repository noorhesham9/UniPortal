const mongoose = require('mongoose');

const allowedUserSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true, // يمنع تكرار نفس الرقم التعريفي في القائمة
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // يسمح بترك الإيميل فارغاً إذا كان الأدمن لا يعرفه مسبقاً
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true // يسمح للأدمن بإيقاف صلاحية التسجيل لهذا الرقم في أي وقت
  },
  isRegistered: {
    type: Boolean,
    default: false // تتحول لـ true بمجرد أن يقوم الطالب بإنشاء حسابه فعلياً
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // تسجيل من الأدمن الذي أضاف هذا الرقم
  }
}, { timestamps: true });

module.exports = mongoose.model('AllowedUser', allowedUserSchema);