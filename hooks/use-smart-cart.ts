"use client";

import { useCallback, useEffect, useState } from "react";
import { buildCart } from "@/lib/cart-engine";
import {
  ensureState,
  recordOrder,
  savingsSinceInstall,
  savingsThisMonth,
  savingsThisYear,
} from "@/lib/storage";
import type { CartResult, CheckoutOptionId, SmartCartState } from "@/lib/types";
import { todayKey } from "@/lib/utils";

type Savings = { month: number; year: number; total: number };

type UseSmartCart = {
  /** null while loading; stays null if the user hasn't built a list yet. */
  state: SmartCartState | null;
  cart: CartResult | null;
  loading: boolean;
  savings: Savings;
  justOrdered: boolean;
  orderedOptionId: CheckoutOptionId | null;
  checkout: (optionId: CheckoutOptionId) => void;
};

/** Loads the list built on /build and runs it through the Cart Engine. */
export function useSmartCart(): UseSmartCart {
  const [state, setState] = useState<SmartCartState | null>(null);
  const [cart, setCart] = useState<CartResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [justOrdered, setJustOrdered] = useState(false);
  const [orderedOptionId, setOrderedOptionId] = useState<CheckoutOptionId | null>(null);

  useEffect(() => {
    const loaded = ensureState();
    setState(loaded);
    if (loaded.currentItems.length > 0) {
      setCart(buildCart(loaded.currentItems, todayKey(), loaded.usualItems));
    }
    setLoading(false);
  }, []);

  const checkout = useCallback(
    (optionId: CheckoutOptionId) => {
      if (!cart) return;
      const option = cart.checkoutOptions.find((o) => o.id === optionId);
      if (!option) return;
      const next = recordOrder({
        date: new Date().toISOString(),
        savingsSEK: cart.totalSavingsSEK,
        totalSEK: option.totalSEK,
        checkoutOptionId: optionId,
      });
      setState(next);
      setJustOrdered(true);
      setOrderedOptionId(optionId);
    },
    [cart]
  );

  const savings: Savings = state
    ? {
        month: savingsThisMonth(state),
        year: savingsThisYear(state),
        total: savingsSinceInstall(state),
      }
    : { month: 0, year: 0, total: 0 };

  return { state, cart, loading, savings, justOrdered, orderedOptionId, checkout };
}
