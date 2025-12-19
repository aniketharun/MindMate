import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

router.put("/", protect, async (req, res) => {
  try {
    const { name, ageRange, focusAreas, preferredTone, dailyCheckInReminder } =
      req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name ?? user.name;
    user.ageRange = ageRange ?? user.ageRange;
    user.focusAreas = focusAreas ?? user.focusAreas;
    user.preferredTone = preferredTone ?? user.preferredTone;
    user.dailyCheckInReminder =
      dailyCheckInReminder ?? user.dailyCheckInReminder;

    await user.save();
    const safeUser = await User.findById(user._id).select("-password");
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;




