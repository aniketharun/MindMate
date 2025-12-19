const API_BASE = "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("mindmate_token");

export const setToken = (token: string) =>
  localStorage.setItem("mindmate_token", token);

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error("Register failed");
    return res.json();
  },
  async getProfile() {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to load profile");
    return res.json();
  },
  async updateProfile(payload: any) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
  },
  async sendChat(message: string) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },
  async getChatHistory() {
    const res = await fetch(`${API_BASE}/chat/history`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to load chat history");
    return res.json();
  },
  async listJournals() {
    const res = await fetch(`${API_BASE}/journals`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to load journals");
    return res.json();
  },
  async createJournal(entry: {
    content: string;
    moodEmoji: string;
    date: string;
  }) {
    const res = await fetch(`${API_BASE}/journals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Failed to save journal");
    return res.json();
  },
  async listTasks() {
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to load tasks");
    return res.json();
  },
  async generateTasks(emotion: string) {
    const res = await fetch(`${API_BASE}/tasks/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ emotion }),
    });
    if (!res.ok) throw new Error("Failed to generate tasks");
    return res.json();
  },
  async toggleTask(id: string) {
    const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: "PATCH",
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  },
};




