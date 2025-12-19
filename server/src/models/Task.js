import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    emotion: {
      type: String,
      enum: ["happy", "sad", "angry", "anxious", "neutral"],
    },
    completed: { type: Boolean, default: false },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);




