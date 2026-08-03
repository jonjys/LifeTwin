"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Receipt } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ROT_DEDUCTION_RATE, VAT_RATE } from "@/lib/types";

type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED";

type QuoteListItem = {
  id: string;
  number: string;
  jobTitle: string;
  status: QuoteStatus;
  laborHours: number;
  hourlyRateSEK: number;
  materialMarkupPct: number;
  includeRot: boolean;
  createdAt: string;
  customer: { name: string };
  lineItems: { unitPriceSEK: number; qty: number }[];
};

const STATUS_LABEL: Record<QuoteStatus, string> = {
  DRAFT: "Utkast",
  SENT: "Skickad",
  ACCEPTED: "Vunnen",
  DECLINED: "Avslagen",
};

const STATUS_CLASS: Record<QuoteStatus, string> = {
  DRAFT: "border-border bg-surface-2/50 text-ink-muted",
  SENT: "border-primary/40 bg-primary/10 text-primary",
  ACCEPTED: "border-success/40 bg-success/10 text-success",
  DECLINED: "border-danger/40 bg-danger/10 text-danger",
};

function fmt(n: number): string {
  return `${Math.round(n).toLocaleString("sv-SE")} kr`;
}

/** Same prisbild formula as lib/quote-engine/estimate.ts's computeQuoteTotals,
 *  just fed already-saved line item totals instead of a live MaterialItem[]. */
function quoteTotal(q: QuoteListItem): number {
  const materialCostSEK = q.lineItems.reduce((sum, li) => sum + li.unitPriceSEK * li.qty, 0);
  const materialWithMarkupSEK = materialCostSEK * (1 + q.materialMarkupPct / 100);
  const laborCostSEK = q.laborHours * q.hourlyRateSEK;
  const subtotalExclVatSEK = materialWithMarkupSEK + laborCostSEK;
  const vatSEK = subtotalExclVatSEK * VAT_RATE;
  const rotDeductionSEK = q.includeRot ? laborCostSEK * ROT_DEDUCTION_RATE : 0;
  return Math.round(subtotalExclVatSEK + vatSEK - rotDeductionSEK);
}

export default function OffersPage() {
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/quotes");
        if (!res.ok) {
          setConnected(false);
          return;
        }
        const data = await res.json();
        setConnected(true);
        setQuotes(data.quotes ?? []);
      } catch {
        setConnected(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight sm:text-xl">Offerter</p>
            <p className="text-sm text-ink-muted">Från jobbeskrivning till pris på minuter.</p>
          </div>
          {connected && (
            <Link href="/offers/new">
              <Button>
                <Plus className="size-4" />
                Ny offert
              </Button>
            </Link>
          )}
        </div>

        {!connected && !loading && (
          <Card className="flex items-start gap-3 border-warning/30 bg-warning/[0.05]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-ink">Databasen är inte ansluten än</p>
              <p className="text-xs text-ink-muted">
                Lägg till <code className="rounded bg-white/5 px-1 py-0.5">DATABASE_URL</code> och kör{" "}
                <code className="rounded bg-white/5 px-1 py-0.5">npm run db:push</code> för att kunna skapa offerter.
              </p>
            </div>
          </Card>
        )}

        {!loading && connected && quotes.length === 0 && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-ink-secondary">
              <Receipt className="size-6" />
            </div>
            <CardTitle>Inga offerter än</CardTitle>
            <p className="text-sm text-ink-muted">Skapa din första offert på under en minut.</p>
            <Link href="/offers/new">
              <Button>
                <Plus className="size-4" />
                Ny offert
              </Button>
            </Link>
          </Card>
        )}

        {quotes.length > 0 && (
          <div className="flex flex-col gap-2">
            {quotes.map((q) => (
              <Link key={q.id} href={`/offers/${q.id}`}>
                <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-primary/30">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ink-muted">{q.number}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[q.status]}`}
                      >
                        {STATUS_LABEL[q.status]}
                      </span>
                    </div>
                    <p className="truncate text-sm font-medium text-ink">{q.jobTitle}</p>
                    <p className="truncate text-xs text-ink-muted">{q.customer.name}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-ink">{fmt(quoteTotal(q))}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
