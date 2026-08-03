"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ROT_DEDUCTION_RATE, VAT_RATE } from "@/lib/types";

type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED";

type QuoteDetail = {
  id: string;
  number: string;
  jobTitle: string;
  status: QuoteStatus;
  laborHours: number;
  hourlyRateSEK: number;
  materialMarkupPct: number;
  includeRot: boolean;
  createdAt: string;
  customer: { name: string; address: string; phone: string; email: string };
  lineItems: { id: string; description: string; qty: number; unitLabel: string; unitPriceSEK: number }[];
};

const STATUS_LABEL: Record<QuoteStatus, string> = {
  DRAFT: "Utkast",
  SENT: "Skickad",
  ACCEPTED: "Vunnen",
  DECLINED: "Avslagen",
};

function fmt(n: number): string {
  return `${Math.round(n).toLocaleString("sv-SE")} kr`;
}

export default function OfferDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/quotes/${params.id}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setQuote(data.quote);
    } catch {
      setNotFound(true);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function setStatus(status: QuoteStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/quotes/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuote(data.quote);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function remove() {
    if (!confirm("Ta bort offerten? Det går inte att ångra.")) return;
    await fetch(`/api/quotes/${params.id}`, { method: "DELETE" });
    router.push("/offers");
  }

  if (notFound) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
        <AmbientBackground />
        <Card className="flex max-w-md flex-col items-center gap-3 text-center">
          <AlertTriangle className="size-6 text-warning" />
          <CardTitle>Offerten hittades inte</CardTitle>
          <p className="text-sm text-ink-muted">
            Antingen finns den inte, eller så är databasen inte ansluten (<code>DATABASE_URL</code> saknas).
          </p>
          <Button onClick={() => router.push("/offers")}>
            <ArrowLeft className="size-4" />
            Till offerter
          </Button>
        </Card>
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
        <AmbientBackground />
      </main>
    );
  }

  const materialCostSEK = quote.lineItems.reduce((sum, li) => sum + li.unitPriceSEK * li.qty, 0);
  const materialWithMarkupSEK = materialCostSEK * (1 + quote.materialMarkupPct / 100);
  const laborCostSEK = quote.laborHours * quote.hourlyRateSEK;
  const subtotalExclVatSEK = materialWithMarkupSEK + laborCostSEK;
  const vatSEK = subtotalExclVatSEK * VAT_RATE;
  const rotDeductionSEK = quote.includeRot ? laborCostSEK * ROT_DEDUCTION_RATE : 0;
  const totalAfterRotSEK = subtotalExclVatSEK + vatSEK - rotDeductionSEK;

  return (
    <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <button
          onClick={() => router.push("/offers")}
          className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Offerter
        </button>

        <Card className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs text-ink-muted">{quote.number}</span>
              <h1 className="text-lg font-semibold text-ink">{quote.jobTitle}</h1>
              <p className="text-sm text-ink-muted">{quote.customer.name}</p>
            </div>
            <button
              onClick={remove}
              className="flex size-9 items-center justify-center rounded-xl text-ink-muted hover:bg-danger/10 hover:text-danger"
              aria-label="Ta bort"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["DRAFT", "SENT", "ACCEPTED", "DECLINED"] as QuoteStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                disabled={updating}
                onClick={() => setStatus(s)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                  quote.status === s
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-surface-2/50 text-ink-secondary hover:border-white/20"
                }`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <CardTitle>Prisbild</CardTitle>

          <div className="flex flex-col gap-1.5">
            {quote.lineItems.map((li) => (
              <div key={li.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary">
                  {li.description} ({li.qty} {li.unitLabel})
                </span>
                <span className="font-mono text-ink">{fmt(li.unitPriceSEK * li.qty)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Material (inkl. {quote.materialMarkupPct}% påslag)</span>
              <span className="font-mono text-ink">{fmt(materialWithMarkupSEK)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">
                Arbetstid ({quote.laborHours.toFixed(1)} h × {quote.hourlyRateSEK} kr)
              </span>
              <span className="font-mono text-ink">{fmt(laborCostSEK)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Moms (25%)</span>
              <span className="font-mono text-ink">{fmt(vatSEK)}</span>
            </div>
            {quote.includeRot && (
              <div className="flex items-center justify-between text-success">
                <span>ROT-avdrag (30% av arbetskostnad)</span>
                <span className="font-mono">-{fmt(rotDeductionSEK)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-ink">Att fakturera kunden</span>
            <span className="font-mono text-2xl font-bold text-ink">{fmt(totalAfterRotSEK)}</span>
          </div>
        </Card>
      </div>
    </main>
  );
}
