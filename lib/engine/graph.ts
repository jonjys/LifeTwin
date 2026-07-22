import type { LifeCategory, LifeMetrics } from "@/lib/engine/types";
import { LIFE_CATEGORIES } from "@/lib/engine/types";

/**
 * The influence graph: how a change in one category ripples into others.
 * A positive weight means a rise in `from` raises `to`; a negative weight
 * means a rise in `from` lowers `to` (this is how completing quests
 * eventually brings stress down, never by touching stress directly).
 *
 * This is the shape of the example in the spec:
 * health → energy → focus → career/money → stress → relationships/happiness
 */
const EDGES: ReadonlyArray<{ from: LifeCategory; to: LifeCategory; weight: number }> = [
  { from: "health", to: "energy", weight: 0.45 },
  { from: "energy", to: "focus", weight: 0.4 },
  { from: "energy", to: "happiness", weight: 0.15 },
  { from: "focus", to: "career", weight: 0.3 },
  { from: "focus", to: "money", weight: 0.25 },
  { from: "focus", to: "confidence", weight: 0.15 },
  { from: "career", to: "money", weight: 0.3 },
  { from: "career", to: "confidence", weight: 0.2 },
  { from: "money", to: "stress", weight: -0.3 },
  { from: "money", to: "time", weight: 0.15 },
  { from: "confidence", to: "career", weight: 0.2 },
  { from: "confidence", to: "relationships", weight: 0.25 },
  { from: "stress", to: "happiness", weight: -0.35 },
  { from: "stress", to: "relationships", weight: -0.25 },
  { from: "stress", to: "health", weight: -0.2 },
  { from: "relationships", to: "happiness", weight: 0.35 },
  { from: "happiness", to: "stress", weight: -0.2 },
  { from: "time", to: "relationships", weight: 0.25 },
  { from: "time", to: "health", weight: 0.2 },
  { from: "time", to: "stress", weight: -0.2 },
];

/**
 * Propagates a "direct effect" vector through the influence graph.
 * Each hop lets categories that just moved nudge the categories they're
 * connected to, decaying each step so the ripple settles rather than
 * blowing up. Returns the *total* effect (direct + every hop of ripple).
 */
export function propagate(
  directEffect: Partial<LifeMetrics>,
  hops = 3,
  decay = 0.55
): LifeMetrics {
  const total = zeroVector();
  let wave: Partial<LifeMetrics> = { ...directEffect };

  for (const category of LIFE_CATEGORIES) {
    total[category] += wave[category] ?? 0;
  }

  let strength = 1;
  for (let hop = 0; hop < hops; hop++) {
    strength *= decay;
    const next = zeroVector();
    for (const edge of EDGES) {
      const carried = wave[edge.from];
      if (!carried) continue;
      next[edge.to] += carried * edge.weight;
    }
    for (const category of LIFE_CATEGORIES) {
      total[category] += next[category] * strength;
    }
    wave = next;
  }

  return total;
}

function zeroVector(): LifeMetrics {
  return Object.fromEntries(
    LIFE_CATEGORIES.map((c) => [c, 0])
  ) as LifeMetrics;
}
