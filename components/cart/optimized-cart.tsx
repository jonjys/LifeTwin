"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SwapCard } from "@/components/cart/swap-card";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import type { CartResult } from "@/lib/types";

type OptimizedCartProps = {
  cart: CartResult;
};

const CART_LABEL: Record<CartResult["domain"], { title: string; changed: string; unchanged: string }> = {
  grocery: {
    title: "Din matkasse",
    changed: "Jag byggde om din matkasse.",
    unchanged: "Din matkasse är redan optimerad.",
  },
  building: {
    title: "Ditt inköp",
    changed: "Jag räknade om var du ska köpa varje sak.",
    unchanged: "Ditt inköp är redan optimerat.",
  },
};

export const OptimizedCart = memo(function OptimizedCart({ cart }: OptimizedCartProps) {
  const swapCount = cart.items.filter((i) => i.swapReason && i.savingsSEK > 0).length;
  const labels = CART_LABEL[cart.domain];

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <CardTitle>{labels.title}</CardTitle>
          <motion.h3
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          >
            {swapCount > 0 ? labels.changed : labels.unchanged}
          </motion.h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
            Du sparar
          </p>
          <p className="font-mono text-3xl font-bold text-success">
            <AnimatedNumber value={cart.totalSavingsSEK} suffix=" kr" />
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cart.items.map((item, i) => (
          <SwapCard key={item.requested.id} item={item} index={i} />
        ))}
      </div>
    </Card>
  );
});
