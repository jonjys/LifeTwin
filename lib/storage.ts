import { DEFAULT_PROFILE } from "@/lib/types";
import type { OrderRecord, SmartCartState, UserProfile } from "@/lib/types";

const STORAGE_KEY = "smartcart.state.v1";
const USUAL_ITEM_THRESHOLD = 2;

export function loadState(): SmartCartState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SmartCartState;
    if (!parsed?.createdAt) return null;
    // Older sessions won't have a profile yet — backfill the default.
    if (!parsed.profile) parsed.profile = { ...DEFAULT_PROFILE };
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: SmartCartState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function ensureState(): SmartCartState {
  const existing = loadState();
  if (existing) return existing;
  const fresh: SmartCartState = {
    createdAt: new Date().toISOString(),
    profile: { ...DEFAULT_PROFILE },
    usualItems: [],
    itemHistory: [],
    orders: [],
    currentItems: [],
  };
  saveState(fresh);
  return fresh;
}

export function saveProfile(profile: UserProfile): SmartCartState {
  const state = ensureState();
  const next: SmartCartState = { ...state, profile };
  saveState(next);
  return next;
}

/** Records a new shopping list, growing AI Memory as items repeat. */
export function recordList(items: string[]): SmartCartState {
  const state = ensureState();
  const normalized = items.map((i) => i.trim().toLowerCase()).filter(Boolean);

  const history = [...state.itemHistory, ...normalized];
  const counts = new Map<string, number>();
  for (const item of history) counts.set(item, (counts.get(item) ?? 0) + 1);

  const usualItems = [...counts.entries()]
    .filter(([, count]) => count >= USUAL_ITEM_THRESHOLD)
    .sort((a, b) => b[1] - a[1])
    .map(([item]) => item)
    .slice(0, 8);

  const next: SmartCartState = {
    ...state,
    itemHistory: history.slice(-200),
    usualItems,
    currentItems: items,
  };
  saveState(next);
  return next;
}

/** Records a completed checkout, growing the savings + impact dashboard. */
export function recordOrder(order: OrderRecord): SmartCartState {
  const state = ensureState();
  const next: SmartCartState = {
    ...state,
    orders: [...state.orders, order].slice(-200),
  };
  saveState(next);
  return next;
}

function ordersInPeriod(state: SmartCartState, matches: (d: Date) => boolean): OrderRecord[] {
  return state.orders.filter((o) => matches(new Date(o.date)));
}

export function savingsThisMonth(state: SmartCartState): number {
  const now = new Date();
  return ordersInPeriod(
    state,
    (d) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  ).reduce((sum, o) => sum + o.savingsSEK, 0);
}

export function savingsThisYear(state: SmartCartState): number {
  const now = new Date();
  return ordersInPeriod(state, (d) => d.getFullYear() === now.getFullYear()).reduce(
    (sum, o) => sum + o.savingsSEK,
    0
  );
}

export function savingsSinceInstall(state: SmartCartState): number {
  return state.orders.reduce((sum, o) => sum + o.savingsSEK, 0);
}

export function timeSavedSinceInstallMin(state: SmartCartState): number {
  return state.orders.reduce((sum, o) => sum + (o.timeSavedMin ?? 0), 0);
}

export function carTripsAvoidedSinceInstall(state: SmartCartState): number {
  return state.orders.filter((o) => o.carTripAvoided).length;
}

export function caloriesWalkedSinceInstall(state: SmartCartState): number {
  return state.orders.reduce((sum, o) => sum + (o.caloriesWalked ?? 0), 0);
}

export function co2SavedSinceInstallGrams(state: SmartCartState): number {
  return state.orders.reduce((sum, o) => sum + (o.co2SavedGrams ?? 0), 0);
}
