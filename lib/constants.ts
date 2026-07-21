export const GOAL_SUGGESTIONS = [
  "Build my startup",
  "Save money",
  "Become healthier",
  "Learn a language",
  "Feel happier",
] as const;

export const BLOCKER_SUGGESTIONS = [
  "Procrastination",
  "Social media",
  "Poor sleep",
  "No focus",
  "Bad routines",
] as const;

export const TIMELINE_MILESTONES = [
  { month: 0, label: "Today" },
  { month: 3, label: "3 Months" },
  { month: 6, label: "6 Months" },
  { month: 12, label: "12 Months" },
] as const;
