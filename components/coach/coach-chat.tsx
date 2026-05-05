"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function CoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask about spending, affordability, or how to save more this month."
    }
  ]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = value.trim();
    if (!message) return;

    setMessages((current) => [...current, { role: "user", content: message }]);
    setValue("");
    setLoading(true);

    const response = await fetch("/api/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const result = (await response.json()) as { answer?: string; message?: string };

    setMessages((current) => [
      ...current,
      { role: "assistant", content: result.answer ?? result.message ?? "I could not answer that right now." }
    ]);
    setLoading(false);
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="space-y-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={message.role === "user" ? "ml-auto max-w-[85%] rounded-md bg-ink px-3 py-2 text-sm text-white" : "max-w-[85%] rounded-md bg-paper px-3 py-2 text-sm text-ink"}
          >
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-ink/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Where am I wasting money?"
          className="w-full rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint"
        />
        <button type="submit" disabled={loading} className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white hover:bg-ink/90 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </section>
  );
}
