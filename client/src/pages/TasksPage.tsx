import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../lib/api";

type Task = {
  _id: string;
  title: string;
  completed: boolean;
  emotion?: string;
};

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState("neutral");
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate("/auth");
      return;
    }
    api
      .listTasks()
      .then((data) => setTasks(data))
      .catch(() => {});
  }, [navigate]);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.completed).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const created = await api.generateTasks(emotion);
      setTasks(created);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const updated = await api.toggleTask(id);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/80 rounded-3xl shadow-lg p-4">
        <h2 className="text-2xl text-deepIndigo mb-1 mindmate-title">
          Tasks to feel a bit better
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Tiny, gentle suggestions based on how you&apos;re feeling. Aim for
          small, kind steps only.
        </p>
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 font-semibold">Current emotion</span>
            <select
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm bg-white"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
            >
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="anxious">Anxious</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="bg-deepIndigo text-white text-sm font-bold rounded-xl px-4 py-2 shadow-lg disabled:opacity-60"
            style={{
              backgroundColor: "#312e81",
              color: "#ffffff",
              transition: "transform 0.15s, box-shadow 0.15s, filter 0.15s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
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
            {loading ? "Refreshing..." : "Generate tasks"}
          </button>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #c7d2fe 0%, #ffc5d9 100%)",
              }}
            />
          </div>
        </div>
      </div>
      <div className="bg-white/80 rounded-3xl shadow-lg p-4">
        <h3 className="text-base font-bold text-deepIndigo mb-3">
          Today&apos;s checklist
        </h3>
        {tasks.length === 0 && (
          <p className="text-sm text-slate-500">
            No tasks yet. Choose how you&apos;re feeling and generate a few
            gentle ideas.
          </p>
        )}
        <ul className="space-y-3 text-base">
          {tasks.map((t) => (
            <li
              key={t._id}
              className="flex items-start gap-2 p-2 rounded-2xl border border-slate-100"
            >
              <button
                type="button"
                onClick={() => toggleTask(t._id)}
                className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${
                  t.completed
                    ? "bg-softBlue border-softBlue shadow-sm"
                    : "border-slate-300"
                }`}
              >
                {t.completed && (
                  <span className="w-2.5 h-2.5 rounded-full bg-deepIndigo" />
                )}
              </button>
              <div className="flex-1">
                <p
                  className={`${
                    t.completed ? "line-through text-slate-400" : "text-slate-700"
                  }`}
                >
                  {t.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TasksPage;




