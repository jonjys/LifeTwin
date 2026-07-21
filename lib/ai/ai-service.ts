import type { FutureSimulation, PathMetrics, UserProfile } from "@/lib/types";
import { clamp } from "@/lib/utils";

/**
 * Everything a simulation needs beyond the static profile:
 * where the user is on their journey right now.
 */
export type SimulationContext = {
  /** Local date key (YYYY-MM-DD) — quests and insights rotate daily. */
  dateKey: string;
  /** Permanent score gains earned by completing quests. */
  scoreBoost: number;
  /** Permanent sync gains earned by completing quests. */
  syncBoost: number;
  /** Total quests ever completed. */
  completions: number;
};

/**
 * The AI abstraction layer.
 *
 * LifeTwin talks to this interface only — never to a provider directly.
 * To plug in a real model (Claude, OpenAI, Grok), implement this interface
 * (e.g. `ClaudeAIService`), build a prompt from the profile + context,
 * parse the model output into a `FutureSimulation`, and swap the
 * implementation returned by `getAIService()`.
 */
export interface AIService {
  simulate(
    profile: UserProfile,
    context: SimulationContext
  ): Promise<FutureSimulation>;
}

/* ------------------------------------------------------------------ */
/* Deterministic mock implementation                                   */
/* ------------------------------------------------------------------ */

/** Small deterministic string hash (FNV-1a). */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic pseudo-random in [0, 1) derived from a seed string. */
function unit(seed: string): number {
  return hash(seed) / 0xffffffff;
}

/** Deterministic integer in [min, max] derived from a seed string. */
function between(seed: string, min: number, max: number): number {
  return Math.round(min + unit(seed) * (max - min));
}

function pick<T>(seed: string, pool: readonly T[]): T {
  return pool[hash(seed) % pool.length];
}

const GENERIC_QUESTS = [
  "Walk for 20 minutes",
  "Read 10 pages",
  "Work focused for 30 minutes",
  "Skip one unnecessary purchase",
  "Meditate for 5 minutes",
  "Write down tomorrow's single priority",
  "Drink water instead of one snack",
  "Go to bed 30 minutes earlier tonight",
] as const;

const QUESTS_BY_THEME: Record<string, readonly string[]> = {
  startup: [
    "Work focused for 30 minutes on your startup",
    "Write down one idea that could earn money",
    "Send one message that moves your project forward",
  ],
  money: [
    "Skip one unnecessary purchase",
    "Review yesterday's spending for 5 minutes",
    "Move a small amount into savings today",
  ],
  health: [
    "Walk for 20 minutes",
    "Drink water instead of one snack",
    "Do 10 minutes of stretching",
  ],
  language: [
    "Practice your language for 15 minutes",
    "Learn 5 new words today",
    "Listen to 10 minutes of native audio",
  ],
  happiness: [
    "Meditate for 5 minutes",
    "Write down three things that went well",
    "Take a 15 minute walk without your phone",
  ],
};

const INSIGHTS = [
  "If you continue this pace you'll likely reach your goal three months earlier.",
  "Your biggest opportunity isn't working harder—it's reducing distractions.",
  "Small daily wins compound. One quest a day moves your 12-month outcome more than any single sprint.",
  "Your future self is built on mornings. Protect the first hour of your day.",
  "Consistency beats intensity. Showing up today matters more than being perfect tomorrow.",
  "Cutting one distraction this week would raise your projected score faster than adding new habits.",
  "You're closer to your LifeTwin path than most people ever get. Keep the streak alive.",
] as const;

function themeFor(goal: string): keyof typeof QUESTS_BY_THEME | null {
  const g = goal.toLowerCase();
  if (g.includes("startup") || g.includes("business")) return "startup";
  if (g.includes("money") || g.includes("save")) return "money";
  if (g.includes("health") || g.includes("fit")) return "health";
  if (g.includes("language") || g.includes("learn")) return "language";
  if (g.includes("happ")) return "happiness";
  return null;
}

/**
 * Deterministic mock: the same profile on the same day always produces the
 * same simulation, so the product feels stable — while quests and insights
 * rotate day to day and completed quests permanently lift the numbers.
 */
export class MockAIService implements AIService {
  async simulate(
    profile: UserProfile,
    context: SimulationContext
  ): Promise<FutureSimulation> {
    const p = `${profile.goal}|${profile.blocker}|${profile.createdAt}`;
    const day = `${p}|${context.dateKey}`;

    // Where the user's current habits point — modest, uneven numbers.
    const currentPath: PathMetrics = {
      health: between(`${p}:c-health`, 32, 58),
      money: between(`${p}:c-money`, 30, 55),
      confidence: between(`${p}:c-confidence`, 34, 56),
      productivity: between(`${p}:c-productivity`, 30, 52),
      mood: between(`${p}:c-mood`, 36, 60),
    };

    // Where the LifeTwin path leads — clearly better, but believable.
    const futurePath: PathMetrics = {
      health: between(`${p}:f-health`, 78, 94),
      money: between(`${p}:f-money`, 74, 92),
      confidence: between(`${p}:f-confidence`, 80, 95),
      productivity: between(`${p}:f-productivity`, 76, 93),
      mood: between(`${p}:f-mood`, 80, 96),
    };

    const baseScore = between(`${p}:score`, 64, 76);
    const baseSync = between(`${p}:sync`, 56, 68);

    const theme = themeFor(profile.goal);
    const questPool = theme
      ? [...QUESTS_BY_THEME[theme], ...GENERIC_QUESTS]
      : GENERIC_QUESTS;

    return {
      futureScore: clamp(baseScore + context.scoreBoost, 0, 99),
      twinSync: clamp(baseSync + context.syncBoost, 0, 99),
      currentPath,
      futurePath,
      quest: pick(`${day}:quest`, questPool),
      insight: pick(`${day}:insight`, INSIGHTS),
    };
  }
}

let service: AIService | null = null;

/**
 * The single place the app gets its AI from.
 * Swap `MockAIService` for a real provider implementation here.
 */
export function getAIService(): AIService {
  if (!service) service = new MockAIService();
  return service;
}
