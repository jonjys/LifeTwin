"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FREE_TIER_QUOTE_LIMIT,
  getFreemiumState,
  recordQuoteCreated,
  setPro,
  type FreemiumState,
} from "@/lib/freemium";

const EMPTY_STATE: FreemiumState = {
  isPro: false,
  quotesThisMonth: 0,
  quotesRemaining: FREE_TIER_QUOTE_LIMIT,
  limitReached: false,
};

/** Reactive wrapper around lib/freemium.ts — localStorage isn't reactive
 *  on its own, so components that show usage (Dashboard badge, navbar,
 *  the wizard's save button) need this to re-render after a quote is
 *  recorded or the plan changes. Starts as the free-tier default during
 *  SSR/first paint (no localStorage on the server) and syncs on mount. */
export function useFreemium() {
  const [state, setState] = useState<FreemiumState>(EMPTY_STATE);

  const refresh = useCallback(() => setState(getFreemiumState()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordQuote = useCallback(() => {
    recordQuoteCreated();
    refresh();
  }, [refresh]);

  const upgradeToPro = useCallback(() => {
    setPro(true);
    refresh();
  }, [refresh]);

  return { ...state, refresh, recordQuote, upgradeToPro };
}
