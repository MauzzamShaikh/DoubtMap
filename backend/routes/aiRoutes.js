const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const AiQuery = require('../models/AiQuery');
const Session = require('../models/Session');
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

module.exports = router;
module.exports.isGenuineDoubt = isGenuineDoubt;