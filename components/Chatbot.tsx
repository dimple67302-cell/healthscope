"use client";

import { useRef, useState, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "Show hospitals in Amritsar for heart treatment under 20000",
  "Which hospitals have ICU?",
  "Which hospital is closest?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        "Hi! I'm HealthScope Assistant. Ask me things like \"Show hospitals in Amritsar for heart treatment under 20000\" or \"Which hospitals have ICU?\". I only answer using our hospital dataset — I won't make up facts.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Chat request failed");
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setError("Couldn't reach the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition hover:bg-brand-600"
        aria-label="Open HealthScope Assistant"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[22rem] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-2xl">
          <div className="bg-brand-500 px-4 py-3 text-white">
            <p className="font-bold">HealthScope Assistant</p>
            <p className="text-xs text-white/80">Grounded in our hospital dataset only</p>
          </div>

          <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-brand-500 text-white"
                    : "bg-brand-50 text-brand-700"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="max-w-[70%] rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">
                Typing…
              </div>
            )}
            {error && <div className="text-xs font-medium text-red-600">{error}</div>}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-brand-100 px-2.5 py-1 text-xs text-brand-700 hover:bg-brand-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2 border-t border-brand-100 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hospitals…"
              className="flex-1 rounded-lg border border-brand-100 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
