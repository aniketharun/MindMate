import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../lib/api";

type ChatMessage = {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  emotion?: string;
};

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!getToken()) {
      navigate("/auth");
      return;
    }
    api
      .getChatHistory()
      .then((data) => setMessages(data))
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const toSend = input;
    setInput("");
    setLoading(true);
    try {
      const res = await api.sendChat(toSend);
      const botMsg: ChatMessage = {
        role: "assistant",
        content: res.reply,
        emotion: res.emotion,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having a little trouble responding right now, but your feelings matter. You can try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)] md:max-h-[70vh] bg-white/80 rounded-3xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-indigo-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-deepIndigo">
            MindMate Chat
          </h2>
          <p className="text-xs text-slate-500">
            Gentle, non-judgmental support. Not a crisis service.
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-xs text-slate-500 mt-6">
            Share a bit about how you&apos;re feeling today. MindMate will
            listen and respond softly.
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 text-sm shadow-sm ${
                m.role === "user"
                  ? "bg-deepIndigo text-white rounded-2xl rounded-br-sm"
                  : "bg-slate-50 text-slate-800 rounded-2xl rounded-bl-sm"
              }`}
              style={
                m.role === "user"
                  ? { backgroundColor: "#312e81", color: "#ffffff" }
                  : undefined
              }
            >
              <p className="whitespace-pre-line">{m.content}</p>
              {m.role === "assistant" && m.emotion && (
                <p className="mt-1 text-[10px] text-slate-500">
                  Noticing: {m.emotion}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-slate-500">MindMate is thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="border-t border-indigo-50 px-3 py-2 flex gap-2 bg-white/90"
      >
        <textarea
          placeholder="How are you feeling right now?"
          className="flex-1 resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-softBlue max-h-24"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="self-end bg-deepIndigo text-white text-xs font-medium rounded-2xl px-3 py-2 shadow disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;




