"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";

type FutureStoryProps = {
  story: string;
  changed: boolean;
};

/**
 * One paragraph, one year out — the emotional headline of the page.
 * Crossfades to a new telling whenever the underlying story changes,
 * so revisiting after progress reads as the future rewriting itself.
 */
export const FutureStory = memo(function FutureStory({
  story,
  changed,
}: FutureStoryProps) {
  return (
    <Card className="relative overflow-hidden border-primary/15">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-primary/[0.05] blur-3xl"
      />

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <BookOpen className="size-4" />
          </div>
          <div>
            <CardTitle>Future Story</CardTitle>
            <p className="text-xs text-ink-muted">One year from today</p>
          </div>
        </div>
        <AnimatePresence>
          {changed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.4, times: [0, 0.15, 0.75, 1] }}
              className="text-xs font-medium text-success"
            >
              rewritten
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={story}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-3xl text-balance text-xl font-medium leading-relaxed text-ink sm:text-2xl"
        >
          {story}
        </motion.p>
      </AnimatePresence>
    </Card>
  );
});
