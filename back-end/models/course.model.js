
const mongoose = require('mongoose'); 

const courseSchema = new mongoose.Schema({
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },

  code: {
    type: String,
    required: true,
    unique: true
  },

  title: {
    type: String,
    required: true
  },

  credits: {
    type: Number,
    required: true,
    min: 1
  },

  level: {
    type: String,  
    required: true
  },

  required_room_type: {
    type: String,
    enum: ['Lab', 'Lecture Hall', 'Tutorial'],
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

}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);