
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    room_name: { type: String, required: true }, // بديل room_number لو حابب
    building_section: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['Physics Lab', 'Lecture Hall', 'Tutorial', 'Lab'], // زودت أنواع حسب الديزاين
        required: true 
    },
    capacity: { type: Number, required: true, min: 1 },
    equipment_notes: { type: String },
    is_active: { type: Boolean, default: true },
    keycard_access: { type: Boolean, default: false },
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;