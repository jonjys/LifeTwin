"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Home, MapPin, X } from "lucide-react";
import { STORES } from "@/lib/cart-engine";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ShoppingRoute } from "@/lib/types";

type ShoppingRouteCardProps = {
  route: ShoppingRoute;
};

/** Only rendered when self-pickup actually spans more than one store. */
export const ShoppingRouteCard = memo(function ShoppingRouteCard({
  route,
}: ShoppingRouteCardProps) {
  if (route.stops.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
          AI Shopping Route
        </h3>
        <p className="mt-2 text-sm text-ink-secondary">
          +{route.totalExtraTimeMin} min extra för {route.totalSavingsSEK} kr i besparing.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {route.stops.map((stop, i) => {
          const store = STORES[stop.store];
          return (
            <motion.div
              key={stop.store}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i, ease: EASE }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    stop.skipRecommended
                      ? "border-warning/40 bg-warning/10 text-warning"
                      : "border-primary/40 bg-primary/10 text-primary"
                  )}
                >
                  <MapPin className="size-4" />
                </div>
                {i < route.stops.length - 1 && (
                  <div className="mt-1 h-8 w-px bg-border" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{store.name}</span>
                  <span className="text-xs text-ink-muted">
                    {stop.distanceFromPreviousKm} km
                  </span>
                  {stop.skipRecommended && (
                    <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                      <X className="size-3" />
                      Hoppa över
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-secondary">
                  {stop.itemNames.join(", ")}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs italic",
                    stop.skipRecommended ? "text-warning" : "text-ink-muted"
                  )}
                >
                  {stop.skipReasonText ?? `Du sparar ${stop.stopSavingsSEK} kr här.`}
                </p>
              </div>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 * route.stops.length, ease: EASE }}
          className="flex items-center gap-4"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-ink-secondary">
            <Home className="size-4" />
          </div>
          <span className="text-sm font-semibold text-ink">Hem</span>
        </motion.div>
      </div>
    </div>
  );
});
