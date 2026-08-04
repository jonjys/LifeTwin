/**
 * OffertPro FREE vs PRO usage gating. There's no auth/billing system
 * yet, so a quota can't be tied to an account server-side — this tracks
 * usage per-browser in localStorage instead, same honesty tier as any
 * client-only gate: a free tier "on the honor system" until real
 * accounts + Stripe exist. Not a security boundary, just a UX nudge
 * toward upgrading.
 */

export const FREE_TIER_QUOTE_LIMIT = 3;

const STORAGE_KEY = "offertpro:freemium:v1";

type StoredState = {
  monthKey: string;
  quotesThisMonth: number;
  isPro: boolean;
};

function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function readRaw(): StoredState {
  const empty: StoredState = { monthKey: monthKey(), quotesThisMonth: 0, isPro: false };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const isPro = parsed.isPro === true;
    // A new calendar month resets the free-tier counter, but never the Pro flag.
    if (parsed.monthKey !== monthKey()) return { monthKey: monthKey(), quotesThisMonth: 0, isPro };
    return { monthKey: parsed.monthKey, quotesThisMonth: parsed.quotesThisMonth ?? 0, isPro };
  } catch {
    return empty;
  }
}

function write(state: StoredState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing / storage disabled — the app still works, it just
    // can't remember usage across reloads. Fails open (never blocks work).
  }
}

export type FreemiumState = {
  isPro: boolean;
  quotesThisMonth: number;
  quotesRemaining: number;
  limitReached: boolean;
};

export function getFreemiumState(): FreemiumState {
  const state = readRaw();
  const quotesRemaining = state.isPro ? Infinity : Math.max(0, FREE_TIER_QUOTE_LIMIT - state.quotesThisMonth);
  return {
    isPro: state.isPro,
    quotesThisMonth: state.quotesThisMonth,
    quotesRemaining,
    limitReached: !state.isPro && quotesRemaining <= 0,
  };
}

export function canCreateQuote(): boolean {
  return !getFreemiumState().limitReached;
}

/** Call once a quote has actually been saved — never before, so an
 *  abandoned wizard doesn't burn a free slot. */
export function recordQuoteCreated() {
  const state = readRaw();
  write({ ...state, quotesThisMonth: state.quotesThisMonth + 1 });
}

/** No payment processor exists yet — this is a manual override (e.g. for
 *  the founder to flip a beta tester to Pro) via Settings, not a real
 *  checkout flow. See components/freemium/upgrade-modal.tsx's mailto CTA
 *  for how an actual upgrade request is handled today. */
export function setPro(isPro: boolean) {
  const state = readRaw();
  write({ ...state, isPro });
}
