import { between } from "@/lib/ai/seeded";
import {
  detectBlocker,
  detectGoalTheme,
  type BlockerKind,
  type GoalTheme,
} from "@/lib/ai/themes";
import { LIFE_CATEGORIES, type LifeMetrics } from "@/lib/engine/types";

/**
 * Where the user's current habits leave them today, before any quest.
 * A believable, seeded baseline, dented by whatever they said holds
 * them back.
 */
const BLOCKER_BASELINE_PENALTY: Record<BlockerKind, Partial<LifeMetrics>> = {
  procrastination: { focus: -14, confidence: -6, stress: 8 },
  socialMedia: { focus: -10, happiness: -8, health: -4, stress: 6 },
  sleep: { health: -12, energy: -14, happiness: -6, stress: 10 },
  focus: { focus: -12, confidence: -6, happiness: -4, stress: 8 },
  routines: { health: -8, energy: -6, time: -8, stress: 6 },
  general: { focus: -8, happiness: -4, stress: 5 },
};

/** Where a year of consistency could realistically take them. */
const GOAL_CEILING_BOOST: Record<GoalTheme, Partial<LifeMetrics>> = {
  startup: { career: 10, money: 10, confidence: 6 },
  money: { money: 12, confidence: 4 },
  health: { health: 10, energy: 8, confidence: 3 },
  language: { confidence: 6, focus: 5, happiness: 3 },
  happiness: { happiness: 10, relationships: 6, confidence: 4 },
  general: { confidence: 4, happiness: 4 },
};

/**
 * What completing one quest directly touches, before the graph ripples it
 * further. Blocker-countering quests and goal-building quests both
 * contribute — the engine doesn't need to know which specific quest text
 * was shown today, only what kind of effort it represents.
 */
const BLOCKER_DIRECT_EFFECT: Record<BlockerKind, Partial<LifeMetrics>> = {
  procrastination: { focus: 3, confidence: 1.5 },
  socialMedia: { focus: 2, happiness: 1.5, health: 1 },
  sleep: { health: 3, energy: 2 },
  focus: { focus: 3, confidence: 1 },
  routines: { health: 1.5, time: 1.5, energy: 1 },
  general: { focus: 2 },
};

const GOAL_DIRECT_EFFECT: Record<GoalTheme, Partial<LifeMetrics>> = {
  startup: { career: 2, money: 1.5, confidence: 1 },
  money: { money: 2.5, confidence: 0.5 },
  health: { health: 2.5, energy: 1 },
  language: { confidence: 1.5, focus: 1 },
  happiness: { happiness: 2.5, relationships: 1 },
  general: { confidence: 1, happiness: 1 },
};

function baseVector(seed: string, low: number, high: number): LifeMetrics {
  return Object.fromEntries(
    LIFE_CATEGORIES.map((c) => [c, between(`${seed}:${c}`, low, high)])
  ) as LifeMetrics;
}

function applyAdjustment(
  metrics: LifeMetrics,
  adjustment: Partial<LifeMetrics>
): LifeMetrics {
  const next = { ...metrics };
  for (const category of LIFE_CATEGORIES) {
    const delta = adjustment[category];
    if (delta) next[category] += delta;
  }
  return next;
}

export type UserBaseline = {
  /** Today, with zero completions. */
  baseline: LifeMetrics;
  /** A believable 12-month ceiling for this person. */
  ceiling: LifeMetrics;
  /** What one completed quest directly nudges, before the graph ripples it. */
  directEffect: Partial<LifeMetrics>;
};

export function computeUserBaseline(
  goal: string,
  blocker: string,
  seed: string
): UserBaseline {
  const blockerKind = detectBlocker(blocker);
  const theme = detectGoalTheme(goal);

  let baseline = baseVector(`${seed}:base`, 44, 58);
  baseline = applyAdjustment(baseline, { stress: 14 }); // stress starts elevated, not neutral
  baseline = applyAdjustment(baseline, BLOCKER_BASELINE_PENALTY[blockerKind]);

  let ceiling = baseVector(`${seed}:ceil`, 74, 86);
  ceiling = applyAdjustment(ceiling, { stress: -46 }); // ceiling stress is low, not high
  ceiling = applyAdjustment(ceiling, GOAL_CEILING_BOOST[theme]);

  for (const category of LIFE_CATEGORIES) {
    baseline[category] = clampCategory(baseline[category]);
    ceiling[category] = clampCategory(ceiling[category]);
  }

  const directEffect: Partial<LifeMetrics> = { ...BLOCKER_DIRECT_EFFECT[blockerKind] };
  for (const [category, delta] of Object.entries(GOAL_DIRECT_EFFECT[theme])) {
    const key = category as keyof LifeMetrics;
    directEffect[key] = (directEffect[key] ?? 0) + delta;
  }

  return { baseline, ceiling, directEffect };
}

function clampCategory(value: number): number {
  return Math.min(97, Math.max(12, Math.round(value)));
}
