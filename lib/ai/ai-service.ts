import type { FutureSimulation, UserProfile } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { averageOf, derivePaths } from "@/lib/ai/simulation";
import { pickInsight } from "@/lib/ai/insights";
import { pickQuest } from "@/lib/ai/quests";

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

/**
 * Deterministic local simulation. The same profile on the same day always
 * produces the same result — while the blocker shapes today's weaknesses,
 * the goal shapes the future's strengths, quests counter the blocker,
 * insights cite the user's own numbers, and every completed quest bends
 * the current path toward the LifeTwin path.
 */
export class MockAIService implements AIService {
  async simulate(
    profile: UserProfile,
    context: SimulationContext
  ): Promise<FutureSimulation> {
    const { currentPath, futurePath } = derivePaths(
      profile,
      context.completions
    );
    const avgCurrent = averageOf(currentPath);
    const avgFuture = averageOf(futurePath);

    // Score grows with the quality of the projected future and with every
    // completed quest; sync is literally how close today is to the future.
    const futureScore = clamp(
      Math.round(58 + avgFuture * 0.12 + avgCurrent * 0.1 + context.scoreBoost),
      45,
      99
    );
    const twinSync = clamp(
      Math.round((avgCurrent / avgFuture) * 100) + context.syncBoost,
      20,
      99
    );

    const { quest, focus } = pickQuest(profile, context.dateKey);

    return {
      futureScore,
      twinSync,
      currentPath,
      futurePath,
      quest,
      questFocus: focus,
      insight: pickInsight({
        profile,
        currentPath,
        futurePath,
        twinSync,
        completions: context.completions,
        dateKey: context.dateKey,
      }),
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
