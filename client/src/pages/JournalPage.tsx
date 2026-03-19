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
        <h2 className="text-2xl text-deepIndigo mb-1 mindmate-title">
          Today&apos;s journal
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          A private space for your thoughts. MindMate offers a short reflection
          after each entry.
        </p>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Mood</span>
            <div className="flex gap-1">
                {moodOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg`}
                  style={{
                    backgroundColor: mood === m ? "#c7d2fe" : "#f1f5f9",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.2)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(199,210,254,0.6)";
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="w-full min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-softBlue"
            placeholder="What has been on your mind today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-deepIndigo text-white text-sm font-bold rounded-xl px-5 py-2.5 shadow-lg disabled:opacity-60"
            style={{
              backgroundColor: "#312e81",
              color: "#ffffff",
              transition: "transform 0.15s, box-shadow 0.15s, filter 0.15s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!saving) {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(49,46,129,0.4)";
                (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)";
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.boxShadow = "";
              (e.currentTarget as HTMLElement).style.filter = "";
            }}
          >
            {saving ? "Saving..." : "Save entry"}
          </button>
        </form>
      </div>
      <div className="bg-white/80 rounded-3xl shadow-lg p-4">
        <h3 className="text-base font-bold text-deepIndigo mb-3">
          Recent reflections
        </h3>
        {entries.length === 0 && (
          <p className="text-sm text-slate-500">
            Your reflections will appear here after you write an entry.
          </p>
        )}
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {entries.map((e) => (
            <div
              key={e._id}
              className="border border-slate-100 rounded-2xl p-4 text-sm space-y-1.5"
            >
              <div className="flex justify-between items-center">
                <span className="text-xl">{e.moodEmoji}</span>
                <span className="text-xs text-slate-400">
                  {new Date(e.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{e.content}</p>
              {e.aiReflection && (
                <p className="mt-2 text-xs text-slate-600 bg-lavender/40 rounded-xl px-3 py-2 border border-lavender/20">
                  <span className="font-bold mindmate-title">MindMate:</span> {e.aiReflection}
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




