import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMonthlyLogsAndStreaks, backfillDailyLogs } from "../services/dailyLogService.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const data = await getMonthlyLogsAndStreaks(req.user._id, year, month);
    return res.json(data);
  } catch (err) {
    console.error("Failed to load logs", err);
    return res.status(500).json({ message: "Failed to load logs" });
  }
});

router.post("/backfill", protect, async (req, res) => {
  try {
    const result = await backfillDailyLogs(req.user._id);
    return res.json(result);
  } catch (err) {
    console.error("Failed to backfill logs", err);
    return res.status(500).json({ message: "Failed to backfill logs" });
  }
});

export default router;
