const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const generateSessionCode = require('../utils/generateCode');
const protect = require('../middleware/auth');
const Doubt = require('../models/Doubt');
const Poll = require('../models/Poll');
// POST /api/sessions  -> create a new session
router.post('/', protect, async (req, res) => {
  try {
    const { title, topics } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Generate a unique code (retry if collision, rare but safe)
    let code;
    let exists = true;
    while (exists) {
      code = generateSessionCode();
      exists = await Session.findOne({ sessionCode: code });
    }

    const session = await Session.create({
      title,
      topics: topics || [],
      sessionCode: code,
      teacherId: req.teacher.id  // available from protect middleware
    });

    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/sessions/:code -> fetch a session by its code
router.get('/:code', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionCode: req.params.code.toUpperCase() });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});
// GET /api/sessions/:code/summary -> session-end summary report
router.get('/:code/summary', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ sessionCode: req.params.code.toUpperCase() });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const doubts = await Doubt.find({ sessionId: session._id });

    const totalDoubts = doubts.length;
    const resolvedCount = doubts.filter((d) => d.resolved).length;
    const unresolvedCount = totalDoubts - resolvedCount;

    const topicMap = {};
    doubts.forEach((d) => {
      topicMap[d.topic] = (topicMap[d.topic] || 0) + 1;
    });
    const topicBreakdown = Object.entries(topicMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    const topDoubts = [...doubts]
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 3)
      .map((d) => ({
        text: d.text,
        topic: d.topic,
        upvotes: d.upvotes,
        resolved: d.resolved
      }));

    res.json({
      title: session.title,
      sessionCode: session.sessionCode,
      totalDoubts,
      resolvedCount,
      unresolvedCount,
      topicBreakdown,
      topDoubts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// PATCH /api/sessions/:code/end -> mark session as ended
router.patch('/:code/end', protect, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionCode: req.params.code.toUpperCase() },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await Poll.updateMany({ sessionId: session._id, isActive: true }, { isActive: false });

    const io = req.app.get('io');
    io.to(session.sessionCode).emit('session_ended', session);
    io.to(session.sessionCode).emit('poll_updated', null);

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// GET /api/sessions -> all sessions for logged-in teacher
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ teacherId: req.teacher.id })
      .sort({ createdAt: -1 })
      .select('title sessionCode isActive createdAt topics');
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;
