const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const Session = require('../models/Session');
const { isGenuineDoubt } = require('./aiRoutes');
const protectStudent = require('../middleware/studentAuth');

function sanitizeDoubtForBroadcast(doubt) {
  const obj = doubt.toObject ? doubt.toObject() : doubt;
  const { studentId, studentFingerprint, ...safeDoubt } = obj;
  return safeDoubt;
}

function normalizeDoubtText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const DOUBT_FILLER_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'can',
  'could',
  'define',
  'definition',
  'did',
  'do',
  'does',
  'doubt',
  'explain',
  'explanation',
  'for',
  'give',
  'help',
  'how',
  'is',
  'mam',
  'maam',
  'madam',
  'me',
  'mean',
  'meaning',
  'means',
  'miss',
  'of',
  'please',
  'sir',
  'tell',
  'the',
  'this',
  'to',
  'what',
  'why',
  'you'
]);

function normalizeConceptWord(word) {
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
  return word;
}

function getConceptWords(text) {
  const words = normalizeDoubtText(text)
    .split(' ')
    .filter((word) => !DOUBT_FILLER_WORDS.has(word))
    .map(normalizeConceptWord)
    .filter((word) => word.length > 1 && !DOUBT_FILLER_WORDS.has(word));

  return [...new Set(words)];
}

function getSimilarityScore(a, b) {
  const normalizedA = normalizeDoubtText(a);
  const normalizedB = normalizeDoubtText(b);

  if (!normalizedA || !normalizedB) return 0;
  if (normalizedA === normalizedB) return 1;
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) return 0.92;

  const wordsA = getConceptWords(normalizedA);
  const wordsB = getConceptWords(normalizedB);
  if (!wordsA.length || !wordsB.length) return 0;

  const conceptA = wordsA.join(' ');
  const conceptB = wordsB.join(' ');
  if (conceptA === conceptB) return 1;
  if (conceptA.includes(conceptB) || conceptB.includes(conceptA)) return 0.9;

  const setB = new Set(wordsB);
  const intersection = wordsA.filter((word) => setB.has(word)).length;
  const diceScore = (2 * intersection) / (wordsA.length + wordsB.length);
  const coverageScore = intersection / Math.min(wordsA.length, wordsB.length);

  return Math.max(diceScore, coverageScore * 0.86);
}

function isSameSubmitter(existingDoubt, studentId, fingerprint) {
  if (studentId && existingDoubt.studentId) {
    return existingDoubt.studentId.toString() === studentId;
  }

  return Boolean(fingerprint && existingDoubt.studentFingerprint === fingerprint);
}

// POST /api/sessions/:code/doubts -> submit a new doubt
router.post('/:code/doubts', protectStudent, async (req, res) => {
  try {
    const { text, topic, aiAttempted, fingerprint } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Doubt text is required' });
    }

    const session = await Session.findOne({ sessionCode: req.params.code.toUpperCase() });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (!session.isActive) {
      return res.status(400).json({ error: 'Session is no longer active' });
    }

    let genuine = true;
    try {
      genuine = await isGenuineDoubt(text, topic, session.topics || []);
    } catch (err) {
      console.error('Moderation check failed, allowing doubt through:', err.message);
      genuine = true;
    }

    if (!genuine) {
      return res.status(400).json({
        error: 'This doesn\'t look like a genuine doubt. Please rephrase your question clearly.'
      });
    }

    const studentId = req.student ? req.student.id : null;
    const activeDoubts = await Doubt.find({
      sessionId: session._id,
      resolved: false
    }).select('text topic studentId studentFingerprint');

    const sameStudentDuplicate = activeDoubts.find((existingDoubt) =>
      isSameSubmitter(existingDoubt, studentId, fingerprint) &&
      getSimilarityScore(existingDoubt.text, text) >= 0.82
    );

    if (sameStudentDuplicate) {
      return res.status(400).json({
        error: 'Cannot submit the same doubt again.'
      });
    }

    const existingSimilarDoubt = activeDoubts.find((existingDoubt) =>
      getSimilarityScore(existingDoubt.text, text) >= 0.72
    );

    if (existingSimilarDoubt) {
      return res.status(400).json({
        error: 'Same doubt present. Please upvote the existing doubt.',
        duplicateDoubtId: existingSimilarDoubt._id
      });
    }

    const doubt = await Doubt.create({
      sessionId: session._id,
      text,
      topic: topic || 'General',
      aiAttempted: aiAttempted || false,
      studentId,
      studentFingerprint: fingerprint || null
    });

    const io = req.app.get('io');
    io.to(req.params.code.toUpperCase()).emit('new_doubt', sanitizeDoubtForBroadcast(doubt));

    res.status(201).json(doubt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit doubt' });
  }
});

// GET /api/sessions/:code/doubts -> fetch all doubts for a session
router.get('/:code/doubts', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionCode: req.params.code.toUpperCase() });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const doubts = await Doubt.find({ sessionId: session._id }).sort({ upvotes: -1, createdAt: -1 });
    const safeDoubts = doubts.map(sanitizeDoubtForBroadcast);

    res.json(safeDoubts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doubts' });
  }
});
// PATCH /api/sessions/doubts/:id/upvote -> upvote a doubt
router.patch('/doubts/:id/upvote', async (req, res) => {
  try {
    const { fingerprint } = req.body;

    if (!fingerprint) {
      return res.status(400).json({ error: 'Fingerprint is required' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    if (doubt.voterFingerprints.includes(fingerprint)) {
      return res.status(400).json({ error: 'You already upvoted this doubt' });
    }

    doubt.upvotes += 1;
    doubt.voterFingerprints.push(fingerprint);
    await doubt.save();

    const session = await Session.findById(doubt.sessionId);
    const io = req.app.get('io');
    io.to(session.sessionCode).emit('doubt_updated', sanitizeDoubtForBroadcast(doubt));

    res.json(doubt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upvote doubt' });
  }
});

// GET /api/sessions/:code/analytics -> topic-wise doubt counts
router.get('/:code/analytics', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionCode: req.params.code.toUpperCase() });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const analytics = await Doubt.aggregate([
      { $match: { sessionId: session._id } },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 },
          totalUpvotes: { $sum: '$upvotes' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});
// PATCH /api/sessions/doubts/:id/resolve -> mark a doubt as resolved
router.patch('/doubts/:id/resolve', async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );

    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    const session = await Session.findById(doubt.sessionId);
    const io = req.app.get('io');
    io.to(session.sessionCode).emit('doubt_updated', sanitizeDoubtForBroadcast(doubt));

    res.json(doubt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve doubt' });
  }
});
module.exports = router;
