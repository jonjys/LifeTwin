import { detectGoalTheme, goalPhrase } from "@/lib/ai/themes";
import type {
  FutureOpportunity,
  FutureRisk,
  LifeCategory,
  LifeMetrics,
} from "@/lib/engine/types";

/** Which category best represents "progress toward the stated goal". */
function goalCategory(goal: string): LifeCategory {
  const theme = detectGoalTheme(goal);
  switch (theme) {
    case "startup":
      return "career";
    case "health":
      return "health";
    case "language":
    case "happiness":
      return "confidence";
    default:
      return "money";
  }
}

/**
 * Trajectory, not alarm: what happens if nothing changes from here.
 * Capped at two so the card stays calm, and every line is a projection
 * of the current path — never a judgment of the person.
 */
export function generateRisks(
  goal: string,
  metrics: LifeMetrics,
  completions: number
): FutureRisk[] {
  const candidates: { priority: number; text: string }[] = [];

  if (metrics.stress >= 60) {
    candidates.push({
      priority: 1,
      text: "Stress has been trending upward — unchanged, that raises the risk of burnout.",
    });
  }
  if (metrics.money <= 52) {
    candidates.push({
      priority: 2,
      text: "At this pace, savings growth stays close to flat.",
    });
  }
  const goalCat = goalCategory(goal);
  if (goalCat !== "money" && metrics[goalCat] <= 52) {
    candidates.push({
      priority: 2,
      text: `${goalPhrase(goal)} could slip by several months if nothing changes.`,
    });
  }
  if (completions === 0) {
    candidates.push({
      priority: 3,
      text: "The longer the first quest waits, the more this timeline drifts.",
    });
  }

  if (candidates.length === 0) {
    return [{ text: "No warning signs right now — the current trajectory looks steady." }];
  }

  return candidates
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2)
    .map((c) => ({ text: c.text }));
}

/**
 * Positive momentum, only claimed when the numbers actually support it —
 * no fabricated percentages, just what the engine can honestly see.
 */
export function generateOpportunities(
  goal: string,
  metrics: LifeMetrics,
  completions: number
): FutureOpportunity[] {
  if (completions === 0) {
    return [
      {
        text: "Day one is the highest-leverage day you'll have — small quests compound fastest early.",
      },
    ];
  }

  const candidates: { priority: number; text: string }[] = [];
  if (completions >= 3) {
    candidates.push({
      priority: 1,
      text: `Your consistency is compounding — ${completions} quests logged and counting.`,
    });
  }
  if (metrics.confidence >= 65 || metrics.career >= 65) {
    candidates.push({
      priority: 1,
      text: `You're entering a high-growth window for ${goalPhrase(goal)}.`,
    });
  }
  candidates.push({
    priority: 2,
    text: "This month could change everything if you keep this pace.",
  });

  return candidates
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2)
    .map((c) => ({ text: c.text }));
}
