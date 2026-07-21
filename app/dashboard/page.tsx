"use client";

import { useEffect, useState } from "react";
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
import { fadeUp } from "@/lib/motion";

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
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

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
    <main className="relative min-h-screen px-5 pb-24 pt-8 sm:px-8">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <motion.header
          {...fadeUp(0)}
          className="mb-10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
              <span className="font-mono text-sm font-bold text-primary">
                LT
              </span>
            </div>
            <div>
              <span className="block text-lg font-semibold leading-tight tracking-tight">
                LifeTwin
              </span>
              <span className="block text-xs text-ink-muted">{today}</span>
            </div>
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

        {/* Hero: the score, and today's quest — impossible to miss */}
        <div className="grid gap-6 lg:grid-cols-12">
          <motion.div {...fadeUp(0.05)} className="lg:col-span-4">
            <FutureScoreCard
              score={sim.futureScore}
              delta={scoreDelta}
              justImproved={justCompleted}
            />
          </motion.div>
          <motion.div {...fadeUp(0.12)} className="lg:col-span-8">
            <QuestCard
              quest={sim.quest}
              done={questDone}
              justCompleted={justCompleted}
              onComplete={completeQuest}
            />
          </motion.div>
        </div>

        {/* Twin sync */}
        <motion.section {...fadeUp(0.19)} className="mt-6">
          <TwinSyncCard sync={sim.twinSync} />
        </motion.section>

        {/* Future paths */}
        <motion.section {...fadeUp(0.26)} className="mt-6">
          <FuturePaths
            currentPath={sim.currentPath}
            futurePath={sim.futurePath}
          />
        </motion.section>

        {/* Timeline */}
        <motion.section {...fadeUp(0.33)} className="mt-6">
          <Timeline
            currentPath={sim.currentPath}
            futurePath={sim.futurePath}
            animationKey={state.completions}
          />
        </motion.section>

        {/* AI insight */}
        <motion.section {...fadeUp(0.4)} className="mt-6">
          <InsightCard insight={sim.insight} />
        </motion.section>
      </div>
    </main>
  );
}
