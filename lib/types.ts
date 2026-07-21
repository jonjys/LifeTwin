/** The five life dimensions LifeTwin simulates. */
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
  insight: string;
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
