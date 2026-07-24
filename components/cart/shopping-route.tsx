"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { STORES } from "@/lib/cart-engine";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ShoppingRoute } from "@/lib/types";

type ShoppingRouteCardProps = {
  route: ShoppingRoute;
};

/** A compact, ordered stop list — not a tall vertical timeline — so the
 *  whole route reads like the rest of the shopping list, at a glance. */
export const ShoppingRouteCard = memo(function ShoppingRouteCard({
  route,
}: ShoppingRouteCardProps) {
  if (route.stops.length === 0) return null;

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <CardTitle>AI Shopping Route</CardTitle>
        <p className="mt-1.5 text-sm text-ink-secondary">
          +{route.totalExtraTimeMin} min extra för {route.totalSavingsSEK} kr i besparing.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border/60">
        {route.stops.map((stop, i) => {
          const store = STORES[stop.store];
          return (
            <motion.div
              key={stop.store}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i, ease: EASE }}
              className="flex items-center gap-3 py-2 text-sm"
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                  stop.skipRecommended
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-primary/40 bg-primary/10 text-primary"
                )}
              >
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-medium text-ink">{store.name}</span>
                  <span className="text-xs text-ink-muted">{stop.distanceFromPreviousKm} km</span>
                </div>
                <p className="truncate text-xs text-ink-muted">{stop.itemNames.join(", ")}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {stop.skipRecommended && (
                  <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                    <X className="size-2.5" />
                    Hoppa över
                  </span>
                )}
                <span className="text-xs font-semibold text-success">
                  {stop.stopSavingsSEK} kr
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
});
