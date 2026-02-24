const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    term: { type: String, required: true }, // مثال: Spring, Fall
    is_active: { type: Boolean, default: false },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    max_credits_rules: { type: String }, 
    add_drop_start: { type: Date, required: true },
    add_drop_end: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);