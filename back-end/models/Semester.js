const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true
    },
    term: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: false
    },
    show_final_results: {
        type: Boolean,
        default: false
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    max_credits_rules: {
        type: String
    },
    add_drop_start: {
        type: Date
    },
    add_drop_end: {
        type: Date
    }

}, { timestamps: true });

module.exports = mongoose.model('Semester', SemesterSchema);