import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    dominantEmotion: {
      type: String,
      enum: ["happy", "calm", "anxious", "sad", "angry", "neutral"],
      required: true,
    },
    activitiesCompleted: [{ type: String, enum: ["chat", "journal", "task"] }],
  },
  { timestamps: true }
);

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyLog = mongoose.model("DailyLog", dailyLogSchema);
