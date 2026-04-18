const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    status: {
        
        type: String,
        enum: ['Pending', 'Enrolled', 'Waitlist', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    advisor_notes: {
        type: String,
        default: ''
    },
    grades_object: {
        type: Object,
        default: {}
    },
    isGradeLocked: {
        type: Boolean,
        default: false
    },
    isYearWorkLocked: {
        type: Boolean,
        default: false
    },
    isFinalExamLocked: {
        type: Boolean,
        default: false
    },
    completed_hours: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true // السطر ده مهم جداً عشان الـ Waitlist ترتيبه بيعتمد على وقت التسجيل
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);