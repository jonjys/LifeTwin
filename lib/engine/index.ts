import { computeMetrics } from "@/lib/engine/metrics";
import { computeProjections } from "@/lib/engine/narrative";
import { generateOpportunities, generateRisks } from "@/lib/engine/outlook";
import type { EngineInput, EngineOutput, LifeMetrics } from "@/lib/engine/types";
import type { PathMetrics } from "@/lib/types";

export type {
  EngineInput,
  EngineOutput,
  LifeCategory,
  LifeMetrics,
  FutureRisk,
  FutureOpportunity,
  NarrativeProjections,
} from "@/lib/engine/types";

/**
 * The Life Engine's single entry point. Pure and synchronous: same input,
 * same output, every time — nothing here knows this is a web app. A real
 * AI integration can call this for grounded numbers and only replace the
 * prose (risks/opportunities text) with generated language, since every
 * number it needs is already sitting in `metrics` and `ceiling`.
 */
export function runLifeEngine(input: EngineInput): EngineOutput {
  const seed = `${input.goal}|${input.blocker}|${input.situation}`;
  const { metrics, ceiling } = computeMetrics(
    input.goal,
    input.blocker,
    seed,
    input.completions
  );

  return {
    metrics,
    ceiling,
    projections: computeProjections(input.goal, seed, input.dateKey, metrics),
    risks: generateRisks(input.goal, metrics, input.completions),
    opportunities: generateOpportunities(input.goal, metrics, input.completions),
  };
}

/**
 * Adapts the engine's 10 life categories onto the 5 dimensions the
 * dashboard's Future Paths / Timeline cards already visualize.
 */
export function toPathMetrics(metrics: LifeMetrics): PathMetrics {
  return {
    health: metrics.health,
    money: metrics.money,
    confidence: metrics.confidence,
    productivity: Math.round((metrics.focus + metrics.career) / 2),
    mood: metrics.happiness,
  };
}
