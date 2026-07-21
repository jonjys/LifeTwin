"use client";

import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardTitle } from "@/components/ui/card";

type TwinSyncCardProps = {
  sync: number;
};

export function TwinSyncCard({ sync }: TwinSyncCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between gap-6">
      <div className="flex items-center justify-between">
        <CardTitle>Twin Sync</CardTitle>
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
        </span>
      </div>

      <div className="flex items-end gap-3">
        <span className="font-mono text-6xl font-bold tabular-nums tracking-tight">
          <AnimatedNumber value={sync} suffix="%" />
        </span>
        <Radio className="mb-2 size-5 text-primary" />
      </div>

      <div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary shadow-glow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${sync}%` }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          How closely today&apos;s you lives like your future self.
        </p>
      </div>
    </Card>
  );
}
