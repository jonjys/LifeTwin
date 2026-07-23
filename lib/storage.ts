import type { OrderRecord, SmartCartState } from "@/lib/types";

const STORAGE_KEY = "smartcart.state.v1";
const USUAL_ITEM_THRESHOLD = 2;

export function loadState(): SmartCartState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SmartCartState;
    if (!parsed?.createdAt) return null;
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
    usualItems: [],
    itemHistory: [],
    orders: [],
    currentItems: [],
  };
  saveState(fresh);
  return fresh;
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

/** Records a completed checkout, growing the savings dashboard. */
export function recordOrder(order: OrderRecord): SmartCartState {
  const state = ensureState();
  const next: SmartCartState = {
    ...state,
    orders: [...state.orders, order].slice(-200),
  };
  saveState(next);
  return next;
}

export function savingsThisMonth(state: SmartCartState): number {
  const now = new Date();
  return state.orders
    .filter((o) => {
      const d = new Date(o.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, o) => sum + o.savingsSEK, 0);
}

export function savingsThisYear(state: SmartCartState): number {
  const now = new Date();
  return state.orders
    .filter((o) => new Date(o.date).getFullYear() === now.getFullYear())
    .reduce((sum, o) => sum + o.savingsSEK, 0);
}

export function savingsSinceInstall(state: SmartCartState): number {
  return state.orders.reduce((sum, o) => sum + o.savingsSEK, 0);
}
