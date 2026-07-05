const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  
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
  rollNumber: {
    type: String,
    trim: true,
    default: null
  },
  department: {
    type: String,
    trim: true,
    default: null
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

module.exports = mongoose.model('Student', studentSchema);