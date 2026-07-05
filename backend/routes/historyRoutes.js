const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Doubt = require('../models/Doubt');
const AiQuery = require('../models/AiQuery');
const Session = require('../models/Session');

// Strict student-only middleware (unlike protectStudent, this one REQUIRES login)
function requireStudent(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'You must be logged in to view history' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.student = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session, please log in again' });
  }
}

// GET /api/history -> all doubts + AI queries for the logged-in student
router.get('/', requireStudent, async (req, res) => {
  try {
    const studentId = req.student.id;

    const doubts = await Doubt.find({ studentId })
      .populate('sessionId', 'title sessionCode')
      .sort({ createdAt: -1 });

    const aiQueries = await AiQuery.find({ studentId })
      .populate('sessionId', 'title sessionCode')
      .sort({ createdAt: -1 });

    res.json({ doubts, aiQueries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;