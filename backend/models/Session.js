const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  sessionCode: {
    type: String,
    required: true,
    unique: true
  },
  topics: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);