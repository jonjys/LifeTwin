"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Database, Mic, Plus, Save } from "lucide-react";
import { FieldLabel, NumericInput, SingleChipGroup, TextField, YesNoToggle } from "@/components/profile/fields";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useSpeechInput } from "@/lib/use-speech-input";
import { computeQuoteTotals, estimateProject, PROJECT_TYPES, type ProjectType } from "@/lib/quote-engine/estimate";
import { applyMaterialBankPricing } from "@/lib/quote-engine/materialbank-pricing";
import { useMaterialBankPrices } from "@/lib/quote-engine/use-material-bank";
import { fadeUp } from "@/lib/motion";
import type { Customer } from "@/lib/types";

const TIER_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "premium", label: "Premium" },
] as const;

function fmt(n: number): string {
  return `${Math.round(n).toLocaleString("sv-SE")} kr`;
}

/**
 * The 1-3-click Offert-wizard: pick a customer, describe the jobb (text or
 * voice), let the same AI-kalkylator engine that powers /calculator quantify
 * material + arbetstid, adjust timpris/påslag/ROT, then save as a real Quote.
 */
export default function NewOfferPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [connected, setConnected] = useState(true);
  const [customerId, setCustomerId] = useState<string>("");
  const [quickCustomerName, setQuickCustomerName] = useState("");
  const [addingCustomer, setAddingCustomer] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { supported: speechSupported, listening, start: startListening } = useSpeechInput((text) => {
    setJobTitle((prev) => (prev ? `${prev} ${text}` : text));
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) {
          setConnected(false);
          return;
        }
        const data = await res.json();
        setConnected(true);
        setCustomers(data.customers ?? []);
      } catch {
        setConnected(false);
      }
    })();
    (async () => {
      try {
        const res = await fetch("/api/company");
        if (!res.ok) return;
        const data = await res.json();
        setHourlyRateSEK(data.company.defaultHourlyRateSEK);
        setMarkupPct(data.company.defaultMarkupPct);
      } catch {
        // Keep the built-in defaults (650 kr, 15%) if the company profile isn't reachable.
      }
    })();
  }, []);

  const { materials: simulatedMaterials, laborHours, toggleALabel, toggleBLabel, usesArea, usesToggleB } = useMemo(
    () => estimateProject({ type, widthM, heightM, areaM2, toggleA, toggleB, tier }),
    [type, widthM, heightM, areaM2, toggleA, toggleB, tier]
  );

  const bankPrices = useMaterialBankPrices();
  const materials = useMemo(
    () => applyMaterialBankPricing(simulatedMaterials, bankPrices),
    [simulatedMaterials, bankPrices]
  );

  const totals = useMemo(
    () => computeQuoteTotals({ materials, laborHours, hourlyRateSEK, markupPct, includeRot }),
    [materials, laborHours, hourlyRateSEK, markupPct, includeRot]
  );

  async function addQuickCustomer() {
    const name = quickCustomerName.trim();
    if (!name) return;
    setAddingCustomer(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers((prev) => [data.customer, ...prev]);
        setCustomerId(data.customer.id);
        setQuickCustomerName("");
      }
    } finally {
      setAddingCustomer(false);
    }
  }

  async function save() {
    setError(null);
    if (!customerId) {
      setError("Välj eller lägg till en kund först.");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Beskriv jobbet i en rubrik.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          jobTitle: jobTitle.trim(),
          laborHours,
          hourlyRateSEK,
          materialMarkupPct: markupPct,
          includeRot,
          lineItems: materials.map((m) => ({
            description: m.displayName,
            qty: m.qty,
            unitLabel: m.unitLabel,
            unitPriceSEK: m.unitPriceSEK,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Något gick fel.");
        return;
      }
      router.push(`/offers/${data.quote.id}`);
    } catch {
      setError("Något gick fel — kontrollera anslutningen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <motion.div {...fadeUp(0)}>
          <p className="text-lg font-semibold tracking-tight sm:text-xl">Ny offert</p>
          <p className="text-sm text-ink-muted">Kund → jobb → AI räknar → justera → spara.</p>
        </motion.div>

        {!connected && (
          <Card className="flex items-start gap-3 border-warning/30 bg-warning/[0.05]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-sm text-ink-muted">
              Databasen är inte ansluten — lägg till <code className="rounded bg-white/5 px-1 py-0.5">DATABASE_URL</code>{" "}
              för att kunna spara offerter.
            </p>
          </Card>
        )}

        <motion.div {...fadeUp(0.05)}>
          <Card className="flex flex-col gap-4">
            <FieldLabel>1. Kund</FieldLabel>
            {customers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCustomerId(c.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      customerId === c.id
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-surface-2/50 text-ink-secondary hover:border-white/20"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1">
                <TextField value={quickCustomerName} onChange={setQuickCustomerName} placeholder="Ny kund — namn" />
              </div>
              <Button variant="outline" onClick={addQuickCustomer} disabled={addingCustomer || !quickCustomerName.trim()}>
                <Plus className="size-4" />
                Lägg till
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeUp(0.1)}>
          <Card className="flex flex-col gap-5">
            <div>
              <FieldLabel>2. Jobbet</FieldLabel>
              <div className="flex gap-2">
                <div className="flex-1">
                  <TextField
                    value={jobTitle}
                    onChange={setJobTitle}
                    placeholder="T.ex. Måla villa 180 kvm åt Johan på Storgatan 45"
                  />
                </div>
                {speechSupported && (
                  <button
                    type="button"
                    onClick={startListening}
                    aria-label="Tala in jobbet"
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      listening
                        ? "border-danger/40 bg-danger/10 text-danger"
                        : "border-border bg-surface-2/50 text-ink-secondary hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    <Mic className="size-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <FieldLabel>Projekttyp</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {PROJECT_TYPES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setType(p.value)}
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
                <NumericInput value={areaM2} onChange={setAreaM2} min={1} />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                    Bredd (m)
                  </label>
                  <NumericInput value={widthM} onChange={setWidthM} min={0.5} step={0.1} />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                    {type === "golv" ? "Längd (m)" : "Höjd (m)"}
                  </label>
                  <NumericInput value={heightM} onChange={setHeightM} min={0.5} step={0.1} />
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
              <SingleChipGroup options={TIER_OPTIONS} value={tier} onChange={(v) => setTier(v as "budget" | "premium")} />
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeUp(0.15)}>
          <Card className="flex flex-col gap-4">
            <FieldLabel>3. Justera</FieldLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                  Timpris (kr)
                </label>
                <NumericInput value={hourlyRateSEK} onChange={setHourlyRateSEK} min={0} />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                  Materialpåslag (%)
                </label>
                <NumericInput value={markupPct} onChange={setMarkupPct} min={0} />
              </div>
            </div>
            <div>
              <FieldLabel>Inkludera ROT-avdrag (30% av arbetskostnad)?</FieldLabel>
              <YesNoToggle value={includeRot} onChange={setIncludeRot} />
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeUp(0.2)}>
          <Card className="flex flex-col gap-4">
            <CardTitle>4. Förhandsgranska</CardTitle>

            <div className="flex flex-col gap-1.5">
              {materials.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-ink-secondary">
                    {m.displayName}
                    {m.sourcedFromBank && (
                      <span
                        title="Pris från din materialbank"
                        className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                      >
                        <Database className="size-2.5" />
                        Din prisbank
                      </span>
                    )}
                  </span>
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

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button size="xl" onClick={save} disabled={saving || !connected}>
              <Save className="size-4" />
              {saving ? "Sparar…" : "Spara offert"}
            </Button>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
