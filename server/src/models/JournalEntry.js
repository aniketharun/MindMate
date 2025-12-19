import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    moodEmoji: { type: String },
    emotionTags: [{ type: String }],
    date: { type: Date, required: true },
    aiReflection: { type: String },
  },
  { timestamps: true }
);

export const JournalEntry = mongoose.model(
  "JournalEntry",
  journalEntrySchema
);




