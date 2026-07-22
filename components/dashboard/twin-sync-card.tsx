"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";

type TwinSyncCardProps = {
  sync: number;
  /** True right after a quest completes — floats a "+3%" off the number. */
  justImproved: boolean;
};

export const TwinSyncCard = memo(function TwinSyncCard({
  sync,
  justImproved,
}: TwinSyncCardProps) {
  return (
    <Card className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
      <div className="relative flex shrink-0 items-center gap-5 sm:w-56">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
        </span>
        <div>
          <CardTitle>Twin Sync</CardTitle>
          <motion.span
            key={sync}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="mt-1 block font-mono text-5xl font-bold tabular-nums tracking-tight"
          >
            <AnimatedNumber value={sync} suffix="%" />
          </motion.span>
        </div>

        <AnimatePresence>
          {justImproved && (
            <motion.span
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: [0, 1, 1, 0], y: -30, scale: 1 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute left-16 top-0 font-mono text-sm font-bold text-success"
            >
              +3%
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="min-w-0 flex-1">
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary shadow-glow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${sync}%` }}
            transition={{ duration: 1.4, ease: EASE }}
          />
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          How closely today&apos;s you lives like your future self.
        </p>
      </div>
    </Card>
  );
});
