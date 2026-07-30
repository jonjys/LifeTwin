"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; text: string; isError?: boolean };

type RespondPayload =
  | { type: "question"; message: string; quickReplies?: string[] }
  | { type: "decline"; message: string }
  | { type: "ready"; message: string; itemsQuery: string }
  | { type: "error"; message: string };

const GREETING =
  "Hej! Berätta fritt vad du behöver köpa, så ställer jag några snabba följdfrågor om jag behöver veta mer.";

/**
 * The real conversational entry point: talks to /api/ai/chat (Claude),
 * asks follow-ups, then hands the resolved item list to the exact same
 * submit() the category chips and search box already use — the AI never
 * invents prices or stores itself, only the final product list.
 */
export function AiChat({ onReady }: { onReady: (itemsQuery: string) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    setInput("");
    setQuickReplies([]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, text }) => ({ role, text })) }),
      });
      const data: RespondPayload = await res.json();

      if (data.type === "error") {
        setMessages((m) => [...m, { role: "assistant", text: data.message, isError: true }]);
      } else if (data.type === "ready") {
        setMessages((m) => [...m, { role: "assistant", text: data.message }]);
        setTimeout(() => {
          setOpen(false);
          onReady(data.itemsQuery);
        }, 600);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: data.message }]);
        if (data.type === "question") setQuickReplies(data.quickReplies?.slice(0, 4) ?? []);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Kunde inte nå AI-chatten just nu. Kontrollera din uppkoppling.", isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/[0.08]"
      >
        <MessageCircle className="size-3.5" aria-hidden="true" />
        Fråga Karma AI
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong flex h-[80vh] w-full max-w-lg flex-col rounded-t-3xl sm:h-[70vh] sm:rounded-3xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <span className="text-sm font-semibold text-ink">Karma AI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Stäng"
                  className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : m.isError
                            ? "border border-warning/30 bg-warning/10 text-warning"
                            : "bg-surface-2/60 text-ink-secondary",
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl bg-surface-2/60 px-3.5 py-2 text-sm text-ink-muted">
                      <Loader2 className="size-3.5 animate-spin" /> Tänker…
                    </div>
                  </div>
                )}
              </div>

              {quickReplies.length > 0 && (
                <div className="flex shrink-0 flex-wrap gap-2 px-5 pb-2">
                  {quickReplies.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => send(r)}
                      className="rounded-full border border-border bg-surface-2/50 px-3 py-1 text-xs text-ink-secondary hover:border-primary/40 hover:text-ink"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex shrink-0 items-center gap-2 border-t border-border p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send(input);
                  }}
                  placeholder="Skriv ditt svar…"
                  autoFocus
                  className="flex-1 rounded-xl bg-surface-2/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
                />
                <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || loading}>
                  <Send className="size-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
