"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BLOCKER_SUGGESTIONS, GOAL_SUGGESTIONS } from "@/lib/constants";
import { createState } from "@/lib/storage";
import { cn } from "@/lib/utils";

const GENERATING_STEPS = [
  "Analyzing your patterns…",
  "Simulating 12 months ahead…",
  "Rendering your future…",
];

const stepMotion = {
  initial: { opacity: 0, x: 48 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -48 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

function SuggestionChips({
  options,
  value,
  onSelect,
}: {
  options: readonly string[];
  value: string;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={cn(
            "rounded-2xl border px-5 py-3.5 text-sm font-medium transition-all duration-200",
            value === option
              ? "border-primary/60 bg-primary/10 text-primary shadow-glow-sm"
              : "glass text-ink-secondary hover:border-white/20 hover:text-ink"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [blocker, setBlocker] = useState("");
  const [situation, setSituation] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);

  useEffect(() => {
    if (!generating) return;
    const interval = window.setInterval(
      () => setGeneratingStep((s) => Math.min(s + 1, GENERATING_STEPS.length - 1)),
      900
    );
    const done = window.setTimeout(() => {
      createState({
        goal,
        blocker,
        situation: situation.trim(),
        createdAt: new Date().toISOString(),
      });
      router.push("/dashboard");
    }, 2900);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(done);
    };
  }, [generating, goal, blocker, situation, router]);

  const select = (setter: (v: string) => void) => (option: string) => {
    setter(option);
    window.setTimeout(() => setStep((s) => s + 1), 350);
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-6">
      <AmbientBackground />

      {/* Step progress */}
      <div className="mx-auto mt-10 flex w-full max-w-lg items-center gap-3">
        {step > 0 && !generating && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="text-ink-muted transition-colors hover:text-ink"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <div className="flex flex-1 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]"
            >
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: step >= i ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center py-16">
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                className="mb-10 flex size-20 items-center justify-center rounded-full border border-primary/30 shadow-glow"
              >
                <Sparkles className="size-8 text-primary" />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={generatingStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="text-xl font-medium text-ink-secondary"
                >
                  {GENERATING_STEPS[generatingStep]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : step === 0 ? (
            <motion.div
              key="step-0"
              {...stepMotion}
              className="w-full max-w-2xl text-center"
            >
              <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                What do you want to achieve within one year?
              </h1>
              <div className="mt-12">
                <SuggestionChips
                  options={GOAL_SUGGESTIONS}
                  value={goal}
                  onSelect={select(setGoal)}
                />
              </div>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step-1"
              {...stepMotion}
              className="w-full max-w-2xl text-center"
            >
              <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                What currently holds you back?
              </h1>
              <div className="mt-12">
                <SuggestionChips
                  options={BLOCKER_SUGGESTIONS}
                  value={blocker}
                  onSelect={select(setBlocker)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              {...stepMotion}
              className="w-full max-w-xl text-center"
            >
              <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                Describe your current situation.
              </h1>
              <div className="mt-10">
                <Textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="A few honest sentences about where you are right now…"
                  autoFocus
                />
              </div>
              <Button
                size="xl"
                className="mt-8"
                disabled={situation.trim().length < 3}
                onClick={() => setGenerating(true)}
              >
                Generate My Future
                <ArrowRight />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
