"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Mic, Sparkles } from "lucide-react";
import { saveDraftQuote, type ExtractedQuoteDraft } from "@/lib/ai-parse";
import { EASE } from "@/lib/motion";
import { useSpeechInput } from "@/lib/use-speech-input";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; text: string };

type RespondPayload =
  | { type: "question"; message: string; quickReplies?: string[] }
  | { type: "decline"; message: string }
  | { type: "ready"; message: string; projectSummary: string }
  | { type: "error"; message: string };

const GREETING = "Vad ska vi göra idag? Skriv eller tala in ett jobb, t.ex. \"Måla villa 180 kvm åt Johan.\"";

/**
 * The Raycast/Linear-style AI Command Bar — the dashboard's real entry
 * point, not a search box. Talks to /api/ai/chat, asks follow-ups, and
 * once it has enough (type="ready") surfaces a concrete projectSummary.
 * The "Skapa offert av det här" button then runs a second AI pass
 * (/api/ai/extract-quote) that pulls structured fields — kund, mått,
 * timpris, påslag, ROT — out of that summary, hands the result to the
 * Offert-wizard via sessionStorage, and lands on a fully prefilled
 * förhandsgranskning. If that second pass fails, it falls back to the
 * old plain-text handoff (/offers/new?prompt=...) so the flow still
 * works, just with only the jobbrubrik prefilled.
 */
export function CommandBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectSummary, setProjectSummary] = useState<string | null>(null);
  const [creatingOffer, setCreatingOffer] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const speech = useSpeechInput((transcript) => {
    setInput(transcript);
    send(transcript);
  });

  useEffect(() => {
    panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    setInput("");
    setQuickReplies([]);
    setOpen(true);
    setProjectSummary(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, text }) => ({ role, text })) }),
      });
      const data: RespondPayload = await res.json();

      if (data.type === "error") {
        setMessages((m) => [...m, { role: "assistant", text: data.message }]);
      } else if (data.type === "ready") {
        setMessages((m) => [...m, { role: "assistant", text: data.message }]);
        setProjectSummary(data.projectSummary);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: data.message }]);
        if (data.type === "question") setQuickReplies(data.quickReplies?.slice(0, 4) ?? []);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Kunde inte nå AI-assistenten just nu." }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setQuickReplies([]);
    setProjectSummary(null);
    setOpen(false);
  };

  const createOffer = async () => {
    if (!projectSummary || creatingOffer) return;
    setCreatingOffer(true);
    try {
      const res = await fetch("/api/ai/extract-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: projectSummary }),
      });
      if (res.ok) {
        const data: { draft: ExtractedQuoteDraft } = await res.json();
        saveDraftQuote(data.draft);
        router.push("/offers/new?draft=1");
        return;
      }
    } catch {
      // Network hiccup — fall through to the plain-text handoff below.
    } finally {
      setCreatingOffer(false);
    }
    router.push(`/offers/new?prompt=${encodeURIComponent(projectSummary)}`);
  };

  return (
    <div className="relative w-full">
      <div className="glass flex items-center gap-2 rounded-2xl px-4 py-3.5">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => messages.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
          placeholder={GREETING}
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none sm:text-base"
        />
        {speech.supported && (
          <button
            type="button"
            onClick={() => (speech.listening ? speech.stop() : speech.start())}
            aria-label="Tala in"
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
              speech.listening ? "bg-primary/20 text-primary" : "text-ink-muted hover:text-ink"
            )}
          >
            <Mic className={cn("size-4", speech.listening && "animate-pulse")} />
          </button>
        )}
        <button
          type="button"
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          aria-label="Skicka"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        </button>
      </div>

      <AnimatePresence>
        {open && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="glass-strong absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 flex max-h-96 flex-col gap-3 overflow-hidden rounded-2xl p-4"
          >
            <div ref={panelRef} className="flex flex-col gap-2 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface-2/60 text-ink-secondary"
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Loader2 className="size-3 animate-spin" /> Tänker…
                </div>
              )}
            </div>

            {quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2">
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

            {projectSummary && (
              <div className="flex flex-col gap-2 rounded-xl border border-primary/25 bg-primary/[0.06] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Projekt klart</p>
                <p className="text-sm text-ink">{projectSummary}</p>
                <button
                  type="button"
                  onClick={createOffer}
                  disabled={creatingOffer}
                  className="mt-1 flex items-center justify-center gap-1.5 self-start rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {creatingOffer ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Fyller i offerten…
                    </>
                  ) : (
                    <>
                      Skapa offert av det här
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={reset}
              className="self-start text-xs text-ink-muted underline hover:text-ink"
            >
              Ny fråga
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
