import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../lib/api";

type JournalEntry = {
  _id: string;
  content: string;
  moodEmoji?: string;
  emotionTags?: string[];
  date: string;
  aiReflection?: string;
};

const moodOptions = ["😊", "😐", "😔", "😡", "😰"];

const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("😊");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate("/auth");
      return;
    }
    api
      .listJournals()
      .then((data) => setEntries(data))
      .catch(() => {});
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      const todayISO = new Date().toISOString();
      const entry = await api.createJournal({
        content,
        moodEmoji: mood,
        date: todayISO,
      });
      setEntries((prev) => [entry, ...prev]);
      setContent("");
    } catch {
      // swallow, UI stays quiet
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/80 rounded-3xl shadow-lg p-4">
        <h2 className="text-sm font-semibold text-deepIndigo mb-1">
          Today&apos;s journal
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          A private space for your thoughts. MindMate offers a short reflection
          after each entry.
        </p>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Mood</span>
            <div className="flex gap-1">
              {moodOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                    mood === m ? "bg-softBlue shadow" : "bg-slate-100"
                  }`}
                  style={
                    mood === m
                      ? { backgroundColor: "#c7d2fe" }
                      : { backgroundColor: "#f1f5f9" }
                  }
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="w-full min-h-[100px] rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-softBlue"
            placeholder="What has been on your mind today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-deepIndigo text-white text-xs font-medium rounded-xl px-4 py-2 shadow disabled:opacity-60"
            style={{ backgroundColor: "#312e81", color: "#ffffff" }}
          >
            {saving ? "Saving..." : "Save entry"}
          </button>
        </form>
      </div>
      <div className="bg-white/80 rounded-3xl shadow-lg p-4">
        <h3 className="text-sm font-semibold text-deepIndigo mb-2">
          Recent reflections
        </h3>
        {entries.length === 0 && (
          <p className="text-xs text-slate-500">
            Your reflections will appear here after you write an entry.
          </p>
        )}
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {entries.map((e) => (
            <div
              key={e._id}
              className="border border-slate-100 rounded-2xl p-3 text-xs space-y-1"
            >
              <div className="flex justify-between items-center">
                <span>{e.moodEmoji}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(e.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-700 whitespace-pre-line">{e.content}</p>
              {e.aiReflection && (
                <p className="mt-1 text-[11px] text-slate-600 bg-lavender/60 rounded-xl px-2 py-1">
                  MindMate: {e.aiReflection}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;




