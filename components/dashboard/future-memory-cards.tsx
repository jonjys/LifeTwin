"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  HeartPulse,
  PiggyBank,
  Sparkle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import type { FutureMemory, MemoryCategory } from "@/lib/types";

const CATEGORY_META: Record<MemoryCategory, { label: string; icon: LucideIcon }> = {
  career: { label: "Career", icon: Briefcase },
  finance: { label: "Finance", icon: PiggyBank },
  health: { label: "Health", icon: HeartPulse },
  relationships: { label: "Relationships", icon: Users },
  growth: { label: "Personal Growth", icon: Sparkle },
};

function MemoryCard({
  memory,
  previousConfidence,
  index,
}: {
  memory: FutureMemory;
  previousConfidence?: number;
  index: number;
}) {
  const { label, icon: Icon } = CATEGORY_META[memory.category];
  const delta =
    previousConfidence !== undefined ? memory.confidence - previousConfidence : undefined;
  const improved = delta !== undefined && delta > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: EASE }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-2/60 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-ink-muted">{memory.date}</span>
        <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
          <Icon className="size-3" />
          {label}
        </span>
      </div>

      <div>
        <h4 className="text-lg font-semibold leading-snug tracking-tight text-ink">
          {memory.title}
        </h4>
        <p className="mt-2 border-l-2 border-primary/30 pl-3 text-sm italic leading-relaxed text-ink-secondary">
          {memory.description}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
            Confidence
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-bold tabular-nums text-ink">
              <AnimatedNumber value={memory.confidence} suffix="%" />
            </span>
            <AnimatePresence>
              {delta !== undefined && delta !== 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.9, ease: EASE }}
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                    improved ? "bg-success/10 text-success" : "bg-white/5 text-ink-muted"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${memory.confidence}%` }}
            transition={{ duration: 1.2, delay: 0.2 + index * 0.08, ease: EASE }}
          />
        </div>
        <p className="text-xs leading-relaxed text-ink-muted">
          {improved
            ? "Your consistency is making this increasingly likely."
            : "If you maintain your current consistency, this becomes increasingly likely."}
        </p>
      </div>
    </motion.div>
  );
}

type FutureMemoryCardsProps = {
  memories: FutureMemory[];
  previousMemories: FutureMemory[] | null;
};

/** Future memories — concrete, dated moments instead of static bullet points. */
export const FutureMemoryCards = memo(function FutureMemoryCards({
  memories,
  previousMemories,
}: FutureMemoryCardsProps) {
  const previousById = new Map(previousMemories?.map((m) => [m.id, m.confidence]));

  return (
    <Card className="flex flex-col gap-6">
      <div>
        <CardTitle>Future Memories</CardTitle>
        <p className="mt-1 text-sm text-ink-secondary">
          Moments your current trajectory is already writing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {memories.map((memory, i) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            previousConfidence={previousById.get(memory.id)}
            index={i}
          />
        ))}
      </div>
    </Card>
  );
});
