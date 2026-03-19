import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { detectEmotion } from "../services/emotionService.js";
import { getGeminiClient } from "../services/openaiClient.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { ChatSession } from "../models/ChatSession.js";
import { User } from "../models/User.js";
import { upsertDailyLog } from "../services/dailyLogService.js";

const router = express.Router();

const SYSTEM_PROMPT = `
You are MindMate, an AI mental health companion. Your role is to provide gentle, non-judgmental emotional support and reflection.

Core principles:
- You are NOT a doctor or therapist.
- NEVER diagnose mental illness or suggest specific medications.
- Encourage self-reflection, grounding, and small, achievable steps.
- Be warm, validating, and calm.

If the user expresses thoughts of self-harm, suicide, or harming others:
- Respond with empathy and care.
- Encourage them to reach out to trusted people or local professionals.
- Remind them that if they are in immediate danger, they should contact local emergency services or a crisis hotline.
- Do NOT panic, do NOT judge, and do NOT give medical instructions.
`;

const buildEmotionBehavior = (emotion) => {
  switch (emotion) {
    case "happy":
      return "The user seems in a positive mood. Celebrate their feelings, reinforce gratitude, and offer gentle reflective prompts.";
    case "sad":
      return "The user seems sad. Offer validation, acknowledge their pain, and invite them to express their feelings safely. Suggest expressive journaling or gentle self-compassion exercises.";
    case "angry":
      return "The user seems angry. Stay calm and grounded. Encourage pauses, slow breathing, and help them explore what they need without escalating.";
    case "anxious":
      return "The user seems anxious. Be reassuring and steady. Offer grounding or breathing exercises, and help them break worries into smaller, manageable pieces.";
    default:
      return "The user seems neutral. Be friendly and reflective, asking gentle follow-up questions.";
  }
};

const buildUserTonePreference = (tone) => {
  switch (tone) {
    case "motivating":
      return "Use a gently encouraging and motivating style, while still being sensitive and non-pushy.";
    case "neutral":
      return "Use a calm, balanced, neutral tone.";
    case "gentle":
    default:
      return "Use a very soft, gentle, and soothing tone.";
  }
};

const containsCrisisLanguage = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  const crisisKeywords = [
    "suicide",
    "kill myself",
    "want to die",
    "end my life",
    "self harm",
    "hurt myself",
    "can't go on",
  ];
  return crisisKeywords.some((k) => lower.includes(k));
};

const shouldStartNewSession = (lastSession) => {
  if (!lastSession) return true;

  const endedAt = lastSession.endedAt || lastSession.startedAt;
  const cutoff2H = new Date(Date.now() - 2 * 60 * 60 * 1000);
  if (endedAt < cutoff2H) return true;

  const lastDate = new Date(endedAt);
  const today = new Date();
  const isSameDay =
    lastDate.getFullYear() === today.getFullYear() &&
    lastDate.getMonth() === today.getMonth() &&
    lastDate.getDate() === today.getDate();
  if (!isSameDay) return true;

  return false;
};

const computeDominantEmotion = async (sessionId) => {
  const messages = await ChatMessage.find({ sessionId }).lean();
  const counts = { happy: 0, calm: 0, anxious: 0, sad: 0, angry: 0, neutral: 0 };
  messages.forEach((m) => {
    if (m.emotion && counts[m.emotion] !== undefined) {
      counts[m.emotion] += 1;
    }
  });
  let top = "neutral";
  let max = -1;
  Object.entries(counts).forEach(([k, v]) => {
    if (v > max) {
      max = v;
      top = k;
    }
  });
  return top;
};

router.post("/", protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const { emotion, confidence } = detectEmotion(message);
    const user = await User.findById(req.user._id);

    let lastSession = await ChatSession.findOne({ user: req.user._id })
      .sort({ startedAt: -1 })
      .lean();

    let session;
    if (!lastSession || shouldStartNewSession(lastSession)) {
      if (lastSession) {
        await ChatSession.findByIdAndUpdate(lastSession._id, {
          endedAt: new Date(),
          dominantEmotion: await computeDominantEmotion(lastSession._id),
          messageCount: await ChatMessage.countDocuments({ sessionId: lastSession._id }),
        });
      }

      const title = message.trim().length >= 5
        ? message.trim().slice(0, 40) + (message.trim().length > 40 ? "..." : "")
        : `Chat on ${new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;

      session = await ChatSession.create({
        user: req.user._id,
        title,
        dominantEmotion: emotion,
        messageCount: 0,
      });
    } else {
      session = await ChatSession.findById(lastSession._id);
      if (!session) {
        return res.status(500).json({ message: "Unable to load session" });
      }
      if (!session.title || session.title.startsWith("Chat on")) {
        const title = message.trim().length >= 5
          ? message.trim().slice(0, 40) + (message.trim().length > 40 ? "..." : "")
          : session.title;
        session.title = title;
      }
    }

    const userMessage = await ChatMessage.create({
      user: req.user._id,
      sessionId: session._id,
      role: "user",
      content: message,
      emotion,
      emotionConfidence: confidence,
    });

    session.messageCount = await ChatMessage.countDocuments({ sessionId: session._id });
    await session.save();

    const emotionBehavior = buildEmotionBehavior(emotion);
    const tonePreference = buildUserTonePreference(user?.preferredTone);
    const crisis = containsCrisisLanguage(message);

    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemContent = `
${SYSTEM_PROMPT}

User context:
- Detected emotion: ${emotion} (confidence ${confidence.toFixed(2)})
- Behavior guidance: ${emotionBehavior}
- Tone preference: ${tonePreference}
${
  crisis
    ? "- IMPORTANT: The user may be in crisis. Be especially gentle. Encourage reaching out to trusted people or professionals and mention crisis resources. Do NOT provide medical or legal instructions."
    : ""
}

Always ask one gentle follow-up question to help the user reflect more, unless they clearly ask to stop.
`;

    const fullPrompt = `${systemContent}\n\nUser: ${message}`;

    const result = await model.generateContent(fullPrompt);

    const reply =
      result.response?.text() ||
      "I'm here with you. Would you like to share a bit more about how you're feeling?";

    const assistantMessage = await ChatMessage.create({
      user: req.user._id,
      sessionId: session._id,
      role: "assistant",
      content: reply,
      emotion,
      emotionConfidence: confidence,
    });

    session.messageCount = await ChatMessage.countDocuments({ sessionId: session._id });
    await session.save();

    await upsertDailyLog(req.user._id, emotion, "chat");

    return res.json({
      reply: assistantMessage.content,
      emotion,
      confidence,
    });
  } catch (err) {
    console.error("Chat error", err);
    return res.status(500).json({
      message:
        "I'm having trouble responding right now, but your feelings matter. Please try again in a moment.",
    });
  }
});

// Get chat history for current user
router.get("/history", protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .lean();
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load chat history" });
  }
});

// Get sessions
router.get("/sessions", protect, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .sort({ startedAt: -1 })
      .limit(30)
      .lean();
    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load sessions" });
  }
});

router.get("/sessions/:sessionId/messages", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const messages = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .select("role content emotion createdAt")
      .lean();
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load session messages" });
  }
});

export default router;


