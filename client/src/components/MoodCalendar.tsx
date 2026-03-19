import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type MoodCalendarProps = {
  open: boolean;
  onClose: () => void;
};

type DailyLogValue = {
  emotion: "happy" | "calm" | "anxious" | "sad" | "angry" | "neutral";
  activities: string[];
};

const emotionStyles: Record<
  string,
  { bg: string; text: string; emoji: string; label: string }
> = {
  happy: { bg: "#fce7f3", text: "#be185d", emoji: "😊", label: "Happy" },
  calm: { bg: "#d1fae5", text: "#065f46", emoji: "😌", label: "Calm" },
  anxious: { bg: "#ede9fe", text: "#5b21b6", emoji: "😰", label: "Anxious" },
  sad: { bg: "#dbeafe", text: "#1e3a8a", emoji: "😔", label: "Sad" },
  angry: { bg: "#fee2e2", text: "#991b1b", emoji: "😤", label: "Angry" },
  neutral: { bg: "#f3f4f6", text: "#374151", emoji: "😶", label: "Neutral" },
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MoodCalendar: React.FC<MoodCalendarProps> = ({ open, onClose }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [logs, setLogs] = useState<Record<number, DailyLogValue>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [firstLogDate, setFirstLogDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!open) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.getDailyLogs(year, month);
      setLogs(result.logs || {});
      setCurrentStreak(result.currentStreak || 0);
      setBestStreak(result.bestStreak || 0);
      setFirstLogDate(result.firstLogDate || null);
    } catch (err) {
      setError("Unable to load mood calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const runBackfillIfEmpty = async () => {
      try {
        const result = await api.getDailyLogs(year, month);
        const totalLogs = Object.keys(result.logs || {}).length;
        if (totalLogs === 0) {
          await api.backfillDailyLogs();
        }
        await fetchLogs();
      } catch {
        await fetchLogs();
      }
    };

    if (open) {
      runBackfillIfEmpty();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, year, month]);

  const onPrevMonth = () => {
    const nextMonth = month - 1;
    if (nextMonth <= 0) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth(nextMonth);
    }
  };

  const onNextMonth = () => {
    const nextMonth = month + 1;
    if (nextMonth > 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth(nextMonth);
    }
  };

  const dayOfWeekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isTodayMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDay = today.getDate();

  const disablePrev = (() => {
    if (!firstLogDate) return false;
    const first = new Date(firstLogDate);
    const firstMonth = first.getMonth() + 1;
    const firstYear = first.getFullYear();
    return year < firstYear || (year === firstYear && month <= firstMonth);
  })();

  const currentMonthTotal = Object.keys(logs).length;
  const mostFelt = useMemo(() => {
    const counts: Record<DailyLogValue["emotion"], number> = {
      happy: 0,
      calm: 0,
      anxious: 0,
      sad: 0,
      angry: 0,
      neutral: 0,
    };
    Object.values(logs).forEach((log) => {
      const typedLog = log as DailyLogValue;
      counts[typedLog.emotion] = (counts[typedLog.emotion] || 0) + 1;
    });
    let max = -1;
    let picked: DailyLogValue["emotion"] = "neutral";
    Object.entries(counts).forEach(([e, count]) => {
      if (count > max) {
        max = count;
        picked = e as DailyLogValue["emotion"];
      }
    });
    return picked;
  }, [logs]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.25)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: "min(540px, 92vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          padding: "16px",
          background:
            "linear-gradient(135deg, rgba(255,230,240,0.97), rgba(220,240,255,0.97), rgba(210,255,235,0.97))",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "24px", color: "#312e81", fontFamily: "Pacifico, cursive" }}>
              Mood Calendar
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#4b5563" }}>
              Track your emotional check-ins day by day.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close mood calendar"
            style={{ border: "none", background: "transparent", fontSize: "1.25rem", cursor: "pointer", color: "#4b5563" }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "12px 0" }}>
          <span style={{ borderRadius: "999px", padding: "4px 12px", background: "#fce7f3", fontSize: "11px", fontWeight: 700 }}>🔥 Current streak: {currentStreak}</span>
          <span style={{ borderRadius: "999px", padding: "4px 12px", background: "#ede9fe", fontSize: "11px", fontWeight: 700 }}>⭐ Best streak: {bestStreak}</span>
          <span style={{ borderRadius: "999px", padding: "4px 12px", background: "#d1fae5", fontSize: "11px", fontWeight: 700 }}>📅 This month: {currentMonthTotal}</span>
          <span style={{ borderRadius: "999px", padding: "4px 12px", background: "#f3f4f6", fontSize: "11px", fontWeight: 700 }}>
            {emotionStyles[mostFelt]?.emoji || "😶"} Most felt: {emotionStyles[mostFelt]?.label || "Neutral"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onPrevMonth}
              disabled={disablePrev}
              style={{
                borderRadius: "999px",
                border: "1px solid #c7d2fe",
                background: disablePrev ? "#f1f5f9" : "#ffffff",
                padding: "4px 10px",
                cursor: disablePrev ? "not-allowed" : "pointer",
              }}
            >
              ‹
            </button>
            <div style={{ fontWeight: 700, color: "#4f46e5" }}>{monthNames[month - 1]} {year}</div>
            <button
              onClick={onNextMonth}
              style={{
                borderRadius: "999px",
                border: "1px solid #c7d2fe",
                background: "#ffffff",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              ›
            </button>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>First check-in: {firstLogDate || "Not yet"}</div>
        </div>

        {loading ? (
          <div style={{ marginTop: "12px" }}>
            <div style={{ height: "32px", width: "50%", background: "#e2e8f0", borderRadius: "8px", marginBottom: "8px", animation: "pulse 1.5s infinite" }} />
            <div style={{ height: "220px", background: "#e2e8f0", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
          </div>
        ) : error ? (
          <div style={{ marginTop: "12px", borderRadius: "12px", border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", padding: "10px" }}>{error}</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", marginTop: "12px", fontSize: "0.75rem", color: "#6d28d9", fontWeight: 700 }}>
              {dayOfWeekLabels.map((day) => (
                <div key={day} style={{ textAlign: "center" }}>{day}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", marginTop: "6px" }}>
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: "52px" }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const log = logs[day];
                const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayDate = new Date(year, month - 1, day);
                const isFuture = dayDate > today;
                const isToday = isTodayMonth && day === todayDay;
                const style = log
                  ? emotionStyles[log.emotion] || emotionStyles.neutral
                  : null;

                return (
                  <div
                    key={dateKey}
                    style={{
                      height: "52px",
                      borderRadius: "12px",
                      border: "1.5px solid rgba(0,0,0,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: log ? style.bg : "rgba(255,255,255,0.45)",
                      cursor: isFuture ? "default" : "pointer",
                      opacity: isFuture ? 0.3 : 1,
                      position: "relative",
                      boxSizing: "border-box",
                      borderColor: isToday ? "#a78bfa" : "rgba(0,0,0,0.08)",
                      transform: isFuture ? "none" : "scale(1)",
                      transition: isFuture ? "none" : "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isFuture) {
                        (e.currentTarget as HTMLElement).style.transform = "scale(1.07)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isFuture) {
                        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "";
                      }
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: log ? "#1f2937" : "#6b7280" }}>{day}</div>
                    {log && <div style={{ fontSize: "1rem" }}>{style.emoji}</div>}
                    {log && (
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "-8px",
                          transform: "translateX(-50%)",
                          display: "none",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          padding: "4px",
                          fontSize: "0.65rem",
                          boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                          width: "180px",
                          textAlign: "left",
                          zIndex: 10,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: style.text }}>{style.emoji} {style.label}</div>
                        <div style={{ marginTop: "2px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {log.activities.map((a) => (
                            <span key={a} style={{ borderRadius: "999px", border: "1px solid #e2e8f0", background: "#f8fafc", padding: "2px 6px", fontSize: "0.65rem" }}>{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {currentMonthTotal === 0 && (
              <div style={{ marginTop: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", padding: "10px", fontSize: "0.9rem", color: "#475569" }}>
                No check-ins yet this month 🌱
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", color: "#475569", fontSize: "0.75rem" }}>
              {Object.entries(emotionStyles).map(([key, style]) => (
                <span key={key} style={{ display: "inline-flex", alignItems: "center", borderRadius: "999px", padding: "4px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: 700 }}>
                  <span style={{ color: style.text, marginRight: "4px" }}>●</span> {style.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoodCalendar;
