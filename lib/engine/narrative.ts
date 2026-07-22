import { between } from "@/lib/ai/seeded";
import { detectGoalTheme, type GoalTheme } from "@/lib/ai/themes";
import type { LifeMetrics, NarrativeProjections } from "@/lib/engine/types";

const MILESTONE_LABEL: Record<GoalTheme, string> = {
  startup: "Estimated launch",
  money: "Savings goal ETA",
  health: "Fitness milestone",
  language: "Fluency milestone",
  happiness: "Turning point",
  general: "Next milestone",
};

function average(metrics: LifeMetrics, keys: (keyof LifeMetrics)[]): number {
  return keys.reduce((sum, k) => sum + metrics[k], 0) / keys.length;
}

function addMonths(dateKey: string, months: number): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1 + months, d);
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Turns raw metrics into the concrete, believable numbers a person reads
 * as "my future changed" — a date, a probability, a currency figure.
 * Deterministic and seeded, so the same profile on the same day with the
 * same completion count always projects the same future.
 */
export function computeProjections(
  goal: string,
  seed: string,
  dateKey: string,
  metrics: LifeMetrics
): NarrativeProjections {
  const theme = detectGoalTheme(goal);

  const baseMonths = between(`${seed}:months`, 14, 26);
  const progress = average(metrics, [
    "confidence",
    "career",
    "money",
    "focus",
    "happiness",
  ]) / 100;
  const monthsRemaining = Math.min(
    30,
    Math.max(1, Math.round(baseMonths * (1 - progress * 0.55)))
  );
  const milestoneDate = formatMonthYear(addMonths(dateKey, monthsRemaining));

  const probabilityInput = average(metrics, [
    "confidence",
    "career",
    "money",
    "focus",
    "happiness",
  ]);
  const probability = Math.min(97, Math.max(12, Math.round(15 + probabilityInput * 0.85)));

  const baseSavings = between(`${seed}:savings`, 80_000, 220_000);
  const savingsScale = 0.55 + (metrics.money / 100) * 0.9;
  const savingsSEK = Math.round((baseSavings * savingsScale) / 1000) * 1000;

  return {
    milestoneLabel: MILESTONE_LABEL[theme],
    milestoneDate,
    probability,
    savingsSEK,
    stress: metrics.stress,
    confidence: metrics.confidence,
  };
}
