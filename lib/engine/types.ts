/**
 * The Life Engine's vocabulary. This module is intentionally UI-agnostic:
 * it knows nothing about React, localStorage, or how numbers get painted
 * on screen — only about a person's life as a small system of categories
 * that influence one another.
 */

export const LIFE_CATEGORIES = [
  "health",
  "energy",
  "money",
  "career",
  "relationships",
  "happiness",
  "confidence",
  "stress",
  "focus",
  "time",
] as const;

export type LifeCategory = (typeof LIFE_CATEGORIES)[number];

/** 0–100 per category. For every category except `stress`, higher is better. */
export type LifeMetrics = Record<LifeCategory, number>;

export type EngineInput = {
  goal: string;
  blocker: string;
  situation: string;
  /** Total quests ever completed — the engine's sole notion of "effort applied". */
  completions: number;
  /** Local date key (YYYY-MM-DD) — seeds the day's narrative variety. */
  dateKey: string;
};

export type NarrativeProjections = {
  /** e.g. "Estimated launch", "Projected fitness milestone". */
  milestoneLabel: string;
  /** e.g. "June 2027". */
  milestoneDate: string;
  /** 0–100: likelihood of reaching the stated goal. */
  probability: number;
  /** A believable absolute figure, in SEK. */
  savingsSEK: number;
  /** 0–100, lower is better. */
  stress: number;
  /** 0–100, higher is better. */
  confidence: number;
};

export type FutureEvent = {
  /** Months from today. */
  month: number;
  text: string;
};

export type FutureRisk = { text: string };
export type FutureOpportunity = { text: string };

export type EngineOutput = {
  /** Today, given every quest completed so far. */
  metrics: LifeMetrics;
  /** A believable 12-month ceiling for this person — "where they could be". */
  ceiling: LifeMetrics;
  projections: NarrativeProjections;
  events: FutureEvent[];
  risks: FutureRisk[];
  opportunities: FutureOpportunity[];
};
