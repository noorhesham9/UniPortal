const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'يجب تحديد القسم التابع له الكورس'],
    index: true 
  },

  code: {
    type: String,
    required: true,
    unique: true,
    trim: true, 
    uppercase: true 
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  credits: {
    type: Number,
    required: true,
    min: [1, 'عدد الساعات المعتمدة لا يمكن أن يقل عن 1'],
    max: [6, 'عدد الساعات المعتمدة لا يتخطى غالباً 6']
  },

  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10, 
    index: true
  },

  required_room_type: {
    type: String,
    enum: {
      values: ['Lab', 'Lecture Hall', 'Tutorial'],
      message: '{VALUE} نوع القاعة غير مدعوم'
    },
    required: true
  },

  prerequisites_array: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  ],

  is_activated: {
    type: Boolean,
    default: true
  }

}, { 
  timestamps: true 
});

courseSchema.virtual('department_info', {
  ref: 'Department',
  localField: 'department_id',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Course', courseSchema);