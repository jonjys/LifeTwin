"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import type { FutureOpportunity, FutureRisk } from "@/lib/types";

type FutureOutlookProps = {
  opportunities: FutureOpportunity[];
  risks: FutureRisk[];
};

function OutlookSection({
  icon: Icon,
  label,
  tone,
  items,
  delayOffset,
}: {
  icon: typeof TrendingUp;
  label: string;
  tone: "success" | "muted";
  items: string[];
  delayOffset: number;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${
          tone === "success" ? "text-success" : "text-ink-muted"
        }`}
      >
        <Icon className="size-3.5" />
        {label}
      </div>
      <ul className="flex flex-col gap-2.5">
        {items.map((text, i) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delayOffset + i * 0.1, ease: EASE }}
            className="text-sm leading-relaxed text-ink-secondary"
          >
            {text}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** Trajectory, visualized calmly — momentum on one side, drift on the other. */
export const FutureOutlook = memo(function FutureOutlook({
  opportunities,
  risks,
}: FutureOutlookProps) {
  return (
    <Card className="flex h-full flex-col gap-6">
      <CardTitle>Trajectory</CardTitle>
      <div className="flex flex-1 flex-col gap-6 sm:flex-row">
        <OutlookSection
          icon={TrendingUp}
          label="Momentum"
          tone="success"
          items={opportunities.map((o) => o.text)}
          delayOffset={0.15}
        />
        <div className="hidden w-px bg-white/5 sm:block" />
        <OutlookSection
          icon={TrendingDown}
          label="If nothing changes"
          tone="muted"
          items={risks.map((r) => r.text)}
          delayOffset={0.3}
        />
      </div>
    </Card>
  );
});
