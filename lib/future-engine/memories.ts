import { between, pick } from "@/lib/ai/seeded";
import { detectGoalTheme, type GoalTheme } from "@/lib/ai/themes";
import { addMonths, clamp, formatMonthYear } from "@/lib/utils";
import type { LifeMetrics } from "@/lib/engine/types";
import type { FutureMemory } from "@/lib/future-engine/types";

/**
 * Five moments, each grounded in a different life category the Life
 * Engine already tracks for every user — not five random guesses, but
 * five different lenses on the same trajectory. The career moment is
 * shaped by the user's stated goal; the rest are universal, since we
 * have no honest signal to personalize them further than that.
 */
const CAREER_MEMORY: Record<GoalTheme, { title: string; description: string }> = {
  startup: {
    title: "Your Startup Launch",
    description: "You're standing outside the office after signing your first client.",
  },
  money: {
    title: "Debt-Free Milestone",
    description: "You check your account and realize every debt is finally gone.",
  },
  health: {
    title: "A New Level of Strength",
    description: "You finish a workout that would have broken you a year ago — and feel great.",
  },
  language: {
    title: "Your First Real Conversation",
    description: "You realize halfway through that you stopped translating in your head.",
  },
  happiness: {
    title: "A Genuinely Good Day",
    description: "You catch yourself smiling for no particular reason, and it doesn't feel rare anymore.",
  },
  general: {
    title: "A Turning Point",
    description: "You realize the version of you from today feels far away.",
  },
};

const FINANCE_TITLES = ["A Number You'll Remember", "Room to Breathe"] as const;

const HEALTH_MEMORY = [
  {
    title: "Feeling Like Yourself Again",
    description: "You wake up without dreading the day — your energy is just there.",
  },
  {
    title: "Stronger Than You Think",
    description: "You catch your reflection and notice a version of yourself you'd almost forgotten.",
  },
] as const;

const RELATIONSHIPS_MEMORY = [
  {
    title: "A Conversation That Matters",
    description: "Someone close to you says they've noticed the change before you even mention it.",
  },
  {
    title: "Showing Up Differently",
    description: "You're present in a way that used to feel impossible — and people notice.",
  },
] as const;

const REFLECTION_MEMORY = [
  {
    title: "Looking Back",
    description: "You look back and realize today's small habits changed everything.",
  },
  {
    title: "How Far You've Come",
    description: "You scroll back through where you started and barely recognize that version of you.",
  },
] as const;

function confidenceFrom(value: number): number {
  return clamp(Math.round(15 + value * 0.85), 12, 97);
}

/** A believable "you crossed this number" figure, months into the future. */
function sekMilestone(
  seed: string,
  metrics: LifeMetrics,
  ceiling: LifeMetrics,
  monthsOut: number
): number {
  const baseSavings = between(`${seed}:savings`, 80_000, 220_000);
  const blend = clamp(monthsOut / 12, 0, 1);
  const projectedMoney = metrics.money + (ceiling.money - metrics.money) * blend;
  const scale = 0.55 + (projectedMoney / 100) * 0.9;
  return Math.round((baseSavings * scale) / 5000) * 5000;
}

/**
 * Five future memories, one per life category, sorted chronologically.
 * Confidence is computed from *that category's own* trajectory, so
 * different quests move different cards by different amounts — exactly
 * the differentiated, causal feel the influence graph already produces.
 */
export function generateFutureMemories(
  goal: string,
  blocker: string,
  seed: string,
  dateKey: string,
  completions: number,
  metrics: LifeMetrics,
  ceiling: LifeMetrics
): FutureMemory[] {
  const theme = detectGoalTheme(goal);
  const bucket = Math.min(Math.floor(completions / 2), 5);
  const variantSeed = `${seed}|${blocker}|${dateKey}:${bucket}`;

  const career = CAREER_MEMORY[theme];
  const financeTitle = pick(`${variantSeed}:finance-title`, FINANCE_TITLES);
  const sek = sekMilestone(seed, metrics, ceiling, 8);
  const health = pick(`${variantSeed}:health`, HEALTH_MEMORY);
  const relationships = pick(`${variantSeed}:relationships`, RELATIONSHIPS_MEMORY);
  const reflection = pick(`${variantSeed}:reflection`, REFLECTION_MEMORY);

  return [
    {
      id: "career",
      date: formatMonthYear(addMonths(dateKey, 5)),
      title: career.title,
      description: career.description,
      confidence: confidenceFrom(metrics.career),
      category: "career",
    },
    {
      id: "health",
      date: formatMonthYear(addMonths(dateKey, 6)),
      title: health.title,
      description: health.description,
      confidence: confidenceFrom(metrics.health),
      category: "health",
    },
    {
      id: "finance",
      date: formatMonthYear(addMonths(dateKey, 8)),
      title: financeTitle,
      description: `Your savings account crosses ${sek.toLocaleString("en-US")} SEK for the first time.`,
      confidence: confidenceFrom(metrics.money),
      category: "finance",
    },
    {
      id: "relationships",
      date: formatMonthYear(addMonths(dateKey, 9)),
      title: relationships.title,
      description: relationships.description,
      confidence: confidenceFrom(metrics.relationships),
      category: "relationships",
    },
    {
      id: "reflection",
      date: formatMonthYear(addMonths(dateKey, 14)),
      title: reflection.title,
      description: reflection.description,
      confidence: confidenceFrom(Math.round((metrics.confidence + metrics.happiness) / 2)),
      category: "growth",
    },
  ];
}
