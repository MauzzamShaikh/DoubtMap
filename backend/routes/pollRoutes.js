const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const Session = require('../models/Session');

// POST /api/polls/:code/launch -> teacher launches a new poll for a session
router.post('/:code/launch', async (req, res) => {
  try {
    const { question } = req.body;

    const session = await Session.findOne({ sessionCode: req.params.code.toUpperCase() });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Deactivate any previous active poll for this session
    await Poll.updateMany({ sessionId: session._id, isActive: true }, { isActive: false });

    const poll = await Poll.create({
      sessionId: session._id,
      question: question || 'How confident do you feel about this topic?'
    });

    const io = req.app.get('io');
    io.to(req.params.code.toUpperCase()).emit('poll_launched', poll);

    res.status(201).json(poll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to launch poll' });
  }
});

// GET /api/polls/:code/active -> get the current active poll for a session, if any
router.get('/:code/active', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionCode: req.params.code.toUpperCase() });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const poll = await Poll.findOne({ sessionId: session._id, isActive: true }).sort({ createdAt: -1 });
    res.json(poll || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// PATCH /api/polls/:id/vote -> student votes on a poll
router.patch('/:id/vote', async (req, res) => {
  try {
    const { choice, fingerprint } = req.body; // choice: 'confused' | 'okay' | 'confident'

    if (!['confused', 'okay', 'confident'].includes(choice)) {
      return res.status(400).json({ error: 'Invalid choice' });
    }

    if (!fingerprint) {
      return res.status(400).json({ error: 'Fingerprint is required' });
    }

    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ error: 'This poll has ended' });
    }

    if (poll.voterFingerprints.includes(fingerprint)) {
      return res.status(400).json({ error: 'You already voted on this poll' });
    }

    poll.responses[choice] += 1;
    poll.voterFingerprints.push(fingerprint);
    await poll.save();

    const session = await Session.findById(poll.sessionId);
    const io = req.app.get('io');
    io.to(session.sessionCode).emit('poll_updated', poll);

    res.json(poll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// PATCH /api/polls/:id/end -> teacher manually ends a poll
router.patch('/:id/end', async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const session = await Session.findById(poll.sessionId);
    const io = req.app.get('io');
    io.to(session.sessionCode).emit('poll_updated', poll);

    res.json(poll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to end poll' });
  }
});

module.exports = router;