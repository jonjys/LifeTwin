import type {
  FutureOpportunity,
  FutureRisk,
  NarrativeProjections,
} from "@/lib/engine/types";
import type { FutureMemory, MemoryCategory } from "@/lib/future-engine/types";

export type {
  FutureOpportunity,
  FutureRisk,
  NarrativeProjections,
  FutureMemory,
  MemoryCategory,
};

/** The five life dimensions the dashboard visualizes side by side. */
export type PathMetrics = {
  health: number;
  money: number;
  confidence: number;
  productivity: number;
  mood: number;
};

/** The result of one future simulation, as returned by any AIService. */
export type FutureSimulation = {
  futureScore: number;
  twinSync: number;
  currentPath: PathMetrics;
  futurePath: PathMetrics;
  quest: string;
  /** Why today's quest was chosen (e.g. "Counters procrastination"). */
  questFocus?: string;
  insight: string;
  /** The Life Engine's concrete, believable projections. */
  projections: NarrativeProjections;
  risks: FutureRisk[];
  opportunities: FutureOpportunity[];
  /** The Future Engine's living moments — the emotional layer. */
  memories: FutureMemory[];
  /** One evolving paragraph: life, one year from today. */
  story: string;
};

/** What the user told us during onboarding. */
export type UserProfile = {
  goal: string;
  blocker: string;
  situation: string;
  createdAt: string;
};

/** One recorded day of the user's future score, used for day-over-day deltas. */
export type ScoreEntry = {
  date: string;
  futureScore: number;
};

/** Everything LifeTwin persists locally. */
export type TwinState = {
  profile: UserProfile;
  /** Permanent score gains earned by completing quests. */
  scoreBoost: number;
  /** Permanent sync gains earned by completing quests. */
  syncBoost: number;
  /** ISO date (YYYY-MM-DD) of the last completed quest. */
  lastCompletedDate: string | null;
  /** Total quests ever completed. */
  completions: number;
  history: ScoreEntry[];
};
