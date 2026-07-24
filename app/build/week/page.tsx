"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarRange, Tag } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { buildWeeklyPlan } from "@/lib/cart-engine";
import { EASE, fadeUp } from "@/lib/motion";
import { recordList } from "@/lib/storage";
import { formatSEK, todayKey } from "@/lib/utils";

/**
 * "Veckoplanering" — the AI has already scanned every grocery store's
 * price and campaign state for today (the same deterministic engine
 * every cart is built from) and assembled the week's cheapest believable
 * shopping list, with at least one deal per aisle.
 */
export default function WeekPlanPage() {
  const router = useRouter();
  const plan = useMemo(() => buildWeeklyPlan(todayKey()), []);

  const totalNaiveSEK = plan.reduce((sum, i) => sum + i.naivePriceSEK, 0);
  const totalPriceSEK = plan.reduce((sum, i) => sum + i.priceSEK, 0);
  const totalSavingsSEK = Math.max(0, totalNaiveSEK - totalPriceSEK);

  const handleUse = () => {
    recordList(plan.map((i) => i.displayName));
    router.push("/cart");
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-6 py-10 sm:py-14">
      <AmbientBackground />

      <Link
        href="/build"
        className="absolute left-6 top-6 z-10 flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Bygg listan själv
      </Link>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        <motion.div {...fadeUp(0)} className="text-center">
          <p className="mb-2 flex items-center justify-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <CalendarRange className="size-3.5" />
            AI Veckoplanering
          </p>
          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">
            Veckans billigaste
          </h1>
          <p className="mt-3 text-ink-secondary">
            AI har scannat ICA, Willys, Coop, Lidl och fler efter dagens kampanjer och
            byggt en hel veckas matkasse av det som är billigast just nu.
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="mt-6">
          <Card className="flex flex-col gap-5">
            <div className="flex items-end justify-between gap-4">
              <CardTitle>{plan.length} varor för veckan</CardTitle>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold tracking-tight text-ink">
                  {formatSEK(totalPriceSEK)}
                </p>
                <p className="text-xs font-medium text-success">
                  Du sparar {formatSEK(totalSavingsSEK)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {plan.map((item, i) => (
                <motion.div
                  key={item.catalogId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.04 * i, ease: EASE }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{item.displayName}</p>
                    <p className="text-xs text-ink-muted">
                      {item.category} · {item.storeName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.onCampaign && (
                      <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                        <Tag className="size-2.5" />
                        Kampanj
                      </span>
                    )}
                    <span className="font-mono text-sm text-ink-secondary">
                      {item.priceSEK} kr
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button size="xl" className="w-full" onClick={handleUse}>
              Lägg allt i matkassen
              <ArrowRight />
            </Button>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
