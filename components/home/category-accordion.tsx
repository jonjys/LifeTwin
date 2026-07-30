"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, type SubCategory } from "@/lib/categories";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

function SubCategoryChip({ sub, onQuery }: { sub: SubCategory; onQuery: (query: string) => void }) {
  if ("comingSoon" in sub) {
    return (
      <span
        className="flex cursor-default items-center gap-1.5 rounded-full border border-dashed border-border bg-surface-2/30 px-3.5 py-1.5 text-sm text-ink-muted opacity-60"
        title="Kommer snart"
      >
        <span aria-hidden="true">{sub.emoji}</span> {sub.label}
        <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
          Snart
        </span>
      </span>
    );
  }

  const className =
    "flex items-center gap-1.5 rounded-full border border-border bg-surface-2/50 px-3.5 py-1.5 text-sm text-ink-secondary transition-colors hover:border-primary/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  if ("href" in sub) {
    return (
      <Link href={sub.href} className={className}>
        <span aria-hidden="true">{sub.emoji}</span> {sub.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => onQuery(sub.query)} className={className}>
      <span aria-hidden="true">{sub.emoji}</span> {sub.label}
    </button>
  );
}

/**
 * The home screen's category system: seven top-level categories, each
 * expanding into its full subcategory list — built ones route through
 * the exact same AI scan/result flow the old flat chips used, unbuilt
 * ones render honestly disabled instead of silently mis-parsing.
 */
export function CategoryAccordion({ onQuery }: { onQuery: (query: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mt-3 flex flex-col gap-2">
      {CATEGORIES.map((category) => {
        const open = openId === category.id;
        const builtCount = category.subcategories.filter((s) => !("comingSoon" in s)).length;
        return (
          <div
            key={category.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface-2/30"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : category.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset"
            >
              <span className="flex items-center gap-2.5">
                <span aria-hidden="true" className="text-lg">
                  {category.emoji}
                </span>
                <span className="text-sm font-semibold text-ink">{category.label}</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                  {builtCount}/{category.subcategories.length}
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn("size-4 shrink-0 text-ink-muted transition-transform duration-200", open && "rotate-180")}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <div className="flex flex-wrap gap-2 px-4 pb-4 pt-1">
                    {category.subcategories.map((sub) => (
                      <SubCategoryChip key={sub.id} sub={sub} onQuery={onQuery} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
