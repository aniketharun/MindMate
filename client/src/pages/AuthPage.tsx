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
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white/80 rounded-3xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-deepIndigo text-center">
          Welcome to MindMate
        </h2>
        <p className="text-sm text-slate-600 text-center">
          A gentle companion for emotional check-ins. This is not a substitute
          for professional help.
        </p>

        <div className="flex bg-slate-100 rounded-full p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-1 rounded-full ${
              mode === "login" ? "bg-white shadow text-deepIndigo" : "text-slate-600"
            }`}
            style={
              mode === "login"
                ? { backgroundColor: "#ffffff", color: "#312e81" }
                : { color: "#475569" }
            }
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-1 rounded-full ${
              mode === "register" ? "bg-white shadow text-deepIndigo" : "text-slate-600"
            }`}
            style={
              mode === "register"
                ? { backgroundColor: "#ffffff", color: "#312e81" }
                : { color: "#475569" }
            }
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Name or nickname
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-softBlue"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-softBlue"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-softBlue"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-deepIndigo text-white text-sm font-medium rounded-xl py-2 shadow-md disabled:opacity-60"
            style={{ backgroundColor: "#312e81", color: "#ffffff" }}
          >
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
              ? "Login"
              : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;




