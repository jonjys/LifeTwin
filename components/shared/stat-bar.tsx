"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatBarProps = {
  icon: LucideIcon;
  label: string;
  /** 0–100 */
  value: number;
  /** Cyan for the LifeTwin path, neutral for the current path. */
  tone?: "primary" | "neutral";
  delay?: number;
};

/** One life dimension: icon + label + thin animated magnitude bar. */
export function StatBar({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  delay = 0,
}: StatBarProps) {
  return (
    <div className="flex items-center gap-3.5">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl border",
          tone === "primary"
            ? "border-primary/25 bg-primary/10 text-primary"
            : "border-border bg-surface-2 text-ink-secondary"
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-ink-secondary">
            {label}
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-ink">
            {value}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className={cn(
              "h-full rounded-full",
              tone === "primary"
                ? "bg-gradient-to-r from-primary/70 to-primary shadow-glow-sm"
                : "bg-ink-muted"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{
              duration: 1.2,
              delay,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
      </div>
    </div>
  );
}
