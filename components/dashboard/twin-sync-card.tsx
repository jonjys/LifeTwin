"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";

type TwinSyncCardProps = {
  sync: number;
};

export const TwinSyncCard = memo(function TwinSyncCard({
  sync,
}: TwinSyncCardProps) {
  return (
    <Card className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
      <div className="flex shrink-0 items-center gap-5 sm:w-56">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
        </span>
        <div>
          <CardTitle>Twin Sync</CardTitle>
          <span className="mt-1 block font-mono text-5xl font-bold tabular-nums tracking-tight">
            <AnimatedNumber value={sync} suffix="%" />
          </span>
        </div>
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
