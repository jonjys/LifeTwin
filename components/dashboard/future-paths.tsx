"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  HeartPulse,
  MoveRight,
  Smile,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import { averageOf } from "@/lib/ai/simulation";
import type { PathMetrics } from "@/lib/types";

const NEUTRAL = "#8A8AA0";

const DIMENSIONS: ReadonlyArray<{
  key: keyof PathMetrics;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "health", label: "Health", icon: HeartPulse },
  { key: "money", label: "Money", icon: Wallet },
  { key: "mood", label: "Mood", icon: Smile },
  { key: "confidence", label: "Confidence", icon: Flame },
  { key: "productivity", label: "Productivity", icon: Zap },
];

/**
 * One shared track per dimension: the gray segment is today,
 * the cyan segment beyond it is the unclaimed future.
 */
function ComparisonRow({
  icon: Icon,
  label,
  current,
  future,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  current: number;
  future: number;
  delay: number;
}) {
  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <div className="flex w-40 shrink-0 items-center gap-3.5">
        <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-ink-secondary">
          <Icon className="size-4" />
        </div>
        <span className="text-sm font-medium text-ink-secondary">{label}</span>
      </div>

      <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        {/* The future: full potential in cyan */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/60 to-primary shadow-glow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${future}%` }}
          transition={{ duration: 1.3, delay, ease: EASE }}
        />
        {/* Today: the gray segment layered on top, with a 2px surface spacer */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-l-full border-r-2 border-background"
          style={{ background: NEUTRAL }}
          initial={{ width: 0 }}
          animate={{ width: `${current}%` }}
          transition={{ duration: 1.1, delay: delay + 0.1, ease: EASE }}
        />
      </div>

      <div className="flex w-32 shrink-0 items-center justify-end gap-2 font-mono text-sm tabular-nums">
        <span className="text-ink-muted">{current}</span>
        <MoveRight className="size-3.5 text-ink-muted" />
        <span className="font-semibold text-ink">{future}</span>
        <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-xs font-semibold text-success">
          +{future - current}
        </span>
      </div>
    </div>
  );
}

type FuturePathsProps = {
  currentPath: PathMetrics;
  futurePath: PathMetrics;
};

export const FuturePaths = memo(function FuturePaths({
  currentPath,
  futurePath,
}: FuturePathsProps) {
  const gap = Math.round(averageOf(futurePath) - averageOf(currentPath));

  return (
    <Card className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle>Future Paths</CardTitle>
          <p className="mt-2 max-w-md text-sm text-ink-secondary">
            You&apos;re living{" "}
            <span className="font-semibold text-ink">{gap} points</span>{" "}
            below the future you could be building — that gap is the cost
            of an ordinary day, not a lack of potential.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <span className="flex items-center gap-2 text-ink-secondary">
            <span
              className="size-2 rounded-full"
              style={{ background: NEUTRAL }}
            />
            Where you are
          </span>
          <span className="flex items-center gap-2 text-ink">
            <span className="size-2 rounded-full bg-primary" />
            Where you could be
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {DIMENSIONS.map((dim, i) => (
          <ComparisonRow
            key={dim.key}
            icon={dim.icon}
            label={dim.label}
            current={currentPath[dim.key]}
            future={futurePath[dim.key]}
            delay={0.15 + i * 0.08}
          />
        ))}
      </div>
    </Card>
  );
});
