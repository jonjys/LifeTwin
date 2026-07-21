"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { FutureScoreCard } from "@/components/dashboard/future-score-card";
import { TwinSyncCard } from "@/components/dashboard/twin-sync-card";
import { QuestCard } from "@/components/dashboard/quest-card";
import { FuturePaths } from "@/components/dashboard/future-paths";
import { Timeline } from "@/components/dashboard/timeline";
import { InsightCard } from "@/components/dashboard/insight-card";
import { useLifeTwin } from "@/hooks/use-life-twin";

const sectionMotion = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function DashboardPage() {
  const router = useRouter();
  const {
    state,
    sim,
    loading,
    questDone,
    scoreDelta,
    justCompleted,
    completeQuest,
  } = useLifeTwin();

  useEffect(() => {
    if (!loading && !state) router.replace("/onboarding");
  }, [loading, state, router]);

  if (loading || !state || !sim) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <AmbientBackground />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-sm tracking-wide text-ink-muted"
        >
          Loading your future…
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-5 pb-20 pt-8 sm:px-8">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <motion.header
          {...sectionMotion(0)}
          className="mb-10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
              <span className="font-mono text-sm font-bold text-primary">
                LT
              </span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              LifeTwin
            </span>
          </div>
          {state.completions > 0 && (
            <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
              <Flame className="size-4 text-warning" />
              <span className="text-sm font-semibold tabular-nums">
                {state.completions}
              </span>
              <span className="text-xs text-ink-muted">
                {state.completions === 1 ? "quest" : "quests"} completed
              </span>
            </div>
          )}
        </motion.header>

        {/* Hero row: score, sync, quest */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div {...sectionMotion(0.05)}>
            <FutureScoreCard score={sim.futureScore} delta={scoreDelta} />
          </motion.div>
          <motion.div {...sectionMotion(0.12)}>
            <TwinSyncCard sync={sim.twinSync} />
          </motion.div>
          <motion.div {...sectionMotion(0.19)}>
            <QuestCard
              quest={sim.quest}
              done={questDone}
              justCompleted={justCompleted}
              onComplete={completeQuest}
            />
          </motion.div>
        </div>

        {/* Future paths */}
        <motion.section {...sectionMotion(0.26)} className="mt-6">
          <FuturePaths
            currentPath={sim.currentPath}
            futurePath={sim.futurePath}
          />
        </motion.section>

        {/* Timeline */}
        <motion.section {...sectionMotion(0.33)} className="mt-6">
          <Timeline
            currentPath={sim.currentPath}
            futurePath={sim.futurePath}
            animationKey={state.completions}
          />
        </motion.section>

        {/* AI insight */}
        <motion.section {...sectionMotion(0.4)} className="mt-6">
          <InsightCard insight={sim.insight} />
        </motion.section>
      </div>
    </main>
  );
}
