"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";

type RealOffer = { name: string; priceText: string };
type OffersResponse = { items: RealOffer[]; fetchedAt: string | null };

/**
 * The one real, live price feed in the app: ICA's own public "veckans
 * erbjudanden" page, fetched and cached server-side (see
 * app/api/ica-offers/route.ts) — every other "kampanj" badge elsewhere
 * in the app is the honest, clearly-documented simulation. This card
 * exists to be visibly, verifiably real, not to blend in with that.
 */
export const RealIcaDeals = memo(function RealIcaDeals() {
  const [data, setData] = useState<OffersResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ica-offers")
      .then((res) => res.json())
      .then((json: OffersResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ items: [], fetchedAt: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (data && data.items.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BadgeCheck className="size-4 text-success" />
        <CardTitle>Verkliga ICA-erbjudanden</CardTitle>
      </div>
      <p className="text-xs text-ink-muted">
        Hämtat live från ica.se — inte simulerat, till skillnad från kampanjmärkningar
        på andra butiker i appen.
      </p>

      {!data ? (
        <p className="text-sm text-ink-muted">Hämtar…</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {data.items.slice(0, 8).map((offer, i) => (
            <motion.div
              key={`${offer.name}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04 * i, ease: EASE }}
              className="flex items-center justify-between gap-3 rounded-xl border border-success/20 bg-success/[0.04] px-3.5 py-2"
            >
              <span className="truncate text-sm text-ink">{offer.name}</span>
              <span className="shrink-0 text-sm font-semibold text-success">
                {offer.priceText}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
});
