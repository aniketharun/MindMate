import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken, setToken } from "../lib/api";

type Profile = {
  name: string;
  ageRange?: string;
  focusAreas?: string[];
  preferredTone?: string;
  dailyCheckInReminder?: boolean;
  email?: string;
};

const focusOptions = [
  "Stress",
  "Anxiety",
  "Mood",
  "Productivity",
  "Sleep",
  "Relationships",
];

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate("/auth");
      return;
    }

    setLoading(true);
    api
      .getProfile()
      .then((data) => {
        setProfile(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Profile load failed:", err);
        setError("Could not load profile. Please sign in again.");
        setTimeout(() => navigate("/auth"), 900);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const toggleFocus = (item: string) => {
    if (!profile) return;
    const current = profile.focusAreas || [];
    const exists = current.includes(item);
    const next = exists
      ? current.filter((x) => x !== item)
      : [...current, item];
    setProfile({ ...profile, focusAreas: next });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("mindmate_token");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex items-center gap-3 text-sm text-slate-600">
        <svg
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#312e81"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Loading your profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 rounded-3xl shadow-lg p-6 text-sm text-slate-600">
        <div className="mb-3 font-bold">Unable to load profile</div>
        <div className="mb-3">{error}</div>
        <button
          onClick={() => navigate("/auth")}
          className="rounded-xl bg-indigo-600 text-white px-4 py-2"
        >
          Go to sign in
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-white/80 rounded-3xl shadow-lg overflow-hidden">
        {/* Profile header banner */}
        <div
          className="px-6 py-5 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(255,197,217,0.5) 0%, rgba(199,210,254,0.5) 100%)",
            borderBottom: "1px solid rgba(199,210,254,0.3)",
          }}
        >
          {/* Avatar circle */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-md"
            style={{
              background: "linear-gradient(135deg, #ffc5d9, #c7d2fe)",
              color: "#312e81",
            }}
          >
            {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#312e81" }}>
              {profile.name || "Your Profile"}
            </h2>
            {profile.email && (
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
                {profile.email}
              </p>
            )}
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              MindMate Member
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            These details help MindMate shape responses in a way that fits you.
          </p>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: "#475569" }}>
              Name or nickname
            </label>
            <input
              className="w-full rounded-xl border px-4 py-3 text-base transition-all"
              style={{ border: "1.5px solid #e2e8f0", outline: "none", color: "#1e293b" }}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = "#c7d2fe")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: "#475569" }}>
              Age range
            </label>
            <select
              className="w-full rounded-xl border px-4 py-3 text-base bg-white"
              style={{ border: "1.5px solid #e2e8f0", color: "#1e293b", outline: "none" }}
              value={profile.ageRange || ""}
              onChange={(e) => setProfile({ ...profile, ageRange: e.target.value })}
            >
              <option value="">Prefer not to say</option>
              <option value="18-24">18–24</option>
              <option value="25-34">25–34</option>
              <option value="35-44">35–44</option>
              <option value="45-54">45–54</option>
              <option value="55+">55+</option>
            </select>
          </div>

          {/* Focus Areas */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "#475569" }}>
              Focus areas
            </label>
            <div className="flex flex-wrap gap-2">
              {focusOptions.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFocus(f)}
                  className="px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150"
                  style={
                    profile.focusAreas?.includes(f)
                      ? {
                          background: "linear-gradient(135deg, #c7d2fe, #ffc5d9)",
                          border: "1.5px solid #c7d2fe",
                          color: "#312e81",
                        }
                      : {
                          border: "1.5px solid #e2e8f0",
                          color: "#64748b",
                        }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Tone */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "#475569" }}>
              Preferred AI tone
            </label>
            <div className="flex gap-2 text-sm">
              {[
                { value: "gentle", label: "🌸 Gentle" },
                { value: "neutral", label: "☁️ Neutral" },
                { value: "motivating", label: "⚡ Motivating" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProfile({ ...profile, preferredTone: opt.value })}
                  className="flex-1 py-3 rounded-xl border font-bold transition-all duration-150"
                  style={
                    profile.preferredTone === opt.value
                      ? {
                          background: "linear-gradient(135deg, #c7d2fe, #ffc5d9)",
                          border: "1.5px solid #c7d2fe",
                          color: "#312e81",
                        }
                      : {
                          border: "1.5px solid #e2e8f0",
                          color: "#64748b",
                        }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Reminder */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: "#f8fafc", border: "1.5px solid #f1f5f9" }}
          >
            <div>
              <p className="text-sm font-bold" style={{ color: "#475569" }}>
                Daily check-in reminder
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                Get a gentle nudge each day
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={!!profile.dailyCheckInReminder}
                onChange={(e) =>
                  setProfile({ ...profile, dailyCheckInReminder: e.target.checked })
                }
              />
              <div
                className="w-10 h-6 rounded-full relative transition-all duration-200"
                style={{
                  background: profile.dailyCheckInReminder
                    ? "linear-gradient(135deg, #312e81, #4c1d95)"
                    : "#e2e8f0",
                }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                  style={{ left: profile.dailyCheckInReminder ? "22px" : "4px" }}
                />
              </div>
            </label>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full font-bold rounded-2xl py-3.5 text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: saved
                ? "linear-gradient(135deg, #10b981, #059669)"
                : saving
                ? "#94a3b8"
                : "linear-gradient(135deg, #312e81, #4c1d95)",
              color: "#ffffff",
            }}
          >
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved!
              </>
            ) : saving ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Saving…
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </form>
      </div>

      {/* Danger Zone / Info card */}
      <div
        className="bg-white/70 rounded-3xl shadow p-5 text-sm flex flex-col gap-4"
        style={{ border: "1px solid #f1f5f9" }}
      >
        <p style={{ color: "#64748b" }}>
          MindMate is not a crisis or medical service. If you&apos;re in
          immediate danger, please contact local emergency services or a
          trusted professional.
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-150 hover:opacity-90 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #ffc5d9, #c7d2fe)",
              color: "#312e81",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
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
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
