import { computeUserBaseline } from "@/lib/engine/baseline";
import { propagate } from "@/lib/engine/graph";
import { LIFE_CATEGORIES, type LifeMetrics } from "@/lib/engine/types";

/** Completions beyond this stop adding further ripple — habits plateau. */
const MAX_EFFECTIVE_COMPLETIONS = 15;

export type MetricsResult = {
  metrics: LifeMetrics;
  baseline: LifeMetrics;
  ceiling: LifeMetrics;
};

/**
 * The current state of a person's simulated life: their seeded baseline,
 * nudged by every quest they've completed — each nudge rippling through
 * the influence graph before settling, and always clamped between where
 * they started and where they could realistically get to.
 */
export function computeMetrics(
  goal: string,
  blocker: string,
  seed: string,
  completions: number
): MetricsResult {
  const { baseline, ceiling, directEffect } = computeUserBaseline(
    goal,
    blocker,
    seed
  );
  const rippleUnit = propagate(directEffect);
  const multiplier = Math.min(Math.max(completions, 0), MAX_EFFECTIVE_COMPLETIONS);

  const metrics = {} as LifeMetrics;
  for (const category of LIFE_CATEGORIES) {
    const target = baseline[category] + rippleUnit[category] * multiplier;
    const lo = Math.min(baseline[category], ceiling[category]);
    const hi = Math.max(baseline[category], ceiling[category]);
    metrics[category] = Math.round(Math.min(hi, Math.max(lo, target)));
  }

  return { metrics, baseline, ceiling };
}
