"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Target } from "lucide-react";
import { celebrate } from "@/components/shared/confetti";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type QuestCardProps = {
  quest: string;
  done: boolean;
  justCompleted: boolean;
  onComplete: () => void;
};

export function QuestCard({
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
    <Card className="relative flex h-full flex-col justify-between gap-6 overflow-hidden border-primary/25">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="flex items-center justify-between">
        <CardTitle className="text-primary">
          Today&apos;s Future Quest
        </CardTitle>
        <Target className="size-4 text-primary" />
      </div>

      <p className="text-balance text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
        {quest}
      </p>

      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {justCompleted && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm font-medium text-success"
            >
              Your future just improved.
            </motion.p>
          )}
        </AnimatePresence>

        {done ? (
          <Button size="lg" variant="success" disabled className="w-full">
            <Check />
            Completed
          </Button>
        ) : (
          <Button
            ref={buttonRef}
            size="lg"
            className="w-full"
            onClick={handleComplete}
          >
            Complete Quest
          </Button>
        )}
      </div>
    </Card>
  );
}
