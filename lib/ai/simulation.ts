import type { PathMetrics, UserProfile } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { between } from "@/lib/ai/seeded";
import {
  detectBlocker,
  detectGoalTheme,
  type BlockerKind,
  type GoalTheme,
} from "@/lib/ai/themes";

/**
 * The believable part of the simulation: your blocker drags specific
 * dimensions down today, your goal lifts specific dimensions in the
 * future — and every completed quest bends the current path upward.
 */

/** What each blocker costs the current path. */
const BLOCKER_PENALTIES: Record<BlockerKind, Partial<PathMetrics>> = {
  procrastination: { productivity: -14, confidence: -6 },
  socialMedia: { productivity: -10, mood: -8, health: -4 },
  sleep: { health: -12, mood: -10, productivity: -6 },
  focus: { productivity: -12, confidence: -6, mood: -4 },
  routines: { health: -8, productivity: -8, mood: -6 },
  general: { productivity: -8, mood: -4 },
};

/** What each goal amplifies on the LifeTwin path. */
const GOAL_BOOSTS: Record<GoalTheme, Partial<PathMetrics>> = {
  startup: { money: 12, productivity: 10, confidence: 8 },
  money: { money: 14, confidence: 6, productivity: 4 },
  health: { health: 14, mood: 8, confidence: 4 },
  language: { confidence: 8, productivity: 6, mood: 6 },
  happiness: { mood: 14, confidence: 8, health: 4 },
  general: { confidence: 6, productivity: 6 },
};

const NEGATIVE_WORDS = [
  "tired", "stressed", "stuck", "overwhelmed", "burn", "anxious",
  "exhausted", "lost", "unmotivated",
];
const POSITIVE_WORDS = [
  "excited", "motivated", "ready", "hopeful", "determined", "optimistic",
];

const DIMENSION_KEYS: ReadonlyArray<keyof PathMetrics> = [
  "health", "money", "confidence", "productivity", "mood",
];

function applyAdjustment(
  path: PathMetrics,
  adjustment: Partial<PathMetrics>
): void {
  for (const key of DIMENSION_KEYS) {
    const delta = adjustment[key];
    if (delta) path[key] += delta;
  }
}

export function derivePaths(
  profile: UserProfile,
  completions: number
): { currentPath: PathMetrics; futurePath: PathMetrics } {
  const seed = `${profile.goal}|${profile.blocker}|${profile.createdAt}`;
  const theme = detectGoalTheme(profile.goal);
  const blocker = detectBlocker(profile.blocker);
  const situation = profile.situation.toLowerCase();

  // Today: modest baseline, dented by the blocker and colored by the
  // words the user chose to describe their situation.
  const currentPath: PathMetrics = {
    health: between(`${seed}:c-health`, 42, 56),
    money: between(`${seed}:c-money`, 40, 54),
    confidence: between(`${seed}:c-confidence`, 42, 56),
    productivity: between(`${seed}:c-productivity`, 42, 56),
    mood: between(`${seed}:c-mood`, 44, 58),
  };
  applyAdjustment(currentPath, BLOCKER_PENALTIES[blocker]);
  if (NEGATIVE_WORDS.some((w) => situation.includes(w))) {
    applyAdjustment(currentPath, { mood: -5, health: -3 });
  }
  if (POSITIVE_WORDS.some((w) => situation.includes(w))) {
    applyAdjustment(currentPath, { confidence: 5, mood: 3 });
  }

  // The LifeTwin path: clearly better, amplified where the goal lives —
  // inspiring, never a fantasy.
  const futurePath: PathMetrics = {
    health: between(`${seed}:f-health`, 72, 82),
    money: between(`${seed}:f-money`, 70, 80),
    confidence: between(`${seed}:f-confidence`, 72, 82),
    productivity: between(`${seed}:f-productivity`, 72, 82),
    mood: between(`${seed}:f-mood`, 74, 84),
  };
  applyAdjustment(futurePath, GOAL_BOOSTS[theme]);

  // Every completed quest bends today's path toward the future one.
  const lift = Math.min(completions, 10);

  for (const key of DIMENSION_KEYS) {
    futurePath[key] = clamp(futurePath[key], 68, 96);
    currentPath[key] = clamp(
      currentPath[key] + lift,
      15,
      futurePath[key] - 8
    );
  }

  return { currentPath, futurePath };
}

export function averageOf(path: PathMetrics): number {
  return (
    DIMENSION_KEYS.reduce((sum, key) => sum + path[key], 0) /
    DIMENSION_KEYS.length
  );
}

/** The current dimension with the most room to grow — insights cite it. */
export function weakestDimension(
  currentPath: PathMetrics,
  futurePath: PathMetrics
): keyof PathMetrics {
  let weakest: keyof PathMetrics = DIMENSION_KEYS[0];
  let widest = -Infinity;
  for (const key of DIMENSION_KEYS) {
    const gap = futurePath[key] - currentPath[key];
    if (gap > widest) {
      widest = gap;
      weakest = key;
    }
  }
  return weakest;
}
