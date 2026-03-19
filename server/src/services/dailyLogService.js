import { DailyLog } from "../models/DailyLog.js";
import { JournalEntry } from "../models/JournalEntry.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { Task } from "../models/Task.js";

export const upsertDailyLog = async (userId, emotion, activity) => {
  if (!userId || !emotion) return;
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const activityValue = activity && ["chat", "journal", "task"].includes(activity) ? activity : null;
  const existing = await DailyLog.findOne({ userId, date });
  if (existing) {
    existing.dominantEmotion = emotion;
    if (activityValue && !existing.activitiesCompleted.includes(activityValue)) {
      existing.activitiesCompleted.push(activityValue);
    }
    await existing.save();
    return existing;
  }

  const newLog = await DailyLog.create({
    userId,
    date,
    dominantEmotion: emotion,
    activitiesCompleted: activityValue ? [activityValue] : [],
  });
  return newLog;
};

export const backfillDailyLogs = async (userId) => {
  if (!userId) return { backfilledDays: 0 };

  const journalEntries = await JournalEntry.find({ user: userId }).lean();
  const chatMessages = await ChatMessage.find({ user: userId }).lean();
  const completedTasks = await Task.find({ user: userId, completed: true }).lean();

  const dateMap = new Map();

  for (const entry of journalEntries) {
    const date = new Date(entry.date).toISOString().slice(0, 10);
    const emotion = (entry.emotionTags && entry.emotionTags[0]) || "neutral";
    const existing = dateMap.get(date) || { emotions: [], activities: new Set() };
    existing.emotions.push(emotion);
    existing.activities.add("journal");
    dateMap.set(date, existing);
  }

  const chatByDate = new Map();
  for (const msg of chatMessages) {
    const date = new Date(msg.createdAt || msg.updatedAt || Date.now()).toISOString().slice(0, 10);
    const entry = chatByDate.get(date) || [];
    entry.push(msg.emotion || "neutral");
    chatByDate.set(date, entry);
  }
  for (const [date, emotions] of chatByDate.entries()) {
    const existing = dateMap.get(date) || { emotions: [], activities: new Set() };
    existing.emotions.push(...emotions);
    existing.activities.add("chat");
    dateMap.set(date, existing);
  }

  for (const task of completedTasks) {
    const date = new Date(task.date).toISOString().slice(0, 10);
    const existing = dateMap.get(date) || { emotions: [], activities: new Set() };
    existing.emotions.push(task.emotion || "neutral");
    existing.activities.add("task");
    dateMap.set(date, existing);
  }

  let backfilled = 0;
  for (const [date, info] of dateMap.entries()) {
    const emotion = info.emotions.length
      ? info.emotions.sort((a, b) =>
          info.emotions.filter((v) => v === b).length - info.emotions.filter((v) => v === a).length
        )[0]
      : "neutral";
    const activities = Array.from(info.activities);
    const existing = await DailyLog.findOne({ userId, date });
    if (existing) {
      existing.dominantEmotion = emotion;
      existing.activitiesCompleted = Array.from(new Set([...(existing.activitiesCompleted || []), ...activities]));
      await existing.save();
    } else {
      await DailyLog.create({
        userId,
        date,
        dominantEmotion: emotion,
        activitiesCompleted: activities,
      });
      backfilled += 1;
    }
  }

  return { backfilledDays: backfilled };
};

export const getMonthlyLogsAndStreaks = async (userId, year, month) => {
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (!userId || Number.isNaN(yearNumber) || Number.isNaN(monthNumber)) {
    throw new Error("Invalid date parameters");
  }

  const monthStr = monthNumber.toString().padStart(2, "0");
  const start = `${yearNumber}-${monthStr}-01`;
  const firstDayOfNextMonth = new Date(yearNumber, monthNumber, 1);
  firstDayOfNextMonth.setDate(1);
  const endDate = new Date(firstDayOfNextMonth);
  endDate.setDate(0);
  const daysInMonth = endDate.getDate();
  const end = `${yearNumber}-${monthStr}-${daysInMonth.toString().padStart(2, "0")}`;

  const monthlyLogs = await DailyLog.find({
    userId,
    date: { $gte: start, $lte: end },
  }).lean();

  const logsObj = {};
  monthlyLogs.forEach((log) => {
    const day = Number(log.date.split("-")[2]);
    logsObj[day] = {
      emotion: log.dominantEmotion,
      activities: log.activitiesCompleted || [],
    };
  });

  const allLogs = await DailyLog.find({ userId }).sort({ date: 1 }).lean();
  const dateSet = new Set(allLogs.map((l) => l.date));
  let bestStreak = 0;
  let currentStreak = 0;
  let streak = 0;
  let prevDate = null;
  let firstLogDate = null;

  allLogs.forEach((log) => {
    if (!firstLogDate) firstLogDate = log.date;
    const date = new Date(log.date + "T00:00:00.000Z");
    if (!prevDate) {
      streak = 1;
      bestStreak = Math.max(bestStreak, streak);
      prevDate = date;
      return;
    }
    const next = new Date(prevDate);
    next.setDate(next.getDate() + 1);
    if (date.toISOString().slice(0, 10) === next.toISOString().slice(0, 10)) {
      streak += 1;
    } else {
      streak = 1;
    }
    bestStreak = Math.max(bestStreak, streak);
    prevDate = date;
  });

  const today = new Date();
  let backward = new Date(today);
  currentStreak = 0;
  while (true) {
    const dayKey = backward.toISOString().slice(0, 10);
    if (!dateSet.has(dayKey)) break;
    currentStreak += 1;
    backward.setDate(backward.getDate() - 1);
  }

  return {
    logs: logsObj,
    currentStreak,
    bestStreak,
    firstLogDate,
  };
};
