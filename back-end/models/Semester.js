const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    term: { type: String, required: true }, // مثال: Spring, Fall
    is_active: { type: Boolean, default: false },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    max_credits_rules: { type: String }, 
    add_drop_start: { type: Date, required: true },
    add_drop_end: { type: Date, required: true },
    /** عرض المقررات: current_only = المستوى الحالي فقط، current_and_lower = المستوى الحالي + المستويات الأدنى */
    course_visibility_levels: { type: String, enum: ['current_only', 'current_and_lower'], default: 'current_only' }
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);