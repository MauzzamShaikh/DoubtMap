const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');

// POST /api/forgot-password/teacher
router.post('/teacher', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      // Don't reveal if email exists or not — security best practice
      return res.json({ message: 'If this email exists, a reset link has been sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    teacher.resetToken = token;
    teacher.resetTokenExpiry = expiry;
    await teacher.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/teacher/${token}`;

    await sendEmail({
      to: email,
      subject: 'Reset your Classroom Doubt Heatmap password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${teacher.name},</p>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#888;font-size:12px;">If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'If this email exists, a reset link has been sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// POST /api/forgot-password/student
router.post('/student', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const student = await Student.findOne({ email });
    if (!student) {
      return res.json({ message: 'If this email exists, a reset link has been sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60);

    student.resetToken = token;
    student.resetTokenExpiry = expiry;
    await student.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/student/${token}`;

    await sendEmail({
      to: email,
      subject: 'Reset your Classroom Doubt Heatmap password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${student.name},</p>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#888;font-size:12px;">If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'If this email exists, a reset link has been sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// POST /api/forgot-password/reset/teacher
router.post('/reset/teacher', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const teacher = await Teacher.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!teacher) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    teacher.password = await bcrypt.hash(password, 10);
    teacher.resetToken = null;
    teacher.resetTokenExpiry = null;
    await teacher.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// POST /api/forgot-password/reset/student
router.post('/reset/student', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const student = await Student.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!student) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    student.password = await bcrypt.hash(password, 10);
    student.resetToken = null;
    student.resetTokenExpiry = null;
    await student.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;