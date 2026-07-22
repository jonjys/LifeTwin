"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAIService } from "@/lib/ai/ai-service";
import { loadState, saveState } from "@/lib/storage";
import type { FutureSimulation, TwinState } from "@/lib/types";
import { todayKey } from "@/lib/utils";

type LifeTwin = {
  /** null while loading; stays null if the user has no profile yet. */
  state: TwinState | null;
  sim: FutureSimulation | null;
  /** The simulation as it stood the moment before the last completed
   *  quest — null until a quest is completed this session. Lets the UI
   *  show "your future changed" as a before/after, not just a number. */
  previousSim: FutureSimulation | null;
  loading: boolean;
  questDone: boolean;
  /** Change in Future Score vs. the previous recorded day. */
  scoreDelta: number;
  /** True right after the user completes today's quest (drives celebration). */
  justCompleted: boolean;
  completeQuest: () => void;
};

function upsertToday(state: TwinState, score: number): TwinState {
  const today = todayKey();
  const history = state.history.filter((h) => h.date !== today);
  history.push({ date: today, futureScore: score });
  history.sort((a, b) => a.date.localeCompare(b.date));
  return { ...state, history: history.slice(-90) };
}

function deltaFrom(state: TwinState, score: number): number {
  const today = todayKey();
  const previous = [...state.history]
    .reverse()
    .find((h) => h.date < today);
  // Day one: the twin was born trending upward.
  return previous ? score - previous.futureScore : 2;
}

export function useLifeTwin(): LifeTwin {
  const [state, setState] = useState<TwinState | null>(null);
  const [sim, setSim] = useState<FutureSimulation | null>(null);
  const [previousSim, setPreviousSim] = useState<FutureSimulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [justCompleted, setJustCompleted] = useState(false);
  const completing = useRef(false);

  useEffect(() => {
    const stored = loadState();
    if (!stored) {
      setLoading(false);
      return;
    }
    getAIService()
      .simulate(stored.profile, {
        dateKey: todayKey(),
        scoreBoost: stored.scoreBoost,
        syncBoost: stored.syncBoost,
        completions: stored.completions,
      })
      .then((result) => {
        const next = upsertToday(stored, result.futureScore);
        saveState(next);
        setState(next);
        setSim(result);
        setLoading(false);
      });
  }, []);

  const completeQuest = useCallback(() => {
    if (!state || !sim || completing.current) return;
    const today = todayKey();
    if (state.lastCompletedDate === today) return;
    completing.current = true;

    const boosted: TwinState = {
      ...state,
      scoreBoost: state.scoreBoost + 2,
      syncBoost: state.syncBoost + 3,
      lastCompletedDate: today,
      completions: state.completions + 1,
    };

    getAIService()
      .simulate(boosted.profile, {
        dateKey: today,
        scoreBoost: boosted.scoreBoost,
        syncBoost: boosted.syncBoost,
        completions: boosted.completions,
      })
      .then((result) => {
        const next = upsertToday(boosted, result.futureScore);
        saveState(next);
        setState(next);
        setPreviousSim(sim);
        setSim(result);
        setJustCompleted(true);
        completing.current = false;
      });
  }, [state, sim]);

  const questDone = state?.lastCompletedDate === todayKey();
  const scoreDelta =
    state && sim ? deltaFrom(state, sim.futureScore) : 0;

  return {
    state,
    sim,
    previousSim,
    loading,
    questDone: Boolean(questDone),
    scoreDelta,
    justCompleted,
    completeQuest,
  };
}
