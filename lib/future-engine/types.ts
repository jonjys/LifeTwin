import type { LifeMetrics } from "@/lib/engine/types";

/**
 * The Future Engine's vocabulary. Like the Life Engine, this is
 * UI-agnostic — it consumes numbers the Life Engine already computed and
 * produces narrative, never the other way around, so the two never
 * disagree about what "today" looks like.
 */

export const MEMORY_CATEGORIES = [
  "career",
  "finance",
  "health",
  "relationships",
  "growth",
] as const;

export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

export type FutureMemory = {
  id: string;
  /** e.g. "June 2027". */
  date: string;
  title: string;
  description: string;
  /** 0–100: how likely this moment is, given the current trajectory. */
  confidence: number;
  category: MemoryCategory;
};

export type FutureEngineInput = {
  goal: string;
  blocker: string;
  /** Identical to the seed the Life Engine used — keeps numbers consistent. */
  seed: string;
  dateKey: string;
  completions: number;
  metrics: LifeMetrics;
  ceiling: LifeMetrics;
};

export type FutureEngineOutput = {
  memories: FutureMemory[];
  /** One paragraph, describing life a year from today. Never identical
   *  twice in a row — it's reseeded by date and by progress. */
  story: string;
};
