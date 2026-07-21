"use client";

import { TrendingUp } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { ScoreRing } from "@/components/shared/score-ring";
import { Card, CardTitle } from "@/components/ui/card";

type FutureScoreCardProps = {
  score: number;
  delta: number;
};

export function FutureScoreCard({ score, delta }: FutureScoreCardProps) {
  return (
    <Card className="flex h-full flex-col items-center justify-between gap-6">
      <CardTitle>Future Score</CardTitle>
      <ScoreRing value={score} size={200} strokeWidth={11}>
        <span className="font-mono text-6xl font-bold tabular-nums tracking-tight">
          <AnimatedNumber value={score} suffix="%" />
        </span>
      </ScoreRing>
      <div className="flex items-center gap-1.5 text-sm">
        <TrendingUp className="size-4 text-success" />
        <span className="font-medium text-success">
          {delta >= 0 ? "+" : ""}
          {delta}%
        </span>
        <span className="text-ink-muted">since yesterday</span>
      </div>
    </Card>
  );
}
