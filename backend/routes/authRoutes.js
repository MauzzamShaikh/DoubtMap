const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const { sendVerificationEmail } = require('./verifyEmailRoutes');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, employeeId, department, subjectsTaught, designation } = req.body;

    if (!name || !email || !password || !employeeId || !department) {
      return res.status(400).json({ error: 'Name, email, password, employee ID, and department are required' });
    }

    const existingEmail = await Teacher.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingEmployeeId = await Teacher.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({ error: 'Employee ID already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
      employeeId,
      department,
      subjectsTaught: subjectsTaught || [],
      designation: designation || 'Lecturer'
    });
    try {
      await sendVerificationEmail(teacher, 'teacher');
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
    }

    res.status(201).json({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      employeeId: teacher.employeeId,
      department: teacher.department,
      subjectsTaught: teacher.subjectsTaught,
      designation: teacher.designation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!teacher.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    const token = jwt.sign(
      { id: teacher._id, name: teacher.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
  token,
  teacher: {
    id: teacher._id,
    name: teacher.name,
    email: teacher.email,
    isVerified: teacher.isVerified
  }
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;