"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { ScoreRing } from "@/components/shared/score-ring";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";

type FutureScoreCardProps = {
  score: number;
  delta: number;
  /** True right after a quest completes — floats a "+2%" off the number. */
  justImproved: boolean;
};

export const FutureScoreCard = memo(function FutureScoreCard({
  score,
  delta,
  justImproved,
}: FutureScoreCardProps) {
  return (
    <Card className="flex h-full flex-col items-center justify-between gap-7">
      <CardTitle>Future Score</CardTitle>

      <div className="relative">
        <ScoreRing value={score} size={208} strokeWidth={11} glow>
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

      <div className="glass flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
        <TrendingUp className="size-4 text-success" />
        <span className="font-semibold tabular-nums text-success">
          {delta >= 0 ? "+" : ""}
          {delta}%
        </span>
        <span className="text-ink-muted">since yesterday</span>
      </div>
    </Card>
  );
});
