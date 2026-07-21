"use client";

import { Flame, HeartPulse, Smile, Wallet, Zap } from "lucide-react";
import { StatBar } from "@/components/shared/stat-bar";
import { Card, CardTitle } from "@/components/ui/card";
import type { PathMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";

const DIMENSIONS = [
  { key: "health", label: "Health", icon: HeartPulse },
  { key: "money", label: "Money", icon: Wallet },
  { key: "mood", label: "Mood", icon: Smile },
  { key: "confidence", label: "Confidence", icon: Flame },
  { key: "productivity", label: "Productivity", icon: Zap },
] as const;

function PathCard({
  title,
  caption,
  metrics,
  tone,
}: {
  title: string;
  caption: string;
  metrics: PathMetrics;
  tone: "primary" | "neutral";
}) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-6",
        tone === "primary" && "border-primary/20 shadow-glow-sm"
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <CardTitle className={cn(tone === "primary" && "text-primary")}>
          {title}
        </CardTitle>
        <span className="text-xs text-ink-muted">{caption}</span>
      </div>
      <div className="flex flex-col gap-5">
        {DIMENSIONS.map((dim, i) => (
          <StatBar
            key={dim.key}
            icon={dim.icon}
            label={dim.label}
            value={metrics[dim.key]}
            tone={tone}
            delay={0.1 + i * 0.08}
          />
        ))}
      </div>
    </Card>
  );
}

type FuturePathsProps = {
  currentPath: PathMetrics;
  futurePath: PathMetrics;
};

export function FuturePaths({ currentPath, futurePath }: FuturePathsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PathCard
        title="Current Path"
        caption="If nothing changes"
        metrics={currentPath}
        tone="neutral"
      />
      <PathCard
        title="LifeTwin Path"
        caption="Who you're becoming"
        metrics={futurePath}
        tone="primary"
      />
    </div>
  );
}
