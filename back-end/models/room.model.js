
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_number: {
    type: String,
    required: true,
    unique: true  
  },

  type: {
    type: String,
    enum: ['Lab', 'Lecture Hall', 'Tutorial'], 
    required: true
  },

  capacity: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true  
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;