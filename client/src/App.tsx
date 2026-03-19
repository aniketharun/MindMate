import React, { useEffect, useState, useMemo, useRef } from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import type { ChatPageHandle } from "./pages/ChatPage";
import JournalPage from "./pages/JournalPage";
import TasksPage from "./pages/TasksPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MoodCalendar from "./components/MoodCalendar";
import { api, getToken, setToken } from "./lib/api";

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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-inner border-t border-indigo-50/50 md:hidden z-50">
      <div className="flex justify-around py-3 px-2">
        {tabs.map((tab) => {
          const active = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
                active
                  ? "bg-deepIndigo text-white shadow-md scale-105"
                  : "text-slate-500 hover:bg-white hover:text-deepIndigo"
              }`}
              style={active
                ? { backgroundColor: "#312e81" }
                : { backgroundColor: "transparent" }}
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
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMoodCalendarOpen, setIsMoodCalendarOpen] = useState(false);

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

  const chatPageRef = useRef<ChatPageHandle | null>(null);

  const goToChatAndFocusInput = () => {
    navigate("/chat");
    setTimeout(() => {
      chatPageRef.current?.focusInput();
      chatPageRef.current?.scrollToInput();
    }, 150);
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("mindmate_token");
    navigate("/auth");
  };

  // On auth routes, keep a simple centered layout
  if (location.pathname === "/auth" || location.pathname === "/forgot-password") {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full px-0 md:px-6 py-4 md:py-8 flex gap-4 md:gap-6">
        {/* Left dashboard illustration / summary column */}
        <aside className="hidden md:flex flex-col w-64 bg-primaryMint rounded-3xl shadow-lg p-5 justify-between">
          <div>
            <Link to="/chat" className="flex items-center gap-3 mb-4">
              {/* Logo — full circle, no padding */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #ffc5d9, #c7d2fe)",
                }}
              >
                <img
                  src="/mindmate_logo.png"
                  alt="MindMate Logo"
                  style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                />
              </div>
              <div>
                <p className="text-3xl text-deepIndigo mindmate-title">
                  MindMate
                </p>
              </div>
            </Link>
            <h2 className="text-lg font-bold text-deepIndigo mb-1.5">
              Check in with yourself
            </h2>
            <p className="text-base text-deepIndigo/80 mb-5 leading-relaxed">
              Notice how you&apos;re feeling today and take one small caring
              step.
            </p>
            <button
              type="button"
              onClick={goToChatAndFocusInput}
              className="block w-full rounded-2xl text-deepIndigo text-base font-bold py-3 shadow-sm"
              style={{ backgroundColor: "#ffc5d9", color: "#312e81", transition: "transform 0.15s, box-shadow 0.15s, background 0.15s" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(255,197,217,0.7)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "#ffb3cc";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
                (e.currentTarget as HTMLElement).style.backgroundColor = "#ffc5d9";
              }}
            >
              Start a chat →
            </button>
          </div>
          <div className="mt-6 text-xs text-deepIndigo/80">
            <div className="flex justify-between items-center mb-1">
              <p className="font-bold">Daily progress</p>
              <p className="font-bold">{progress}%</p>
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
            <p className="text-sm leading-relaxed">Keep improving the quality of your emotional health.</p>
            {/* Profile quick link card */}
            <button
              type="button"
              onClick={() => setIsMoodCalendarOpen(true)}
              className="w-full text-left mt-3 rounded-full border px-4 py-2 text-sm font-bold transition-all duration-200"
              style={{
                borderColor: "#c7d2fe",
                backgroundColor: "rgba(255,255,255,0.85)",
                color: "#5b21b6",
                boxShadow: "0 4px 12px rgba(129, 140, 248, 0.15)",
                transform: "translateY(0)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 16px rgba(129, 140, 248, 0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(129, 140, 248, 0.15)";
              }}
            >
              🗓️ Mood Calendar
            </button>
            <Link
              to="/profile"
              className="mt-3 block rounded-2xl bg-white/80 text-deepIndigo px-4 py-3 text-sm font-bold shadow-sm hover:bg-white hover:shadow-md transition-all duration-150"
            >
              Your Profile →
            </Link>
          </div>
        </aside>

        {/* Main dashboard column */}
        <section className="flex-1 flex flex-col">
          <header className="mb-4 md:mb-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-deepIndigo">
                  Hey buddy!
                </h1>
                <p className="text-base md:text-lg text-slate-600">
                  Let&apos;s gently track how your mind and mood are doing.
                </p>
              </div>

              {/* Logout button — top right */}
              <button
                onClick={handleLogout}
                title="Log out"
                className="fixed top-4 right-4 z-50 flex items-center gap-1.5 text-base font-bold px-5 py-2.5 rounded-xl shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #ffc5d9, #c7d2fe)",
                  color: "#312e81",
                  transition: "transform 0.15s, box-shadow 0.15s, filter 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(199,210,254,0.7)";
                  (e.currentTarget as HTMLElement).style.filter = "brightness(0.95)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                  (e.currentTarget as HTMLElement).style.filter = "";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
            {/* Top tab navigation on desktop */}
            <div className="hidden md:flex bg-slate-100 rounded-full p-1 text-base font-bold w-full max-w-md">
              <Link
                to="/chat"
                className={`flex-1 text-center py-2 rounded-full transition-colors duration-150 ${
                  location.pathname === "/chat"
                    ? "bg-white shadow text-deepIndigo"
                    : "text-slate-600 hover:bg-white hover:text-deepIndigo"
                }`}
              >
                Chat
              </Link>
              <Link
                to="/journal"
                className={`flex-1 text-center py-1.5 rounded-full transition-colors duration-150 ${
                  location.pathname === "/journal"
                    ? "bg-white shadow text-deepIndigo"
                    : "text-slate-600 hover:bg-white hover:text-deepIndigo"
                }`}
              >
                Journal
              </Link>
              <Link
                to="/tasks"
                className={`flex-1 text-center py-1.5 rounded-full transition-colors duration-150 ${
                  location.pathname === "/tasks"
                    ? "bg-white shadow text-deepIndigo"
                    : "text-slate-600 hover:bg-white hover:text-deepIndigo"
                }`}
              >
                Tasks
              </Link>
              <Link
                to="/profile"
                className="hidden"
              />
            </div>
          </header>

          <main className="flex-1 pb-20 md:pb-0">
            <Routes>
              <Route path="/chat" element={<ChatPage ref={chatPageRef} />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/" element={<Navigate to="/chat" replace />} />
            </Routes>
          </main>
          <MoodCalendar open={isMoodCalendarOpen} onClose={() => setIsMoodCalendarOpen(false)} />
        </section>
      </div>
      <footer className="px-6 py-4 text-xs md:text-sm text-slate-500/80 text-center">
        <div className="max-w-6xl mx-auto">
          <p>
            MindMate is not a crisis or medical service. If you&apos;re in immediate danger, contact local emergency services.
          </p>
          {/* Spacer so footer is not covered by mobile bottom nav */}
          <div className="h-20 md:hidden" />
        </div>
      </footer>
      {/* Mobile bottom nav */}
      <Navbar />
    </div>
  );
};

const App: React.FC = () => {
  return <AppShell />;
};

export default App;
