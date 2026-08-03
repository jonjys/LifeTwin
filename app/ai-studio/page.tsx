"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Copy, MessageSquareText, Percent, Send, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type MarginSummary = {
  totalQuotes: number;
  countByStatus: { DRAFT: number; SENT: number; ACCEPTED: number; DECLINED: number };
  winRatePct: number | null;
  avgMarkupPct: number | null;
  avgQuoteValueSEK: number | null;
  pipelineValueSEK: number;
};

type SentQuote = { id: string; number: string; jobTitle: string; customer: { name: string } };

function fmt(n: number): string {
  return `${Math.round(n).toLocaleString("sv-SE")} kr`;
}

export default function AiStudioPage() {
  const [summary, setSummary] = useState<MarginSummary | null>(null);
  const [connected, setConnected] = useState(true);
  const [sentQuotes, setSentQuotes] = useState<SentQuote[]>([]);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<Record<string, string>>({});
  const [draftError, setDraftError] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ai-studio/margin-summary");
        if (!res.ok) {
          setConnected(false);
          return;
        }
        const data = await res.json();
        setConnected(true);
        setSummary(data.summary);
      } catch {
        setConnected(false);
      }
    })();
    (async () => {
      try {
        const res = await fetch("/api/quotes");
        if (!res.ok) return;
        const data = await res.json();
        setSentQuotes((data.quotes ?? []).filter((q: { status: string }) => q.status === "SENT"));
      } catch {
        // Marginalanalys-banner ovan täcker redan "ej ansluten"-fallet.
      }
    })();
  }, []);

  async function draftSms(quoteId: string) {
    setDrafting(quoteId);
    setDraftError((prev) => ({ ...prev, [quoteId]: "" }));
    try {
      const res = await fetch("/api/ai/followup-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDraftError((prev) => ({ ...prev, [quoteId]: data.error ?? "Något gick fel." }));
        return;
      }
      setDraftText((prev) => ({ ...prev, [quoteId]: data.text }));
    } catch {
      setDraftError((prev) => ({ ...prev, [quoteId]: "Något gick fel — kontrollera anslutningen." }));
    } finally {
      setDrafting(null);
    }
  }

  async function copy(quoteId: string) {
    try {
      await navigator.clipboard.writeText(draftText[quoteId] ?? "");
      setCopiedId(quoteId);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard access denied — the textarea below is still selectable/copyable manually.
    }
  }

  return (
    <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div>
          <p className="text-lg font-semibold tracking-tight sm:text-xl">AI Studio</p>
          <p className="text-sm text-ink-muted">Marginalanalys och uppföljning — riktiga siffror, inga påhittade.</p>
        </div>

        {!connected && (
          <Card className="flex items-start gap-3 border-warning/30 bg-warning/[0.05]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-sm text-ink-muted">
              Databasen är inte ansluten — lägg till <code className="rounded bg-white/5 px-1 py-0.5">DATABASE_URL</code>{" "}
              för att se marginalanalys.
            </p>
          </Card>
        )}

        {connected && summary && (
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <CardTitle>Marginalanalys</CardTitle>
            </div>

            {summary.totalQuotes === 0 ? (
              <p className="text-sm text-ink-muted">Inga offerter sparade än — analysen fylls i när ni har historik.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-2/40 p-3">
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <Send className="size-3.5" />
                      <span className="text-[11px] font-medium uppercase tracking-wide">Vinstprocent</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-ink">
                      {summary.winRatePct === null ? "–" : `${summary.winRatePct}%`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-2/40 p-3">
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <Percent className="size-3.5" />
                      <span className="text-[11px] font-medium uppercase tracking-wide">Snittpåslag (vunna)</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-ink">
                      {summary.avgMarkupPct === null ? "–" : `${summary.avgMarkupPct}%`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-2/40 p-3">
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <Wallet className="size-3.5" />
                      <span className="text-[11px] font-medium uppercase tracking-wide">Snittvärde (vunna)</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-ink">
                      {summary.avgQuoteValueSEK === null ? "–" : fmt(summary.avgQuoteValueSEK)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-2/40 p-3">
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <TrendingUp className="size-3.5" />
                      <span className="text-[11px] font-medium uppercase tracking-wide">Pipeline (skickade)</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-ink">{fmt(summary.pipelineValueSEK)}</span>
                  </div>
                </div>
                <p className="text-xs text-ink-muted">
                  {summary.totalQuotes} offerter totalt · {summary.countByStatus.ACCEPTED} vunna ·{" "}
                  {summary.countByStatus.DECLINED} avslagna · {summary.countByStatus.SENT} väntar på svar
                </p>
              </>
            )}
          </Card>
        )}

        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-4 text-primary" />
            <CardTitle>Uppföljnings-SMS</CardTitle>
          </div>

          {sentQuotes.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Inga offerter väntar på svar just nu — de dyker upp här så fort en offert har status &quot;Skickad&quot;.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {sentQuotes.map((q) => (
                <div key={q.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{q.jobTitle}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {q.number} · {q.customer.name}
                      </p>
                    </div>
                    <Button
                      size="default"
                      variant="outline"
                      onClick={() => draftSms(q.id)}
                      disabled={drafting === q.id}
                    >
                      <Sparkles className="size-4" />
                      {drafting === q.id ? "Skriver…" : "Generera SMS"}
                    </Button>
                  </div>
                  {draftError[q.id] && <p className="text-sm text-danger">{draftError[q.id]}</p>}
                  {draftText[q.id] && (
                    <div className="flex items-start gap-2 rounded-lg border border-border bg-surface/60 p-3">
                      <p className="flex-1 text-sm text-ink-secondary">{draftText[q.id]}</p>
                      <button
                        onClick={() => copy(q.id)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-white/5 hover:text-ink"
                        aria-label="Kopiera"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      {copiedId === q.id && <span className="text-xs text-success">Kopierat!</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
