const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const AiQuery = require('../models/AiQuery');
const Session = require('../models/Session');
const Doubt = require('../models/Doubt');
const protectStudent = require('../middleware/studentAuth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/ask', protectStudent, async (req, res) => {
  try {
    const { question, topic, sessionCode } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const prompt = `You are a helpful teaching assistant for a college classroom.
A student has this doubt${topic ? ` related to ${topic}` : ''}: "${question}"
Give a clear, concise explanation in simple language, suitable for a student. Keep it under 150 words.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile'
    });

    const answer = completion.choices[0]?.message?.content || 'No response generated.';

    // Save to history if we have a valid session
    if (sessionCode) {
      try {
        const session = await Session.findOne({ sessionCode: sessionCode.toUpperCase() });
        if (session) {
          await AiQuery.create({
            sessionId: session._id,
            studentId: req.student ? req.student.id : null,
            question,
            answer,
            topic: topic || 'General'
          });
        }
      } catch (saveErr) {
        console.error('Failed to save AI query:', saveErr.message);
        // Don't fail the whole request just because saving history failed
      }
    }

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Reusable function: checks if a doubt is genuine academic content
async function isGenuineDoubt(text, topic, sessionTopics = []) {
  const topicsContext = sessionTopics.length > 0
    ? `The session topics are: ${sessionTopics.join(', ')}.`
    : '';

  const prompt = `You are a strict content moderator for a classroom doubt-submission system.
${topicsContext}
A student submitted this message${topic ? ` under the topic "${topic}"` : ''}: "${text}"

Decide if this is:
1. A genuine academic doubt relevant to the session topics (if topics are provided)
2. Spam, greeting, joke, gibberish, or completely unrelated content

Respond with ONLY one word: "GENUINE" or "INVALID". No explanation.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0
  });

  const verdict = completion.choices[0]?.message?.content?.trim().toUpperCase() || '';
  return verdict.includes('GENUINE');
}

async function checkDuplicateDoubt(text, sessionId, newStudentId, newFingerprint) {
  try {
    // 1. Fetch all existing doubts for this session
    const existingDoubts = await Doubt.find({ sessionId });
    if (existingDoubts.length === 0) {
      return null;
    }

    // 2. Perform a fast exact match check (trimmed, case-insensitive)
    const normalizedNewText = text.trim().toLowerCase();
    const exactMatch = existingDoubts.find(
      (d) => d.text.trim().toLowerCase() === normalizedNewText
    );
    if (exactMatch) {
      return exactMatch;
    }

    // 3. Perform a semantic comparison with Groq for phrased-differently doubts
    const listText = existingDoubts
      .map((d, index) => `[ID: ${index}] "${d.text}"`)
      .join('\n');

    const prompt = `You are a classroom question analyzer. A student has submitted a new doubt.
We want to check if this doubt is semantically the same as (or a duplicate of) any existing doubts in the session, even if it is worded slightly differently.

New Doubt: "${text}"

Existing Doubts list:
${listText}

Is the New Doubt semantically the same or extremely similar to one of the doubts in the list (asking the same core question)?
If yes, reply with ONLY the ID of that matching doubt (e.g. if it matches doubt 2, reply with "2").
If no, reply with ONLY the word "NONE".
Do not include any explanation, punctuation, or other text.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0
    });

    const verdict = completion.choices[0]?.message?.content?.trim() || '';
    if (verdict.toUpperCase().includes('NONE')) {
      return null;
    }

    const match = verdict.match(/\d+/);
    if (match) {
      const matchedIndex = parseInt(match[0], 10);
      if (matchedIndex >= 0 && matchedIndex < existingDoubts.length) {
        return existingDoubts[matchedIndex];
      }
    }
  } catch (err) {
    console.error('Groq duplicate check failed:', err.message);
  }

  return null;
}

module.exports = router;
module.exports.isGenuineDoubt = isGenuineDoubt;
module.exports.checkDuplicateDoubt = checkDuplicateDoubt;