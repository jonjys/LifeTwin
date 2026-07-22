import type { PathMetrics, UserProfile } from "@/lib/types";
import { pick } from "@/lib/ai/seeded";
import { blockerPhrase, goalPhrase } from "@/lib/ai/themes";
import { weakestDimension } from "@/lib/ai/simulation";

const DIMENSION_LABELS: Record<keyof PathMetrics, string> = {
  health: "health",
  money: "money",
  confidence: "confidence",
  productivity: "productivity",
  mood: "mood",
};

type InsightContext = {
  profile: UserProfile;
  currentPath: PathMetrics;
  futurePath: PathMetrics;
  twinSync: number;
  completions: number;
  dateKey: string;
};

/**
 * One sentence, never generic: every insight cites the user's goal,
 * their blocker, or a number from their own simulation.
 */
export function pickInsight(ctx: InsightContext): string {
  const goal = goalPhrase(ctx.profile.goal);
  const blocker = blockerPhrase(ctx.profile.blocker);
  const weakest = DIMENSION_LABELS[weakestDimension(ctx.currentPath, ctx.futurePath)];

  const pool: string[] = [
    `One quest a day is how ${goal} stops being a plan and becomes a pattern.`,
    `Your widest gap is ${weakest} — that's where ${blocker} costs you most, and where today's quest pays off first.`,
    `The gap between your two paths isn't talent. It's ${blocker}, repeated daily.`,
    `Beat ${blocker} before noon and the rest of the day usually follows.`,
    `You're ${ctx.twinSync}% in sync with your future self. Every quest closes that gap a little.`,
    `The version of you who reached ${goal} was built on days exactly like this one.`,
  ];

  if (ctx.completions >= 3) {
    pool.push(
      `${ctx.completions} quests in — your current path is already bending toward your LifeTwin.`
    );
  }

  return pick(
    `${ctx.profile.goal}|${ctx.profile.blocker}|${ctx.dateKey}:insight`,
    pool
  );
}
