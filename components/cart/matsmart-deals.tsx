"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import type { MatsmartDeal } from "@/lib/types";

type MatsmartDealsProps = {
  deals: MatsmartDeal[];
};

export const MatsmartDeals = memo(function MatsmartDeals({ deals }: MatsmartDealsProps) {
  if (deals.length === 0) return null;

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Zap className="size-4 text-warning" />
        <CardTitle>Matsmart fynd</CardTitle>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {deals.map((deal, i) => (
          <motion.div
            key={deal.catalogId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 * i, ease: EASE }}
            className="flex items-center justify-between rounded-xl border border-warning/20 bg-warning/[0.05] px-4 py-3"
          >
            <span className="text-sm font-medium text-ink">{deal.displayName}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-ink-secondary">{deal.priceSEK} kr</span>
              <span className="rounded-md bg-warning/15 px-2 py-0.5 text-xs font-bold text-warning">
                −{deal.discountPct}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-sm text-ink-muted">
        Flytta dessa varor till Matsmart nästa gång du handlar?
      </p>
    </Card>
  );
});
