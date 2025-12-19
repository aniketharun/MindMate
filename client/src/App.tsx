import React, { useEffect, useState, useMemo } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import JournalPage from "./pages/JournalPage";
import TasksPage from "./pages/TasksPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import { api, getToken } from "./lib/api";

type Task = {
  _id: string;
  title: string;
  completed: boolean;
  emotion?: string;
};

const Navbar: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { to: "/chat", label: "Chat" },
    { to: "/journal", label: "Journal" },
    { to: "/tasks", label: "Tasks" },
    { to: "/profile", label: "Profile" },
  ];

  // Bottom navbar only on mobile; hide on auth screen
  if (location.pathname === "/auth") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur shadow-inner border-t border-mint md:hidden">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const active = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                active
                  ? "bg-softBlue text-deepIndigo"
                  : "text-slate-600 hover:bg-lavender"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const [userName, setUserName] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (location.pathname !== "/auth" && getToken()) {
      api
        .getProfile()
        .then((profile) => {
          if (profile.name) {
            setUserName(profile.name);
          }
        })
        .catch(() => {
          // If profile fetch fails, user might need to re-authenticate
        });

      api
        .listTasks()
        .then((data) => setTasks(data))
        .catch(() => {
          // If tasks fetch fails, continue without tasks
        });
    }
  }, [location.pathname]);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.completed).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  // On auth route, keep a simple centered layout
  if (location.pathname === "/auth") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-3 md:px-6 py-4 md:py-8 flex gap-4 md:gap-6">
        {/* Left dashboard illustration / summary column */}
        <aside className="hidden md:flex flex-col w-64 bg-primaryMint rounded-3xl shadow-lg p-5 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primaryPink flex items-center justify-center text-sm font-semibold text-deepIndigo">
                MM
              </div>
              <div>
                <p className="text-xs text-deepIndigo/80">
                  Welcome back{userName ? ` ${userName}` : ""}
                </p>
                <p className="text-sm font-semibold text-deepIndigo">
                  MindMate
                </p>
              </div>
            </div>
            <h2 className="text-sm font-semibold text-deepIndigo mb-1">
              Check in with yourself
            </h2>
            <p className="text-xs text-deepIndigo/80 mb-4">
              Notice how you&apos;re feeling today and take one small caring
              step.
            </p>
            <Link
              to="/chat"
              className="block w-full rounded-2xl bg-primaryPink text-deepIndigo text-xs font-semibold py-2 shadow-sm text-center"
              style={{ backgroundColor: "#ffc5d9", color: "#312e81" }}
            >
              Start a chat
            </Link>
          </div>
          <div className="mt-6 text-[11px] text-deepIndigo/80">
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold">Daily progress</p>
              <p className="font-semibold">{progress}%</p>
            </div>
            <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #c7d2fe 0%, #ffc5d9 100%)",
                }}
              />
            </div>
            <p>Keep improving the quality of your emotional health.</p>
          </div>
        </aside>

        {/* Main dashboard column */}
        <section className="flex-1 flex flex-col">
          <header className="mb-4 md:mb-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-deepIndigo">
                  Hi, friend
                </h1>
                <p className="text-xs md:text-sm text-slate-600">
                  Let&apos;s gently track how your mind and mood are doing.
                </p>
              </div>
            </div>
            {/* Top tab navigation on desktop */}
            <div className="hidden md:flex bg-slate-100 rounded-full p-1 text-xs font-medium w-full max-w-md">
              <Link
                to="/chat"
                className={`flex-1 text-center py-1.5 rounded-full ${
                  location.pathname === "/chat"
                    ? "bg-white shadow text-deepIndigo"
                    : "text-slate-600"
                }`}
              >
                Chat
              </Link>
              <Link
                to="/journal"
                className={`flex-1 text-center py-1.5 rounded-full ${
                  location.pathname === "/journal"
                    ? "bg-white shadow text-deepIndigo"
                    : "text-slate-600"
                }`}
              >
                Journal
              </Link>
              <Link
                to="/tasks"
                className={`flex-1 text-center py-1.5 rounded-full ${
                  location.pathname === "/tasks"
                    ? "bg-white shadow text-deepIndigo"
                    : "text-slate-600"
                }`}
              >
                Tasks
              </Link>
              <Link
                to="/profile"
                className={`flex-1 text-center py-1.5 rounded-full ${
                  location.pathname === "/profile"
                    ? "bg-white shadow text-deepIndigo"
                    : "text-slate-600"
                }`}
              >
                Profile
              </Link>
            </div>
          </header>

          <main className="flex-1 pb-20 md:pb-0">
            <Routes>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/" element={<Navigate to="/chat" replace />} />
            </Routes>
          </main>
        </section>
      </div>
      {/* Mobile bottom nav */}
      <Navbar />
    </div>
  );
};

const App: React.FC = () => {
  return <AppShell />;
};

export default App;



