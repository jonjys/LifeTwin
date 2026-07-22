"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import type { FutureEvent } from "@/lib/types";

type FutureEventsProps = {
  events: FutureEvent[];
};

/** "In 4 months you're likely to…" — the future as specific moments. */
export const FutureEvents = memo(function FutureEvents({
  events,
}: FutureEventsProps) {
  return (
    <Card className="flex h-full flex-col gap-6">
      <CardTitle>Future Events</CardTitle>

      <div className="relative flex flex-col gap-6">
        <div
          aria-hidden
          className="absolute bottom-2 left-[15px] top-2 w-px bg-gradient-to-b from-primary/50 via-border to-transparent"
        />
        {events.map((event, i) => (
          <motion.div
            key={`${event.month}-${event.text}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: EASE }}
            className="relative flex gap-4 pl-0"
          >
            <div className="relative z-10 flex size-[31px] shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background">
              <Sparkle className="size-3.5 text-primary" />
            </div>
            <div className="pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                In {event.month} months
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                you&apos;re likely to {event.text}.
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});
