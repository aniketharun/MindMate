import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../lib/api";

type ChatMessage = {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  emotion?: string;
};

export type ChatPageHandle = {
  focusInput: () => void;
  scrollToInput: () => void;
};

const ChatPage = forwardRef<ChatPageHandle, {}>((props, forwardedRef) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(forwardedRef, () => ({
    focusInput: () => {
      inputRef.current?.focus();
    },
    scrollToInput: () => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
  }));

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

  // Auto-focus input when page loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const toSend = input;
    setInput("");
    setLoading(true);

    // Re-focus the input after sending
    setTimeout(() => inputRef.current?.focus(), 50);

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
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)] md:max-h-[70vh] bg-white/80 rounded-3xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-indigo-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl text-deepIndigo mindmate-title">
            MindMate Chat
          </h2>
          <p className="text-sm text-slate-500">
            Gentle, non-judgmental support. Not a crisis service.
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-slate-500 mt-6 px-4">
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
              className={`max-w-[85%] px-4 py-3 text-base shadow-sm ${
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
                <p className="mt-1 text-xs text-slate-400">
                  Noticing: {m.emotion}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="inline-block w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="inline-block w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="border-t border-indigo-50 px-3 py-2 flex gap-2 bg-white/90"
      >
        <textarea
          ref={inputRef}
          placeholder="How are you feeling right now?"
          className="flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-softBlue max-h-24"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          type="submit"
          disabled={loading}
          title="Send message"
          className="self-end text-white text-sm font-bold rounded-2xl px-5 py-2.5 shadow-lg flex items-center gap-1 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #312e81, #4c1d95)",
            minWidth: "44px",
            transition: "transform 0.15s, box-shadow 0.15s, filter 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.07)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(49,46,129,0.45)";
              (e.currentTarget as HTMLElement).style.filter = "brightness(1.15)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "";
            (e.currentTarget as HTMLElement).style.filter = "";
          }}
        >
          <span>Send</span>
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
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </form>
    </div>
  );
});

export default ChatPage;
