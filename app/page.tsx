"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { fadeUp, EASE } from "@/lib/motion";
import { loadState } from "@/lib/storage";
import { formatSEK } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const [hasProject, setHasProject] = useState(false);

  useEffect(() => {
    setHasProject(Boolean(loadState()?.currentItems.length));
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10 sm:py-16">
      <AmbientBackground />

      <motion.div
        {...fadeUp(0)}
        className="glass mb-6 flex items-center gap-2 rounded-full px-4 py-2"
      >
        <Sparkles className="size-3.5 text-primary" />
        <span className="text-xs font-medium tracking-wide text-ink-secondary">
          ProjektOS
        </span>
      </motion.div>

      <motion.h1
        {...fadeUp(0.1)}
        className="max-w-3xl text-balance text-center text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
      >
        Vi jämför inte priser.{" "}
        <span className="text-gradient">Vi fattar köpbeslut.</span>
      </motion.h1>

      <motion.p
        {...fadeUp(0.2)}
        className="mt-5 max-w-md text-balance text-center text-base text-ink-secondary sm:text-lg"
      >
        Starta ett projekt — matkasse, altan, vad som helst härnäst. Samma AI
        bryter ner det, väger pris mot tid, bensin och besvär, och säger
        exakt vad du ska göra.
      </motion.p>

      <motion.div {...fadeUp(0.3)} className="mt-8 flex flex-col items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          <Button size="xl" onClick={() => router.push(hasProject ? "/cart" : "/projects")}>
            {hasProject ? "Visa mitt projekt" : "Starta ett projekt"}
            <ArrowRight />
          </Button>
        </motion.div>
        <span className="text-xs text-ink-muted">
          Ingen inloggning&ensp;·&ensp;Privat&ensp;·&ensp;Körs i din webbläsare
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
        className="glass-strong mt-10 flex items-center gap-5 rounded-4xl px-6 py-5 shadow-card sm:mt-14 sm:gap-6 sm:px-8 sm:py-6"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 shadow-glow-sm sm:size-14">
          <span className="font-mono text-base font-bold text-primary sm:text-lg">AI</span>
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Sparat i år
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-tight sm:text-3xl">
            {formatSEK(8412)}
          </p>
          <p className="mt-1 max-w-[220px] text-sm leading-relaxed text-ink-secondary">
            Så mycket kan en vanlig hushållskasse spara på ett år.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
