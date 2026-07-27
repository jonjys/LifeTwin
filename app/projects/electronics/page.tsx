"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Tag, Tv } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { FieldLabel, SingleChipGroup, YesNoToggle } from "@/components/profile/fields";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { scanCatalogForDeals, storesForDomain } from "@/lib/cart-engine";
import {
  generateElectronicsCatalog,
  tvItemId,
  TV_SIZE_OPTIONS,
  type TvSizeInch,
} from "@/lib/cart-engine/electronics-catalog";
import { EASE, fadeUp } from "@/lib/motion";
import { startElectronicsProject } from "@/lib/storage";
import { formatSEK, todayKey } from "@/lib/utils";

const ELECTRONICS_STORES = storesForDomain("electronics");
const FULL_CATALOG = generateElectronicsCatalog();
const SIZE_OPTIONS = TV_SIZE_OPTIONS.map((size) => ({ value: String(size), label: `${size}"` }));
/** Purely a pace for the store-by-store reveal below — the scan itself
 *  is instant and synchronous, this just lets you see it happen. */
const SCAN_STEP_MS = 220;

export default function ElectronicsProjectPage() {
  const router = useRouter();
  const [sizeInch, setSizeInch] = useState<TvSizeInch>(55);
  const [wantsSoundbar, setWantsSoundbar] = useState(false);
  const [wantsWallMount, setWantsWallMount] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);

  const selectedIds = useMemo(
    () => [
      tvItemId(sizeInch),
      "hdmi-kabel",
      ...(wantsWallMount ? ["vaggfaste"] : []),
      ...(wantsSoundbar ? ["soundbar"] : []),
    ],
    [sizeInch, wantsSoundbar, wantsWallMount]
  );

  const items = useMemo(
    () => (planGenerated ? FULL_CATALOG.filter((item) => selectedIds.includes(item.id)) : []),
    [planGenerated, selectedIds]
  );

  const deals = useMemo(() => (planGenerated ? scanCatalogForDeals(items, todayKey()) : []), [
    planGenerated,
    items,
  ]);

  const scanning = planGenerated && scannedCount < ELECTRONICS_STORES.length;
  const totalSEK = deals.reduce((sum, d) => sum + d.priceSEK, 0);
  const totalNaiveSEK = deals.reduce((sum, d) => sum + d.naivePriceSEK, 0);
  const totalSavingsSEK = Math.max(0, totalNaiveSEK - totalSEK);

  useEffect(() => {
    if (!planGenerated) {
      setScannedCount(0);
      return;
    }
    setScannedCount(0);
    const timers = ELECTRONICS_STORES.map((_, i) =>
      setTimeout(() => setScannedCount(i + 1), SCAN_STEP_MS * (i + 1))
    );
    return () => timers.forEach(clearTimeout);
  }, [planGenerated, selectedIds]);

  const handleContinue = () => {
    startElectronicsProject(sizeInch, wantsSoundbar, wantsWallMount);
    router.push("/cart");
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-6 py-10 sm:py-14">
      <AmbientBackground />

      <Link
        href="/projects"
        className="absolute left-6 top-6 z-10 flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Alla projekt
      </Link>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        <motion.div {...fadeUp(0)} className="text-center">
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {planGenerated ? "Flik 2 — AI Plan" : "Flik 1 — Projekt"}
          </p>
          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">Elektronik</h1>
          <p className="mt-3 text-ink-secondary">
            {planGenerated
              ? "AI har brutit ner projektet i vad du faktiskt behöver."
              : "Vilken TV? AI räknar ut tillbehören och var allt är billigast."}
          </p>
        </motion.div>

        {!planGenerated ? (
          <motion.div {...fadeUp(0.1)} className="mt-6">
            <Card className="flex flex-col gap-5">
              <div>
                <FieldLabel>Skärmstorlek</FieldLabel>
                <SingleChipGroup
                  options={SIZE_OPTIONS}
                  value={String(sizeInch)}
                  onChange={(v) => setSizeInch(Number(v) as TvSizeInch)}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel>Vill du ha soundbar?</FieldLabel>
                  <YesNoToggle value={wantsSoundbar} onChange={setWantsSoundbar} />
                </div>
                <div>
                  <FieldLabel>Vill du ha väggfäste?</FieldLabel>
                  <YesNoToggle value={wantsWallMount} onChange={setWantsWallMount} />
                </div>
              </div>
              <Button size="xl" onClick={() => setPlanGenerated(true)}>
                <Tv />
                Skapa AI-plan
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div {...fadeUp(0.1)} className="mt-6">
            <Card className="flex flex-col gap-5">
              <div className="flex items-end justify-between gap-4">
                <CardTitle>TV {sizeInch}&quot;</CardTitle>
                {!scanning && (
                  <div className="text-right">
                    <span className="font-mono text-2xl font-bold tracking-tight text-ink">
                      {formatSEK(totalSEK)}
                    </span>
                    {totalSavingsSEK > 0 && (
                      <p className="text-xs font-medium text-success">
                        Du sparar {formatSEK(totalSavingsSEK)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ELECTRONICS_STORES.map((store, i) => (
                  <motion.span
                    key={store.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: i < scannedCount ? 1 : 0.25, scale: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="rounded-full border border-border bg-surface-2/50 px-2.5 py-1 text-[11px] font-medium text-ink-muted"
                  >
                    {i < scannedCount ? "✓ " : ""}
                    {store.name}
                  </motion.span>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {scanning ? (
                  <motion.p
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-ink-muted"
                  >
                    AI scannar butiker efter dagens priser…
                  </motion.p>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-2"
                  >
                    {deals.map((deal, i) => (
                      <motion.div
                        key={deal.catalogId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.05 * i, ease: EASE }}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{deal.displayName}</p>
                          <p className="truncate text-xs text-ink-muted">{deal.storeName}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {deal.onCampaign && (
                            <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                              <Tag className="size-2.5" />
                              Kampanj
                            </span>
                          )}
                          <span className="font-mono text-sm text-ink-secondary">
                            {formatSEK(deal.priceSEK)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button size="xl" className="w-full" onClick={handleContinue} disabled={scanning}>
                Fortsätt till inköp
                <ArrowRight />
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}
