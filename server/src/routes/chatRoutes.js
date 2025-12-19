import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { detectEmotion } from "../services/emotionService.js";
import { getGeminiClient } from "../services/openaiClient.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { User } from "../models/User.js";

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

router.post("/", protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const { emotion, confidence } = detectEmotion(message);
    const user = await User.findById(req.user._id);

    // Save user message
    await ChatMessage.create({
      user: req.user._id,
      role: "user",
      content: message,
      emotion,
      emotionConfidence: confidence,
    });

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
      role: "assistant",
      content: reply,
      emotion,
      emotionConfidence: confidence,
    });

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

export default router;


