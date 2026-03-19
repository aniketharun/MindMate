import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await api.login(email, password);
      } else {
        data = await api.register(name, email, password);
      }
      if (data.token) {
        setToken(data.token);
        navigate("/chat");
      }
    } catch (err) {
      setError("Something went wrong. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #ffc5d9 0%, #c7d2fe 50%, #a5f3e0 100%)",
      }}
    >
      <div className="w-full max-w-5xl flex items-center justify-between gap-8">
        {/* Left: large logo and title */}
        <div className="hidden md:flex flex-col items-center justify-center flex-1">
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: "50%",
              overflow: "hidden",
              background: "linear-gradient(135deg, #ffc5d9, #c7d2fe)",
              boxShadow: "0 16px 40px rgba(148,163,184,0.6)",
            }}
          >
            <img
              src="/mindmate_logo.png"
              alt="MindMate Logo"
              style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
            />
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl mindmate-title" style={{ color: "#312e81" }}>
            MindMate
          </h1>
        </div>

        {/* Right: auth card */}
        <div
          className="flex-1 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden bg-white/80"
          style={{ backdropFilter: "blur(20px)" }}
        >
          {/* Header */}
          <div
            className="px-8 pt-10 pb-6 text-center md:text-left"
            style={{
              background: "linear-gradient(135deg, rgba(255,197,217,0.4) 0%, rgba(199,210,254,0.4) 100%)",
            }}
          >
            <h2 className="text-2xl mb-1" style={{ color: "#312e81" }}>
              Your gentle companion for emotional well-being
            </h2>
          </div>

          {/* Tab Switcher */}
          <div className="px-8 pt-6">
          <div
            className="flex rounded-2xl p-1 mb-6"
            style={{ background: "#f1f5f9" }}
          >
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className="flex-1 py-2.5 rounded-xl text-base font-semibold"
              style={{
                ...(mode === "login"
                  ? {
                      background: "linear-gradient(135deg, #ffc5d9, #c7d2fe)",
                      color: "#312e81",
                      boxShadow: "0 2px 8px rgba(199,210,254,0.5)",
                    }
                  : { color: "#64748b" }),
                transition: "transform 0.15s, box-shadow 0.15s, filter 0.15s",
              }}
              onMouseEnter={(e) => {
                if (mode !== "login") {
                  (e.currentTarget as HTMLElement).style.color = "#312e81";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,197,217,0.3)";
                } else {
                  (e.currentTarget as HTMLElement).style.filter = "brightness(0.95)";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== "login") {
                  (e.currentTarget as HTMLElement).style.color = "#64748b";
                  (e.currentTarget as HTMLElement).style.background = "";
                } else {
                  (e.currentTarget as HTMLElement).style.filter = "";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                ...(mode === "register"
                  ? {
                      background: "linear-gradient(135deg, #ffc5d9, #c7d2fe)",
                      color: "#312e81",
                      boxShadow: "0 2px 8px rgba(199,210,254,0.5)",
                    }
                  : { color: "#64748b" }),
                transition: "transform 0.15s, box-shadow 0.15s, filter 0.15s",
              }}
              onMouseEnter={(e) => {
                if (mode !== "register") {
                  (e.currentTarget as HTMLElement).style.color = "#312e81";
                  (e.currentTarget as HTMLElement).style.background = "rgba(199,210,254,0.3)";
                } else {
                  (e.currentTarget as HTMLElement).style.filter = "brightness(0.95)";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== "register") {
                  (e.currentTarget as HTMLElement).style.color = "#64748b";
                  (e.currentTarget as HTMLElement).style.background = "";
                } else {
                  (e.currentTarget as HTMLElement).style.filter = "";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pb-8">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#475569" }}>
                  Name or nickname
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-3 text-base transition-all"
                  style={{
                    border: "1.5px solid #e2e8f0",
                    outline: "none",
                    color: "#1e293b",
                    background: "#fff",
                  }}
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#c7d2fe")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>
                Email address
              </label>
              <input
                type="email"
                className="w-full rounded-xl border px-4 py-3 text-base transition-all"
                style={{
                  border: "1.5px solid #e2e8f0",
                  outline: "none",
                  color: "#1e293b",
                  background: "#fff",
                }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#c7d2fe")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-xl border px-4 py-3 text-base transition-all"
                style={{
                  border: "1.5px solid #e2e8f0",
                  outline: "none",
                  color: "#1e293b",
                  background: "#fff",
                }}
                placeholder={mode === "register" ? "Create a strong password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#c7d2fe")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                required
              />
            </div>

            <button
              type="button"
              className="text-xs font-bold underline"
              style={{ color: "#312e81" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot your password?
            </button>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 font-bold rounded-2xl py-3.5 text-base shadow-lg flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #312e81 0%, #4c1d95 100%)",
                color: "#ffffff",
                opacity: loading ? 0.8 : 1,
                transition: "transform 0.15s, box-shadow 0.15s, filter 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(49,46,129,0.4)";
                  (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
                (e.currentTarget as HTMLElement).style.filter = "";
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : mode === "login" ? (
                "Sign In →"
              ) : (
                "Create My Account →"
              )}
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                }}
                className="text-sm font-bold underline transition-colors"
                style={{ color: "#312e81" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4c1d95")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#312e81")}
              >
                {mode === "login"
                  ? "Don't have an account? Create one"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
          {/* close tab-switcher container */}
          </div>
          {/* Footer */}
          <div
            className="px-8 py-5 text-center text-xs opacity-60"
            style={{ color: "#64748b" }}
          >
            MindMate is not a crisis or medical service. If you&apos;re in immediate
            danger, contact emergency services.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
