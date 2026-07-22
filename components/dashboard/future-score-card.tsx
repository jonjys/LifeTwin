"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { ScoreRing } from "@/components/shared/score-ring";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import type { ScoreEntry } from "@/lib/types";

type FutureScoreCardProps = {
  score: number;
  delta: number;
  /** True right after a quest completes — floats a "+2%" off the number. */
  justImproved: boolean;
  history: ScoreEntry[];
  createdAt: string;
};

/** Last 7 recorded days as tiny bars — real momentum, one bar per visit. */
function MomentumBars({ history }: { history: ScoreEntry[] }) {
  const recent = history.slice(-7);
  const scores = recent.map((h) => h.futureScore);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = Math.max(max - min, 1);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-8 items-end gap-1.5">
        {Array.from({ length: 7 }, (_, i) => {
          const entry = recent[i - (7 - recent.length)];
          if (!entry) {
            return (
              <div
                key={i}
                className="h-1.5 w-2 rounded-full bg-white/[0.06]"
              />
            );
          }
          const height = 30 + (70 * (entry.futureScore - min)) / span;
          return (
            <motion.div
              key={entry.date}
              className="w-2 rounded-full bg-gradient-to-t from-primary/50 to-primary"
              initial={{ height: 0 }}
              animate={{ height: `${(height / 100) * 32}px` }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.06, ease: EASE }}
            />
          );
        })}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
        7-day momentum
      </span>
    </div>
  );
}

export const FutureScoreCard = memo(function FutureScoreCard({
  score,
  delta,
  justImproved,
  history,
  createdAt,
}: FutureScoreCardProps) {
  const dayNumber =
    Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000)
    ) + 1;

  return (
    <Card className="flex h-full flex-col items-center justify-between gap-6">
      <div className="flex flex-col items-center gap-1.5">
        <CardTitle>Future Score</CardTitle>
        <span className="text-xs text-ink-muted">
          Day {dayNumber} of your new future
        </span>
      </div>

      <div className="relative">
        <ScoreRing value={score} size={196} strokeWidth={11} glow>
          {/* Remounts on score change so the number gives a gentle pulse */}
          <motion.span
            key={score}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="font-mono text-6xl font-bold tabular-nums tracking-tight"
          >
            <AnimatedNumber value={score} suffix="%" />
          </motion.span>
        </ScoreRing>

        <AnimatePresence>
          {justImproved && (
            <motion.span
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: [0, 1, 1, 0], y: -44, scale: 1 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute left-1/2 top-8 -translate-x-1/2 font-mono text-lg font-bold text-success"
            >
              +2%
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="glass flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
          <TrendingUp className="size-4 text-success" />
          <span className="font-semibold tabular-nums text-success">
            {delta >= 0 ? "+" : ""}
            {delta}%
          </span>
          <span className="text-ink-muted">since yesterday</span>
        </div>
        <MomentumBars history={history} />
      </div>
    </Card>
  );
});
