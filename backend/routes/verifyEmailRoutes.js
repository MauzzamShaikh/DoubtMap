const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');

// Reusable send verification email function
async function sendVerificationEmail(user, role) {
  const token = crypto.randomBytes(32).toString('hex');
  user.verifyToken = token;
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${role}/${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify your Classroom Doubt Heatmap email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Verify Your Email</h2>
        <p>Hi ${user.name},</p>
        <p>Click below to verify your email address.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#888;font-size:12px;">If you didn't create this account, ignore this email.</p>
      </div>
    `
  });
}

// GET /api/verify-email/teacher/:token
router.get('/teacher/:token', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ verifyToken: req.params.token });
    if (!teacher) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }
    teacher.isVerified = true;
    teacher.verifyToken = null;
    await teacher.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /api/verify-email/student/:token
router.get('/student/:token', async (req, res) => {
  try {
    const student = await Student.findOne({ verifyToken: req.params.token });
    if (!student) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }
    student.isVerified = true;
    student.verifyToken = null;
    await student.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
module.exports.sendVerificationEmail = sendVerificationEmail;