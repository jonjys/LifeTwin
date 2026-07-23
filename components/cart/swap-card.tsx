"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeftRight,
  Package,
  Store,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { STORES } from "@/lib/cart-engine";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { OptimizedItem, SwapReason } from "@/lib/types";

const REASON_META: Record<SwapReason, { label: string; icon: LucideIcon }> = {
  brand: { label: "Märkesbyte", icon: ArrowLeftRight },
  "pack-size": { label: "Storleksbyte", icon: Package },
  campaign: { label: "Kampanj", icon: Tag },
  store: { label: "Billigare butik", icon: Store },
};

function SwappedCard({ item, index }: { item: OptimizedItem; index: number }) {
  const { label, icon: Icon } = REASON_META[item.swapReason as SwapReason];
  // Campaign/store swaps keep the same product — only the price (and
  // maybe the store) changed, so an arrow between two identical names
  // would read as a bug rather than a swap.
  const sameProduct = item.naive.productName === item.chosen.productName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06 * index, ease: EASE }}
      className="flex flex-col gap-3 rounded-2xl border border-success/20 bg-success/[0.04] p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {item.displayName}
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
          <Icon className="size-3" />
          {label}
        </span>
      </div>

      {sameProduct ? (
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-ink">{item.chosen.productName}</p>
          <p className="text-xs text-ink-muted">
            Nu hos {STORES[item.chosen.store].name}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-ink-muted line-through decoration-ink-muted/40">
            {item.naive.productName}
          </p>
          <ArrowDown className="size-3.5 text-ink-muted" />
          <p className="text-base font-semibold text-ink">{item.chosen.productName}</p>
        </div>
      )}

      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="rounded-lg bg-success/10 px-3 py-1.5 text-sm font-bold text-success">
          Du sparade {item.savingsSEK} kr
        </span>
        <span className="font-mono text-sm text-ink-secondary">
          {item.chosen.priceSEK} kr
        </span>
      </div>

      {item.swapNote && (
        <p className="text-xs italic leading-relaxed text-ink-muted">{item.swapNote}</p>
      )}
    </motion.div>
  );
}

function PlainCard({ item, index }: { item: OptimizedItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06 * index, ease: EASE }}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-2/50 p-5"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {item.displayName}
      </span>
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-ink">{item.chosen.productName}</p>
        <span className="font-mono text-sm text-ink-secondary">
          {item.chosen.priceSEK} kr
        </span>
      </div>
      <p
        className={cn(
          "text-xs leading-relaxed",
          item.catalogId ? "text-ink-muted" : "text-primary"
        )}
      >
        {item.swapNote ?? "Redan bästa pris idag."}
      </p>
    </motion.div>
  );
}

type SwapCardProps = {
  item: OptimizedItem;
  index: number;
};

export const SwapCard = memo(function SwapCard({ item, index }: SwapCardProps) {
  if (item.swapReason && item.savingsSEK > 0) {
    return <SwappedCard item={item} index={index} />;
  }
  return <PlainCard item={item} index={index} />;
});
