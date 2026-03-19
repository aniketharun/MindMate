import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    title: { type: String, required: true },
    dominantEmotion: {
      type: String,
      enum: ["happy", "sad", "angry", "anxious", "neutral"],
      default: "neutral",
    },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
