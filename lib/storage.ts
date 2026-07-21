import type { TwinState, UserProfile } from "@/lib/types";

const STORAGE_KEY = "lifetwin.state.v1";

export function loadState(): TwinState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TwinState;
    if (!parsed?.profile?.goal) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: TwinState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createState(profile: UserProfile): TwinState {
  const state: TwinState = {
    profile,
    scoreBoost: 0,
    syncBoost: 0,
    lastCompletedDate: null,
    completions: 0,
    history: [],
  };
  saveState(state);
  return state;
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
