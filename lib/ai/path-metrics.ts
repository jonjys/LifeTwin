import type { PathMetrics } from "@/lib/types";

const DIMENSION_KEYS: ReadonlyArray<keyof PathMetrics> = [
  "health",
  "money",
  "confidence",
  "productivity",
  "mood",
];

export function averageOf(path: PathMetrics): number {
  return DIMENSION_KEYS.reduce((sum, key) => sum + path[key], 0) / DIMENSION_KEYS.length;
}

/** The dimension with the widest gap between today and the LifeTwin path. */
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
