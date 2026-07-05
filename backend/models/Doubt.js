const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  studentFingerprint: {
    type: String,
    default: null
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    default: 'General'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  voterFingerprints: {
    type: [String],
    default: []
  },
  resolved: {
    type: Boolean,
    default: false
  },
  aiAttempted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Doubt', doubtSchema);
