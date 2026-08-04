"use client";

import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_TIER_QUOTE_LIMIT } from "@/lib/freemium";

const FREE_FEATURES = [
  `Max ${FREE_TIER_QUOTE_LIMIT} offerter per månad`,
  "PDF med diskret vattenstämpel",
  "Grundläggande ROT-beräkning (30%)",
  "Företagsprofil + röstinmatning + PDF-export",
];

const PRO_FEATURES = [
  "Obegränsade offerter",
  "Automatiska marginalvarningar vid dyra material",
  "Ingen vattenstämpel på PDF",
  "Full offerthistorik + status (utkast/skickad/accepterad/nekad)",
  "Kundregister & SMS/länk-accept",
];

export function UpgradeModal({
  open,
  onClose,
  reason = "manual",
}: {
  open: boolean;
  onClose: () => void;
  reason?: "limit" | "manual";
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="glass-strong relative w-full max-w-2xl rounded-3xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-xl text-ink-muted hover:bg-white/5 hover:text-ink"
          aria-label="Stäng"
        >
          <X className="size-4" />
        </button>

        <div className="mb-6 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink">
              {reason === "limit" ? "Du har nått gränsen för gratisplanen" : "Uppgradera till OffertPro Pro"}
            </p>
            <p className="text-sm text-ink-muted">
              {reason === "limit"
                ? `Du har skapat ${FREE_TIER_QUOTE_LIMIT} offerter denna månad — uppgradera för att fortsätta.`
                : "Obegränsade offerter, ingen vattenstämpel och fullt kundregister."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2/40 p-5">
            <div>
              <p className="text-sm font-semibold text-ink">Free</p>
              <p className="text-xs text-ink-muted">0 kr</p>
            </div>
            <ul className="flex flex-col gap-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-ink-secondary">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-ink-muted" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-primary/[0.06] p-5 shadow-glow-sm">
            <div>
              <p className="text-sm font-semibold text-primary">Pro</p>
              <p className="text-xs text-ink-muted">499–699 kr/mån</p>
            </div>
            <ul className="flex flex-col gap-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-ink">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href="mailto:hej@offertpro.se?subject=Uppgradera%20till%20OffertPro%20Pro"
            className="flex-1"
          >
            <Button size="lg" className="w-full">
              <Sparkles className="size-4" />
              Uppgradera till Pro
            </Button>
          </a>
          <Button size="lg" variant="ghost" onClick={onClose}>
            Fortsätt med Free
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-ink-muted">
          Ingen självbetjäningskassa kopplad än — mejla oss så aktiverar vi Pro manuellt.
        </p>
      </div>
    </div>
  );
}
