"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Hammer, Ruler } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { generateDeckMaterialsCatalog } from "@/lib/cart-engine/materials-catalog";
import { EASE, fadeUp } from "@/lib/motion";
import { startDeckProject } from "@/lib/storage";
import { formatSEK } from "@/lib/utils";

export default function DeckProjectPage() {
  const router = useRouter();
  const [widthM, setWidthM] = useState(4);
  const [depthM, setDepthM] = useState(3);
  const [planGenerated, setPlanGenerated] = useState(false);

  const materials = useMemo(
    () => (planGenerated ? generateDeckMaterialsCatalog(widthM, depthM) : []),
    [planGenerated, widthM, depthM]
  );
  const totalSEK = materials.reduce((sum, m) => sum + m.basePriceSEK, 0);

  const handleContinue = () => {
    startDeckProject(widthM, depthM);
    router.push("/cart");
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-6 py-16">
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
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {planGenerated ? "Flik 2 — AI Plan" : "Flik 1 — Projekt"}
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            Bygga altan
          </h1>
          <p className="mt-4 text-ink-secondary">
            {planGenerated
              ? "AI har brutit ner projektet i vad du faktiskt behöver."
              : "Ange måtten. AI räknar ut exakt vad du behöver."}
          </p>
        </motion.div>

        {!planGenerated ? (
          <motion.div {...fadeUp(0.1)} className="mt-10">
            <Card className="flex flex-col gap-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                    <Ruler className="size-3.5" />
                    Bredd (meter)
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={widthM}
                    onChange={(e) => setWidthM(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-base text-ink focus:border-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                    <Ruler className="size-3.5" />
                    Djup (meter)
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={depthM}
                    onChange={(e) => setDepthM(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-base text-ink focus:border-primary/40 focus:outline-none"
                  />
                </div>
              </div>
              <Button size="xl" onClick={() => setPlanGenerated(true)} disabled={widthM <= 0 || depthM <= 0}>
                <Hammer />
                Skapa AI-plan
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div {...fadeUp(0.1)} className="mt-10">
            <Card className="flex flex-col gap-6">
              <div className="flex items-end justify-between gap-4">
                <CardTitle>
                  Altan {widthM} × {depthM} m
                </CardTitle>
                <span className="font-mono text-2xl font-bold tracking-tight text-ink">
                  {formatSEK(totalSEK)}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {materials.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.06 * i, ease: EASE }}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-2/40 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-ink">{item.displayName}</span>
                    <span className="font-mono text-sm text-ink-secondary">
                      {formatSEK(item.basePriceSEK)}
                    </span>
                  </motion.div>
                ))}
              </div>

              <Button size="xl" className="w-full" onClick={handleContinue}>
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
