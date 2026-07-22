/**
 * Maps free-form onboarding answers onto the themes the simulation
 * understands. Everything downstream (paths, quests, insights, timeline
 * stories) is personalized through these two detections.
 */

export type GoalTheme =
  | "startup"
  | "money"
  | "health"
  | "language"
  | "happiness"
  | "general";

export type BlockerKind =
  | "procrastination"
  | "socialMedia"
  | "sleep"
  | "focus"
  | "routines"
  | "general";

export function detectGoalTheme(goal: string): GoalTheme {
  const g = goal.toLowerCase();
  if (g.includes("startup") || g.includes("business")) return "startup";
  if (g.includes("money") || g.includes("save")) return "money";
  if (g.includes("health") || g.includes("fit")) return "health";
  if (g.includes("language") || g.includes("learn")) return "language";
  if (g.includes("happ")) return "happiness";
  return "general";
}

export function detectBlocker(blocker: string): BlockerKind {
  const b = blocker.toLowerCase();
  if (b.includes("procrastinat")) return "procrastination";
  if (b.includes("social") || b.includes("phone") || b.includes("scroll"))
    return "socialMedia";
  if (b.includes("sleep")) return "sleep";
  if (b.includes("focus")) return "focus";
  if (b.includes("routine")) return "routines";
  return "general";
}

/** How the goal reads inside a sentence: "…moves {goalPhrase} closer." */
const GOAL_PHRASES: Record<GoalTheme, string> = {
  startup: "your startup",
  money: "your savings",
  health: "your health",
  language: "your new language",
  happiness: "a happier you",
  general: "your goal",
};

/** How the blocker reads inside a sentence. */
const BLOCKER_PHRASES: Record<BlockerKind, string> = {
  procrastination: "procrastination",
  socialMedia: "social media",
  sleep: "poor sleep",
  focus: "scattered focus",
  routines: "broken routines",
  general: "what holds you back",
};

export function goalPhrase(goal: string): string {
  return GOAL_PHRASES[detectGoalTheme(goal)];
}

export function blockerPhrase(blocker: string): string {
  return BLOCKER_PHRASES[detectBlocker(blocker)];
}

/** The story the timeline tells at 3 / 6 / 12 months, per goal. */
export const TIMELINE_STORIES: Record<GoalTheme, [string, string, string]> = {
  startup: ["Deep work is a habit", "Real traction shows", "Your startup, standing"],
  money: ["Spending under control", "Savings start compounding", "Real financial room"],
  health: ["Energy comes back", "Change becomes visible", "A stronger you"],
  language: ["First real phrases", "You think in it sometimes", "Conversations flow"],
  happiness: ["Mornings feel lighter", "Weeks feel steadier", "Genuinely happier"],
  general: ["The habit is real", "Momentum compounds", "A different you"],
};
