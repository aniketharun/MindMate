import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { Task } from "../models/Task.js";

const router = express.Router();

const SUGGESTIONS = {
  happy: [
    "Write down three things you're grateful for today.",
    "Reach out to someone and share a kind message.",
    "Savor a small moment, like a warm drink or fresh air, and describe it.",
  ],
  sad: [
    "Write a short letter to yourself as if you were a kind friend.",
    "Name one small comforting activity you can do in the next hour.",
    "Gently stretch or walk for 5 minutes while noticing your breath.",
  ],
  angry: [
    "Take 10 slow breaths, counting each exhale.",
    "Write what you're angry about without editing, then note one need underneath the anger.",
    "Splash cool water on your face and notice the sensations.",
  ],
  anxious: [
    "Try the 5-4-3-2-1 grounding exercise with your senses.",
    "List three things that are in your control today, and one tiny action for each.",
    "Gently relax your shoulders and jaw, then take three slow breaths.",
  ],
  neutral: [
    "Check in: how does your body feel right now, from head to toe?",
    "Set a tiny intention for the next hour (e.g., drink water, stretch, pause).",
    "Write one thing you're curious about or looking forward to.",
  ],
};

const generateTasksForEmotion = (emotion) => {
  const base = SUGGESTIONS[emotion] || SUGGESTIONS.neutral;
  return base.slice(0, 4).map((title) => ({ title, emotion }));
};

router.get("/", protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load tasks" });
  }
});

router.post("/generate", protect, async (req, res) => {
  try {
    const { emotion = "neutral" } = req.body || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Task.deleteMany({
      user: req.user._id,
      date: { $gte: today },
    });

    const taskDefs = generateTasksForEmotion(emotion);
    const created = await Task.insertMany(
      taskDefs.map((t) => ({
        ...t,
        user: req.user._id,
        date: today,
      }))
    );

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Failed to generate tasks" });
  }
});

router.patch("/:id/toggle", protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    task.completed = !task.completed;
    await task.save();
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update task" });
  }
});

export default router;




