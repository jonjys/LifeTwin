"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChefHat, Tag } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { MultiChipGroup } from "@/components/profile/fields";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { buildCart, MEAL_OPTIONS } from "@/lib/cart-engine";
import { EASE, fadeUp } from "@/lib/motion";
import { recordList } from "@/lib/storage";
import { formatSEK, todayKey } from "@/lib/utils";

/**
 * "AI Meal Planner" — pick what you want to eat this week, and the same
 * engine that expands "tacos" into tacokrydda/tortilla/köttfärs/ost/salsa
 * on /build (see MEAL_EXPANSIONS) expands every meal at once into one
 * aggregated, already-optimized shopping list.
 */
export default function MealPlannerPage() {
  const router = useRouter();
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);

  const cart = useMemo(
    () => (selectedMeals.length > 0 ? buildCart(selectedMeals, todayKey(), []) : null),
    [selectedMeals]
  );

  const handleUse = () => {
    if (selectedMeals.length === 0) return;
    recordList(selectedMeals);
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
            <ChefHat className="size-3.5" />
            AI Meal Planner
          </p>
          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">
            Vad vill du äta i veckan?
          </h1>
          <p className="mt-3 text-ink-secondary">
            Välj måltider — AI räknar ut ingredienserna och bygger en optimerad
            inköpslista av alla på en gång.
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="mt-6">
          <Card className="flex flex-col gap-5">
            <MultiChipGroup options={MEAL_OPTIONS} values={selectedMeals} onChange={setSelectedMeals} />

            {cart && cart.items.length > 0 && (
              <>
                <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
                  <CardTitle>{cart.items.length} ingredienser</CardTitle>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-bold tracking-tight text-ink">
                      {formatSEK(cart.totalOptimizedSEK)}
                    </p>
                    {cart.totalSavingsSEK > 0 && (
                      <p className="text-xs font-medium text-success">
                        Du sparar {formatSEK(cart.totalSavingsSEK)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {cart.items.map((item, i) => (
                    <motion.div
                      key={`${item.catalogId}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.04 * i, ease: EASE }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-2.5"
                    >
                      <p className="truncate text-sm font-medium text-ink">{item.displayName}</p>
                      <div className="flex shrink-0 items-center gap-2">
                        {item.chosen.onCampaign && (
                          <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                            <Tag className="size-2.5" />
                            Kampanj
                          </span>
                        )}
                        <span className="font-mono text-sm text-ink-secondary">
                          {formatSEK(item.chosen.priceSEK)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            <Button size="xl" className="w-full" onClick={handleUse} disabled={selectedMeals.length === 0}>
              Lägg allt i matkassen
              <ArrowRight />
            </Button>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
