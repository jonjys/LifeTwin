"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardTitle } from "@/components/ui/card";
import { STORES } from "@/lib/cart-engine";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CartResult, OptimizedItem, StoreId } from "@/lib/types";

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

/** Groups in first-seen order — a stable, believable "in order" read
 *  through the cart, one section per store. */
function groupByStore(items: OptimizedItem[]): { storeId: StoreId; items: OptimizedItem[] }[] {
  const order: StoreId[] = [];
  const map = new Map<StoreId, OptimizedItem[]>();
  for (const item of items) {
    const id = item.chosen.store;
    if (!map.has(id)) {
      map.set(id, []);
      order.push(id);
    }
    map.get(id)!.push(item);
  }
  return order.map((storeId) => ({ storeId, items: map.get(storeId)! }));
}

/** A compact, per-store shopping list — not a grid of tall cards, one row
 *  per item, so the whole cart reads at a glance instead of a long scroll. */
export const OptimizedCart = memo(function OptimizedCart({ cart }: OptimizedCartProps) {
  const swapCount = cart.items.filter((i) => i.swapReason && i.savingsSEK > 0).length;
  const labels = CART_LABEL[cart.domain];
  const groups = groupByStore(cart.items);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <CardTitle>{labels.title}</CardTitle>
          <motion.h3
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-1.5 text-xl font-bold tracking-tight text-ink sm:text-2xl"
          >
            {swapCount > 0 ? labels.changed : labels.unchanged}
          </motion.h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
            Du sparar
          </p>
          <p className="font-mono text-2xl font-bold text-success sm:text-3xl">
            <AnimatedNumber value={cart.totalSavingsSEK} suffix=" kr" />
          </p>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border/60">
        {groups.map(({ storeId, items }, gi) => {
          const store = STORES[storeId];
          const subtotalSEK = items.reduce((sum, it) => sum + it.chosen.priceSEK, 0);
          return (
            <div key={storeId} className={cn("py-2.5", gi === 0 && "pt-0")}>
              <div className="mb-1 flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: store.color }} />
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-secondary">
                  {store.name}
                </span>
                <span className="ml-auto shrink-0 text-xs text-ink-muted">
                  {items.length} {items.length === 1 ? "vara" : "varor"} · {subtotalSEK} kr
                </span>
              </div>

              {items.map((item, i) => (
                <motion.div
                  key={item.requested.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.03 * i, ease: EASE }}
                  className="flex items-center justify-between gap-3 py-1.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-ink">{item.chosen.productName}</p>
                    {item.swapNote && (
                      <p className="truncate text-xs text-ink-muted">{item.swapNote}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    {item.savingsSEK > 0 && (
                      <span className="text-xs font-semibold text-success">
                        -{item.savingsSEK} kr
                      </span>
                    )}
                    <span className="w-14 text-right font-mono text-sm text-ink-secondary">
                      {item.chosen.priceSEK} kr
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
});
