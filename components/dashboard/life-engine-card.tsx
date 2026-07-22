"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  Flame,
  Gauge,
  PiggyBank,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import type { NarrativeProjections } from "@/lib/types";

type LifeEngineCardProps = {
  projections: NarrativeProjections;
  previousProjections: NarrativeProjections | null;
  justCompleted: boolean;
};

const SEK = new Intl.NumberFormat("en-US");

function StatTile({
  icon: Icon,
  label,
  value,
  previousValue,
  format,
  higherIsBetter,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  previousValue?: number;
  format: (n: number) => string;
  higherIsBetter: boolean;
}) {
  const delta =
    previousValue !== undefined ? value - previousValue : undefined;
  const improved = delta !== undefined && (higherIsBetter ? delta > 0 : delta < 0);
  const worsened = delta !== undefined && delta !== 0 && !improved;

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface-2/60 p-4">
      <div className="flex items-center gap-2 text-ink-secondary">
        <Icon className="size-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold tabular-nums tracking-tight">
          <AnimatedNumber value={value} format={format} />
        </span>
        <AnimatePresence>
          {delta !== undefined && delta !== 0 && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.9, ease: EASE }}
              className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                improved
                  ? "bg-success/10 text-success"
                  : worsened
                    ? "bg-warning/10 text-warning"
                    : "bg-white/5 text-ink-muted"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {Math.round(delta)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * The heart of the Life Engine on-screen: not a percentage, but the
 * concrete consequences of today's decisions — a date, an odds, a
 * currency figure. When a quest completes, these recalculate in front
 * of the user instead of just ticking a score up.
 */
export const LifeEngineCard = memo(function LifeEngineCard({
  projections,
  previousProjections,
  justCompleted,
}: LifeEngineCardProps) {
  const dateChanged =
    justCompleted &&
    previousProjections !== null &&
    previousProjections.milestoneDate !== projections.milestoneDate;

  return (
    <Card className="relative flex flex-col gap-6 overflow-hidden border-primary/15">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-primary/[0.06] blur-3xl"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Life Engine</CardTitle>
          <p className="mt-1 text-sm text-ink-secondary">
            Your future, recalculated in real time.
          </p>
        </div>
        <AnimatePresence>
          {justCompleted && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.2, times: [0, 0.15, 0.7, 1] }}
              className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-primary"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Recalculating…
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {justCompleted && previousProjections && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="-mt-2 text-sm font-semibold text-success"
          >
            Your future changed.
          </motion.p>
        )}
      </AnimatePresence>

      {/* The milestone — the most concrete, most "wow" number */}
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
        <div className="flex items-center gap-2 text-primary">
          <CalendarClock className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">
            {projections.milestoneLabel}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          {dateChanged && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-lg text-ink-muted line-through decoration-ink-muted/40"
            >
              {previousProjections.milestoneDate}
            </motion.span>
          )}
          <motion.span
            key={projections.milestoneDate}
            initial={dateChanged ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          >
            {projections.milestoneDate}
          </motion.span>
        </div>
      </div>

      {/* Supporting projections */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={Gauge}
          label="Probability"
          value={projections.probability}
          previousValue={previousProjections?.probability}
          format={(n) => `${n}%`}
          higherIsBetter
        />
        <StatTile
          icon={PiggyBank}
          label="Savings"
          value={projections.savingsSEK}
          previousValue={previousProjections?.savingsSEK}
          format={(n) => `${SEK.format(n)} SEK`}
          higherIsBetter
        />
        <StatTile
          icon={Waves}
          label="Stress"
          value={projections.stress}
          previousValue={previousProjections?.stress}
          format={(n) => `${n}`}
          higherIsBetter={false}
        />
        <StatTile
          icon={Flame}
          label="Confidence"
          value={projections.confidence}
          previousValue={previousProjections?.confidence}
          format={(n) => `${n}`}
          higherIsBetter
        />
      </div>
    </Card>
  );
});
