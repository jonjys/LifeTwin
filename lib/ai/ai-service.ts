import type { FutureSimulation, UserProfile } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { averageOf } from "@/lib/ai/path-metrics";
import { pickInsight } from "@/lib/ai/insights";
import { pickQuest } from "@/lib/ai/quests";
import { runLifeEngine, toPathMetrics } from "@/lib/engine";

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
 * (e.g. `ClaudeAIService`), have it call `runLifeEngine` for grounded
 * numbers, generate the prose (quest/insight/events/risks/opportunities)
 * with the model, and swap the implementation returned by `getAIService()`.
 */
export interface AIService {
  simulate(
    profile: UserProfile,
    context: SimulationContext
  ): Promise<FutureSimulation>;
}

/**
 * Deterministic local simulation, built entirely on top of the Life
 * Engine (`lib/engine`). The engine produces the numbers — ten
 * interdependent life categories, projections, events, risks,
 * opportunities — and this layer only adds the two things that still
 * need a "voice": which quest to show, and which sentence to say.
 */
export class MockAIService implements AIService {
  async simulate(
    profile: UserProfile,
    context: SimulationContext
  ): Promise<FutureSimulation> {
    const engine = runLifeEngine({
      goal: profile.goal,
      blocker: profile.blocker,
      situation: profile.situation,
      completions: context.completions,
      dateKey: context.dateKey,
    });

    const currentPath = toPathMetrics(engine.metrics);
    const futurePath = toPathMetrics(engine.ceiling);
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
      projections: engine.projections,
      events: engine.events,
      risks: engine.risks,
      opportunities: engine.opportunities,
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
