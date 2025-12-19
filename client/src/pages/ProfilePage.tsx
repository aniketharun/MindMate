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
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate("/auth");
      return;
    }
    api
      .getProfile()
      .then((data) => setProfile(data))
      .catch(() => {});
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

  if (!profile) {
    return (
      <div className="bg-white/80 rounded-3xl shadow-lg p-4 text-sm text-slate-600">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSave}
        className="bg-white/80 rounded-3xl shadow-lg p-4 space-y-3"
      >
        <h2 className="text-sm font-semibold text-deepIndigo mb-1">
          Your MindMate profile
        </h2>
        <p className="text-xs text-slate-500 mb-2">
          These details help MindMate shape responses in a way that fits you.
        </p>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Name or nickname
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-softBlue"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Age range
          </label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
            value={profile.ageRange || ""}
            onChange={(e) =>
              setProfile({ ...profile, ageRange: e.target.value })
            }
          >
            <option value="">Prefer not to say</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55+">55+</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Focus areas
          </label>
          <div className="flex flex-wrap gap-2">
            {focusOptions.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFocus(f)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  profile.focusAreas?.includes(f)
                    ? "bg-softBlue border-softBlue text-deepIndigo"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Preferred AI tone
          </label>
          <div className="flex gap-2 text-xs">
            {[
              { value: "gentle", label: "Gentle" },
              { value: "neutral", label: "Neutral" },
              { value: "motivating", label: "Motivating" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setProfile({ ...profile, preferredTone: opt.value })
                }
                className={`flex-1 py-1.5 rounded-full border ${
                  profile.preferredTone === opt.value
                    ? "bg-softBlue border-softBlue text-deepIndigo"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <input
              id="reminder"
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300"
              checked={!!profile.dailyCheckInReminder}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  dailyCheckInReminder: e.target.checked,
                })
              }
            />
            <label htmlFor="reminder" className="text-slate-700">
              Daily check-in reminder
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-2 bg-deepIndigo text-white text-xs font-medium rounded-xl px-4 py-2 shadow disabled:opacity-60"
          style={{ backgroundColor: "#312e81", color: "#ffffff" }}
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
      <div className="bg-white/70 rounded-3xl shadow p-4 text-xs text-slate-500 flex justify-between items-center">
        <p>
          MindMate is not a crisis or medical service. If you&apos;re in
          immediate danger, please contact local emergency services or a
          trusted professional.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="ml-4 text-[11px] text-deepIndigo underline"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;




