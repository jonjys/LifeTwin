"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { ScoreRing } from "@/components/shared/score-ring";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Button } from "@/components/ui/button";
import { fadeUp, EASE } from "@/lib/motion";
import { loadState } from "@/lib/storage";

export default function LandingPage() {
  const router = useRouter();
  const [hasTwin, setHasTwin] = useState(false);

  useEffect(() => {
    setHasTwin(Boolean(loadState()));
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
      <AmbientBackground />

      <motion.div
        {...fadeUp(0)}
        className="glass mb-10 flex items-center gap-2 rounded-full px-4 py-2"
      >
        <Sparkles className="size-3.5 text-primary" />
        <span className="text-xs font-medium tracking-wide text-ink-secondary">
          The future, visualized
        </span>
      </motion.div>

      <motion.h1
        {...fadeUp(0.1)}
        className="max-w-3xl text-balance text-center text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
      >
        Your future changes{" "}
        <span className="text-gradient">every day.</span>
      </motion.h1>

      <motion.p
        {...fadeUp(0.2)}
        className="mt-6 max-w-md text-balance text-center text-lg text-ink-secondary"
      >
        LifeTwin visualizes who you&apos;re becoming.
      </motion.p>

      <motion.div {...fadeUp(0.3)} className="mt-12 flex flex-col items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          <Button
            size="xl"
            onClick={() => router.push(hasTwin ? "/dashboard" : "/onboarding")}
          >
            {hasTwin ? "Open my LifeTwin" : "Create my LifeTwin"}
            <ArrowRight />
          </Button>
        </motion.div>
        <span className="text-xs text-ink-muted">
          No account&ensp;·&ensp;Private&ensp;·&ensp;Runs on your device
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
        className="glass-strong mt-20 flex items-center gap-8 rounded-4xl px-10 py-8 shadow-card"
      >
        <ScoreRing value={81} size={120} strokeWidth={7}>
          <span className="font-mono text-2xl font-bold tabular-nums">
            <AnimatedNumber value={81} suffix="%" duration={2} />
          </span>
        </ScoreRing>
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Future Score
          </p>
          <p className="mt-1.5 max-w-[180px] text-sm leading-relaxed text-ink-secondary">
            One glance every morning. One small win every day.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
