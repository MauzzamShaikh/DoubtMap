const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  question: {
    type: String,
    default: 'How confident do you feel about this topic?'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  responses: {
    confused: { type: Number, default: 0 },
    okay: { type: Number, default: 0 },
    confident: { type: Number, default: 0 }
  },
  voterFingerprints: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Poll', pollSchema);