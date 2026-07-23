"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type AutoPurchaseProps = {
  usualItems: string[];
  onQuickBuy: () => void;
  justBought: boolean;
};

/** Recurring items, optimized automatically — one notice, one tap. */
export const AutoPurchase = memo(function AutoPurchase({
  usualItems,
  onQuickBuy,
  justBought,
}: AutoPurchaseProps) {
  if (usualItems.length === 0) return null;

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
          <RefreshCw className="size-4" />
        </div>
        <div>
          <CardTitle>Automatiska inköp</CardTitle>
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Calendar className="size-3" /> Varje lördag
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {usualItems.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border bg-surface-2/60 px-3.5 py-1.5 text-sm capitalize text-ink-secondary"
          >
            {item}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {justBought ? (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 rounded-xl border border-success/25 bg-success/[0.06] px-4 py-3 text-sm text-success"
          >
            <Check className="size-4" strokeWidth={3} />
            Din veckohandel är klar.
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/50 px-4 py-3"
          >
            <span className="text-sm text-ink-secondary">
              AI har optimerat den här veckans handling.
            </span>
            <Button size="default" onClick={onQuickBuy}>
              Köp
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});
