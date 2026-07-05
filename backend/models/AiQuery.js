const mongoose = require('mongoose');

const aiQuerySchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    default: 'General'
  }
}, { timestamps: true });

module.exports = mongoose.model('AiQuery', aiQuerySchema);