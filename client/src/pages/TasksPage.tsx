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
        <h2 className="text-sm font-semibold text-deepIndigo mb-1">
          Tasks to feel a bit better
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Tiny, gentle suggestions based on how you&apos;re feeling. Aim for
          small, kind steps only.
        </p>
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">Current emotion</span>
            <select
              className="rounded-xl border border-slate-200 px-2 py-1 text-xs bg-white"
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
            className="bg-deepIndigo text-white text-xs font-medium rounded-xl px-3 py-1.5 shadow disabled:opacity-60"
            style={{ backgroundColor: "#312e81", color: "#ffffff" }}
          >
            {loading ? "Refreshing..." : "Generate tasks"}
          </button>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
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
        <h3 className="text-sm font-semibold text-deepIndigo mb-2">
          Today&apos;s checklist
        </h3>
        {tasks.length === 0 && (
          <p className="text-xs text-slate-500">
            No tasks yet. Choose how you&apos;re feeling and generate a few
            gentle ideas.
          </p>
        )}
        <ul className="space-y-2 text-sm">
          {tasks.map((t) => (
            <li
              key={t._id}
              className="flex items-start gap-2 p-2 rounded-2xl border border-slate-100"
            >
              <button
                type="button"
                onClick={() => toggleTask(t._id)}
                className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                  t.completed
                    ? "bg-softBlue border-softBlue"
                    : "border-slate-300"
                }`}
              >
                {t.completed && (
                  <span className="w-2 h-2 rounded-full bg-deepIndigo" />
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




