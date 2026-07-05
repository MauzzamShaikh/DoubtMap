const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  subjectsTaught: {
    type: [String],
    default: []
  },
  designation: {
    type: String,
    default: 'Lecturer'
    // e.g. Assistant Professor, Associate Professor, HOD, etc.
  },
  resetToken: {
  type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  isVerified: {
  type: Boolean,
  default: false
  },
  verifyToken: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);