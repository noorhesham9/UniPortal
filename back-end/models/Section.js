const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({

    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    
    day: { type: String, required: true },
    start_time: { type: String, required: true }, 
    end_time: { type: String, required: true },
    capacity: { type: Number, required: true },
    waitlist: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joined_at: { type: Date, default: Date.now },
        priority: { type: Number, default: 0 } 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);
