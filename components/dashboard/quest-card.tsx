"use client";

import { memo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Target } from "lucide-react";
import { celebrate } from "@/components/shared/confetti";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";

type QuestCardProps = {
  quest: string;
  done: boolean;
  justCompleted: boolean;
  onComplete: () => void;
};

/** The heart of the product: one action, one big button, one better future. */
export const QuestCard = memo(function QuestCard({
  quest,
  done,
  justCompleted,
  onComplete,
}: QuestCardProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleComplete = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      celebrate({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      });
    } else {
      celebrate();
    }
    onComplete();
  };

  return (
    <div
      className={`h-full rounded-3xl bg-gradient-to-br p-px shadow-card transition-shadow duration-700 ${
        done
          ? "from-success/40 via-white/10 to-success/20 shadow-glow-success"
          : "from-primary/40 via-white/10 to-success/25 shadow-glow-sm"
      }`}
    >
      <div className="relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-[calc(1.75rem-1px)] bg-[#0A0A10]/95 p-6 backdrop-blur-xl sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/[0.08] blur-3xl"
        />

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Target className="size-4" />
            Today&apos;s Future Quest
          </span>
        </div>

        <div>
          <p className="max-w-xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {quest}
          </p>
          <p className="mt-4 text-sm text-ink-muted sm:text-base">
            One small action today. A different you in 12 months.
          </p>
        </div>

        <div className="relative">
          <AnimatePresence>
            {justCompleted && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
                className="mb-4 text-sm font-semibold text-success"
              >
                Your future just improved.
              </motion.p>
            )}
          </AnimatePresence>

          {done ? (
            <motion.div
              initial={justCompleted ? { scale: 0.92 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <Button size="xl" variant="success" disabled className="w-full sm:w-auto sm:min-w-72">
                <Check strokeWidth={3} />
                Completed
              </Button>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="w-full sm:w-fit"
            >
              <Button
                ref={buttonRef}
                size="xl"
                className="w-full sm:w-auto sm:min-w-72"
                onClick={handleComplete}
              >
                Complete Quest
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});
