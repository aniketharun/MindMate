import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { JournalEntry } from "../models/JournalEntry.js";
import { detectEmotion } from "../services/emotionService.js";
import { getGeminiClient } from "../services/openaiClient.js";
import { upsertDailyLog } from "../services/dailyLogService.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { content, moodEmoji, date } = req.body;
    if (!content || !date) {
      return res.status(400).json({ message: "Content and date are required" });
    }

    const parsedDate = new Date(date);
    const { emotion } = detectEmotion(content);
    let aiReflection = "";

    try {
      const client = getGeminiClient();
      const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You write 2-3 sentence gentle reflections on journal entries. 
You are supportive, non-judgmental, and you do NOT diagnose or give medical advice.

Journal entry (emotion: ${emotion}):
${content}`;

      const result = await model.generateContent(prompt);
      aiReflection =
        result.response?.text() ||
        "Thank you for sharing this. It's meaningful that you took a moment to reflect.";
    } catch (err) {
      aiReflection =
        "Thank you for writing this. Taking time to notice and name your feelings is already a caring step toward yourself.";
    }

    const entry = await JournalEntry.create({
      user: req.user._id,
      content,
      moodEmoji,
      emotionTags: [emotion],
      date: parsedDate,
      aiReflection,
    });

    await upsertDailyLog(req.user._id, emotion, "journal");

    return res.status(201).json(entry);
  } catch (err) {
    return res.status(500).json({ message: "Failed to save journal entry" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user._id })
      .sort({ date: -1 })
      .lean();
    return res.json(entries);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load journal entries" });
  }
});

export default router;


