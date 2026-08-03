"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { FieldLabel, SingleChipGroup, YesNoToggle } from "@/components/profile/fields";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import type { MaterialItem } from "@/lib/quote-engine/material";
import { computeQuoteTotals, estimateProject, PROJECT_TYPES, type ProjectType } from "@/lib/quote-engine/estimate";
import { fadeUp } from "@/lib/motion";

const TIER_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "premium", label: "Premium" },
] as const;

/**
 * "Bygg om /calculator/page.tsx till en AI-Kalkylator" — one calculator,
 * every Bygg-projekttyp OffertPro can quantify today. Reuses the exact
 * same pure math the standalone kalkylatorer already proved (real
 * quantities from real dimensions) — just without a retail store to
 * check out from. Output is a real prisbild: material + påslag +
 * arbetstid × timpris + moms + ROT-avdrag, the same breakdown every
 * offert will eventually use.
 */
export default function CalculatorPage() {
  const [type, setType] = useState<ProjectType>("innervagg");
  const [widthM, setWidthM] = useState(3.6);
  const [heightM, setHeightM] = useState(2.3);
  const [areaM2, setAreaM2] = useState(25);
  const [toggleA, setToggleA] = useState(true);
  const [toggleB, setToggleB] = useState(false);
  const [tier, setTier] = useState<"budget" | "premium">("budget");
  const [hourlyRateSEK, setHourlyRateSEK] = useState(650);
  const [markupPct, setMarkupPct] = useState(15);
  const [includeRot, setIncludeRot] = useState(true);
  const [calculated, setCalculated] = useState(false);

  const { materials, laborHours, toggleALabel, toggleBLabel, usesArea, usesToggleB } = useMemo(
    () => estimateProject({ type, widthM, heightM, areaM2, toggleA, toggleB, tier }),
    [type, widthM, heightM, areaM2, toggleA, toggleB, tier]
  );

  const totals = useMemo(
    () => computeQuoteTotals({ materials, laborHours, hourlyRateSEK, markupPct, includeRot }),
    [materials, laborHours, hourlyRateSEK, markupPct, includeRot]
  );

  const fmt = (n: number) => `${Math.round(n).toLocaleString("sv-SE")} kr`;

  return (
    <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <motion.div {...fadeUp(0)}>
          <p className="text-lg font-semibold tracking-tight sm:text-xl">AI-Kalkylator</p>
          <p className="text-sm text-ink-muted">Mått + några frågor in — material, arbetstid, ROT och pris ut.</p>
        </motion.div>

        <motion.div {...fadeUp(0.05)}>
          <Card className="flex flex-col gap-5">
            <div>
              <FieldLabel>Projekttyp</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {PROJECT_TYPES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setType(p.value);
                      setCalculated(false);
                    }}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      type === p.value
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-surface-2/50 text-ink-secondary hover:border-white/20"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {usesArea ? (
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                  Yta (m²)
                </label>
                <input
                  type="number"
                  min={1}
                  value={areaM2}
                  onChange={(e) => setAreaM2(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-base text-ink focus:border-primary/40 focus:outline-none"
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                    Bredd (m)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.1}
                    value={widthM}
                    onChange={(e) => setWidthM(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-base text-ink focus:border-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                    {type === "golv" ? "Längd (m)" : "Höjd (m)"}
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.1}
                    value={heightM}
                    onChange={(e) => setHeightM(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-base text-ink focus:border-primary/40 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {toggleALabel && (
              <div>
                <FieldLabel>{toggleALabel}</FieldLabel>
                <YesNoToggle value={toggleA} onChange={setToggleA} />
              </div>
            )}
            {usesToggleB && toggleBLabel && (
              <div>
                <FieldLabel>{toggleBLabel}</FieldLabel>
                <YesNoToggle value={toggleB} onChange={setToggleB} />
              </div>
            )}

            <div>
              <FieldLabel>Premium eller budget?</FieldLabel>
              <SingleChipGroup
                options={TIER_OPTIONS}
                value={tier}
                onChange={(v) => setTier(v as "budget" | "premium")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                  Timpris (kr)
                </label>
                <input
                  type="number"
                  min={0}
                  value={hourlyRateSEK}
                  onChange={(e) => setHourlyRateSEK(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-base text-ink focus:border-primary/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                  Materialpåslag (%)
                </label>
                <input
                  type="number"
                  min={0}
                  value={markupPct}
                  onChange={(e) => setMarkupPct(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-base text-ink focus:border-primary/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Inkludera ROT-avdrag (30% av arbetskostnad)?</FieldLabel>
              <YesNoToggle value={includeRot} onChange={setIncludeRot} />
            </div>

            <Button size="xl" onClick={() => setCalculated(true)}>
              <Calculator />
              Räkna ut offert
            </Button>
          </Card>
        </motion.div>

        {calculated && (
          <motion.div {...fadeUp(0.05)}>
            <Card className="flex flex-col gap-4">
              <CardTitle>Prisbild</CardTitle>

              <div className="flex flex-col gap-1.5">
                {materials.map((m: MaterialItem) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-ink-secondary">{m.displayName}</span>
                    <span className="font-mono text-ink">{fmt(m.basePriceSEK)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Material (inkl. {markupPct}% påslag)</span>
                  <span className="font-mono text-ink">{fmt(totals.materialWithMarkupSEK)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">
                    Arbetstid ({laborHours.toFixed(1)} h × {hourlyRateSEK} kr)
                  </span>
                  <span className="font-mono text-ink">{fmt(totals.laborCostSEK)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Moms (25%)</span>
                  <span className="font-mono text-ink">{fmt(totals.vatSEK)}</span>
                </div>
                {includeRot && (
                  <div className="flex items-center justify-between text-success">
                    <span>ROT-avdrag (30% av arbetskostnad)</span>
                    <span className="font-mono">-{fmt(totals.rotDeductionSEK)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold text-ink">Att fakturera kunden</span>
                <span className="font-mono text-2xl font-bold text-ink">{fmt(totals.totalAfterRotSEK)}</span>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}
