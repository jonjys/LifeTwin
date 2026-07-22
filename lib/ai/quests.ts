import type { UserProfile } from "@/lib/types";
import { hash } from "@/lib/ai/seeded";
import {
  blockerPhrase,
  detectBlocker,
  detectGoalTheme,
  goalPhrase,
  type BlockerKind,
  type GoalTheme,
} from "@/lib/ai/themes";

/**
 * Quests are engineered, not random: most days the quest directly
 * counters the user's stated blocker or feeds their stated goal.
 */

const BLOCKER_QUESTS: Record<BlockerKind, readonly string[]> = {
  procrastination: [
    "Spend 10 minutes on the task you've been avoiding",
    "Do the hardest thing on your list first — just 15 minutes",
    "Finish one small thing you started this week",
  ],
  socialMedia: [
    "Stay off social media until noon",
    "Move one feed app off your home screen today",
    "Replace 15 minutes of scrolling with a walk",
  ],
  sleep: [
    "Go to bed 30 minutes earlier tonight",
    "No screens for the last 30 minutes of today",
    "Get 10 minutes of daylight before noon",
  ],
  focus: [
    "Work focused for 30 minutes — one tab, one task",
    "Silence notifications for the next 2 hours",
    "Write down today's single priority, then start it",
  ],
  routines: [
    "Repeat yesterday's best habit at the same time",
    "Prepare tomorrow's morning before you sleep",
    "Do a 5-minute evening reset",
  ],
  general: [
    "Work focused for 30 minutes",
    "Write down tomorrow's single priority",
  ],
};

const GOAL_QUESTS: Record<GoalTheme, readonly string[]> = {
  startup: [
    "Work focused for 30 minutes on your startup",
    "Send one message that moves your project forward",
    "Write down one idea that could earn money",
  ],
  money: [
    "Skip one unnecessary purchase today",
    "Review yesterday's spending for 5 minutes",
    "Move a small amount into savings",
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
    "Take a 15-minute walk without your phone",
  ],
  general: [
    "Read 10 pages",
    "Walk for 20 minutes",
    "Meditate for 5 minutes",
  ],
};

export type DailyQuest = {
  quest: string;
  /** Why this quest exists — shown as a small chip on the quest card. */
  focus: string;
};

export function pickQuest(profile: UserProfile, dateKey: string): DailyQuest {
  const blocker = detectBlocker(profile.blocker);
  const theme = detectGoalTheme(profile.goal);
  const blockerPool = BLOCKER_QUESTS[blocker];
  const goalPool = GOAL_QUESTS[theme];

  const pool = [...blockerPool, ...goalPool];
  const index =
    hash(`${profile.goal}|${profile.blocker}|${dateKey}:quest`) % pool.length;

  return {
    quest: pool[index],
    focus:
      index < blockerPool.length
        ? `Counters ${blockerPhrase(profile.blocker)}`
        : `Builds ${goalPhrase(profile.goal)}`,
  };
}
