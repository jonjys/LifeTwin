import { pick } from "@/lib/ai/seeded";
import { detectGoalTheme, type GoalTheme } from "@/lib/ai/themes";
import type { FutureEvent } from "@/lib/engine/types";

/** [early (~4mo), mid (~7mo), late (~11mo)] — each with a little variety. */
const EVENT_POOLS: Record<GoalTheme, readonly [string[], string[], string[]]> = {
  startup: [
    ["have a working prototype in front of real users", "have validated your core idea with real feedback"],
    ["sign your first paying customer", "have a repeatable way to find customers"],
    ["see your startup generating consistent revenue", "be running your startup as your main focus"],
  ],
  money: [
    ["break your worst spending habit", "have a clear picture of where your money goes"],
    ["build a real emergency fund", "have your spending consistently under budget"],
    ["hit a savings milestone you've never reached before", "be saving on autopilot, without thinking about it"],
  ],
  health: [
    ["notice your energy returning", "feel the habit start to stick"],
    ["feel physically stronger day to day", "notice people commenting on the change"],
    ["reach a fitness level you're proud of", "feel like a genuinely healthier person"],
  ],
  language: [
    ["hold your first basic conversation", "understand simple sentences without translating"],
    ["understand most of what you hear", "start thinking in short phrases"],
    ["think in your new language without translating", "hold a real conversation comfortably"],
  ],
  happiness: [
    ["notice mornings feel lighter", "catch yourself smiling more often"],
    ["feel steady even on hard days", "notice stress bothering you less"],
    ["recognize yourself as a genuinely happier person", "feel like your baseline mood has shifted"],
  ],
  general: [
    ["feel the new habit start to stick", "notice the first small win"],
    ["notice consistency compounding", "feel more in control of your days"],
    ["look back and see how far you've come", "recognize a real shift in who you are"],
  ],
};

const MONTHS: readonly [number, number, number] = [4, 7, 11];

/**
 * Three future milestones. The month markers stay fixed — the content
 * shifts as completions accumulate, so revisiting the app after a streak
 * reads as a more confident, more specific future.
 */
export function generateEvents(
  goal: string,
  blocker: string,
  dateKey: string,
  completions: number
): FutureEvent[] {
  const theme = detectGoalTheme(goal);
  const pools = EVENT_POOLS[theme];
  const seed = `${goal}|${blocker}|${dateKey}`;
  const bucket = Math.min(Math.floor(completions / 2), 5);

  return MONTHS.map((month, i) => ({
    month,
    text: pick(`${seed}:event:${i}:${bucket}`, pools[i]),
  }));
}
