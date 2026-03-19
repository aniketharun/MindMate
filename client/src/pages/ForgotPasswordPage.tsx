import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // In a real app this would call an API; for now just simulate success
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 800);
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

        {/* Right: forgot password card */}
        <div
          className="flex-1 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden bg-white/85"
          style={{ backdropFilter: "blur(20px)" }}
        >
          <div
            className="px-8 pt-10 pb-6 text-center md:text-left"
            style={{
              background: "linear-gradient(135deg, rgba(255,197,217,0.4) 0%, rgba(199,210,254,0.4) 100%)",
            }}
          >
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#312e81" }}>
              Forgot your password?
            </h1>
            <p className="text-sm" style={{ color: "#64748b" }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-4">
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
            />
          </div>
          {sent && (
            <p className="text-xs font-semibold" style={{ color: "#16a34a" }}>
              If an account exists for this email, a reset link has been sent.
            </p>
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
              opacity: loading ? 0.9 : 1,
            }}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
          <button
            type="button"
            className="w-full text-xs font-bold underline mt-2"
            style={{ color: "#312e81" }}
            onClick={() => navigate("/auth")}
          >
            Back to sign in
          </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

