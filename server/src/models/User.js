import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    ageRange: {
      type: String,
      enum: ["18-24", "25-34", "35-44", "45-54", "55+"],
    },
    focusAreas: [{ type: String }],
    preferredTone: {
      type: String,
      enum: ["gentle", "neutral", "motivating"],
      default: "gentle",
    },
    dailyCheckInReminder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);


