"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { buildCart, CATALOG } from "@/lib/cart-engine";
import { usesFuel } from "@/lib/cart-engine/distance";
import { findMatsmartDeals } from "@/lib/cart-engine/matsmart";
import { generateDeckMaterialsCatalog } from "@/lib/cart-engine/materials-catalog";
import {
  computeFulfillmentOptions,
  buildShoppingRoute,
  summarizePurchasePlan,
} from "@/lib/decision-engine";
import type { CatalogItem } from "@/lib/cart-engine/catalog";
import {
  caloriesWalkedSinceInstall,
  carTripsAvoidedSinceInstall,
  co2SavedSinceInstallGrams,
  ensureState,
  recordOrder,
  savingsSinceInstall,
  savingsThisMonth,
  savingsThisYear,
  timeSavedSinceInstallMin,
} from "@/lib/storage";
import type {
  CartResult,
  DecisionResult,
  FulfillmentId,
  MatsmartDeal,
  ShoppingRoute,
  SmartCartState,
} from "@/lib/types";
import { todayKey } from "@/lib/utils";

type ImpactTotals = {
  savingsMonth: number;
  savingsYear: number;
  savingsTotal: number;
  timeSavedMin: number;
  carTripsAvoided: number;
  caloriesWalked: number;
  co2SavedGrams: number;
};

type UseSmartCart = {
  /** null while loading; stays null if the user hasn't built a list yet. */
  state: SmartCartState | null;
  cart: CartResult | null;
  decision: DecisionResult | null;
  route: ShoppingRoute | null;
  purchasePlanText: string | null;
  matsmartDeals: MatsmartDeal[];
  loading: boolean;
  impact: ImpactTotals;
  justOrdered: boolean;
  orderedFulfillmentId: FulfillmentId | null;
  checkout: (fulfillmentId: FulfillmentId) => void;
  /** One-tap reorder of AI Memory's recurring items — the "Automatiska
   *  inköp" flow: builds, decides, and checks out without a detour to /build. */
  quickBuyUsualItems: () => void;
  justQuickBought: boolean;
};

/** Loads the list built on /build and runs it through the Cart + Decision Engines. */
export function useSmartCart(): UseSmartCart {
  const [state, setState] = useState<SmartCartState | null>(null);
  const [cart, setCart] = useState<CartResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [justOrdered, setJustOrdered] = useState(false);
  const [orderedFulfillmentId, setOrderedFulfillmentId] = useState<FulfillmentId | null>(null);
  const [justQuickBought, setJustQuickBought] = useState(false);

  useEffect(() => {
    const loaded = ensureState();
    setState(loaded);
    if (loaded.currentItems.length > 0) {
      const catalog: CatalogItem[] =
        loaded.currentCategory === "deck" && loaded.deckDimensions
          ? generateDeckMaterialsCatalog(loaded.deckDimensions.widthM, loaded.deckDimensions.depthM)
          : CATALOG;
      setCart(buildCart(loaded.currentItems, todayKey(), loaded.usualItems, catalog));
    }
    setLoading(false);
  }, []);

  const decision = useMemo(
    () => (cart && state ? computeFulfillmentOptions(cart, state.profile) : null),
    [cart, state]
  );

  const route = useMemo(
    () => (cart && state ? buildShoppingRoute(cart, state.profile) : null),
    [cart, state]
  );

  const purchasePlanText = useMemo(
    () => (cart && decision ? summarizePurchasePlan(cart, decision) : null),
    [cart, decision]
  );

  const matsmartDeals = useMemo(
    () => (state ? findMatsmartDeals(state.usualItems, todayKey()) : []),
    [state]
  );

  const checkout = useCallback(
    (fulfillmentId: FulfillmentId) => {
      if (!cart || !decision || !state) return;
      const chosen = decision.options.find((o) => o.id === fulfillmentId);
      const pickup = decision.options.find((o) => o.id === "pickup");
      if (!chosen || !pickup) return;

      const next = recordOrder({
        date: new Date().toISOString(),
        savingsSEK: cart.totalSavingsSEK,
        totalSEK: chosen.totalSEK,
        checkoutOptionId: "cheapest",
        fulfillmentId,
        timeSavedMin: Math.max(0, pickup.timeMin - chosen.timeMin),
        carTripAvoided: fulfillmentId !== "pickup" && usesFuel(state.profile.transportMode),
        caloriesWalked: chosen.calories,
        co2SavedGrams: chosen.co2Grams,
      });
      setState(next);
      setJustOrdered(true);
      setOrderedFulfillmentId(fulfillmentId);
    },
    [cart, decision, state]
  );

  const quickBuyUsualItems = useCallback(() => {
    if (!state || state.usualItems.length === 0) return;
    const quickCart = buildCart(state.usualItems, todayKey(), state.usualItems);
    const quickDecision = computeFulfillmentOptions(quickCart, state.profile);
    const winner = quickDecision.options.find((o) => o.id === quickDecision.recommendedId);
    const pickup = quickDecision.options.find((o) => o.id === "pickup");
    if (!winner || !pickup) return;

    const next = recordOrder({
      date: new Date().toISOString(),
      savingsSEK: quickCart.totalSavingsSEK,
      totalSEK: winner.totalSEK,
      checkoutOptionId: "cheapest",
      fulfillmentId: winner.id,
      timeSavedMin: Math.max(0, pickup.timeMin - winner.timeMin),
      carTripAvoided: winner.id !== "pickup" && usesFuel(state.profile.transportMode),
      caloriesWalked: winner.calories,
      co2SavedGrams: winner.co2Grams,
    });
    setState(next);
    setJustQuickBought(true);
  }, [state]);

  const impact: ImpactTotals = state
    ? {
        savingsMonth: savingsThisMonth(state),
        savingsYear: savingsThisYear(state),
        savingsTotal: savingsSinceInstall(state),
        timeSavedMin: timeSavedSinceInstallMin(state),
        carTripsAvoided: carTripsAvoidedSinceInstall(state),
        caloriesWalked: caloriesWalkedSinceInstall(state),
        co2SavedGrams: co2SavedSinceInstallGrams(state),
      }
    : {
        savingsMonth: 0,
        savingsYear: 0,
        savingsTotal: 0,
        timeSavedMin: 0,
        carTripsAvoided: 0,
        caloriesWalked: 0,
        co2SavedGrams: 0,
      };

  return {
    state,
    cart,
    decision,
    route,
    purchasePlanText,
    matsmartDeals,
    loading,
    impact,
    justOrdered,
    orderedFulfillmentId,
    checkout,
    quickBuyUsualItems,
    justQuickBought,
  };
}
