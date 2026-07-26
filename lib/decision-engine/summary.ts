import { STORES } from "@/lib/cart-engine/stores";
import type { CartResult, DecisionResult, ShoppingRoute, StoreId } from "@/lib/types";

export type RecommendationSummary = {
  /** e.g. "Willys + Matsmart" or "Byggmax, Hornbach +3" */
  storeLabel: string;
  totalSEK: number;
  savingsSEK: number;
  timeMin: number;
  fulfillmentLabel: string;
  stopCount: number;
  /** Up to 3 short, honest reasons — derived from real engine output, never invented. */
  reasons: string[];
};

function formatStoreLabel(storeIds: StoreId[]): string {
  const names = storeIds.map((id) => STORES[id].name);
  if (names.length <= 2) return names.join(" + ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

/**
 * Condenses everything the Cart + Decision Engines already computed into
 * the single "AI Recommendation" card the home screen leads with — one
 * verdict, not a dashboard. Every field here reads straight off
 * CartResult/DecisionResult/ShoppingRoute; nothing is fabricated for the
 * summary that isn't already true of the full plan on /cart.
 */
export function buildRecommendationSummary(
  cart: CartResult,
  decision: DecisionResult,
  route: ShoppingRoute | null
): RecommendationSummary {
  const winner = decision.options.find((o) => o.id === decision.recommendedId) ?? decision.options[0];
  const storeIds = [...new Set(cart.items.map((i) => i.chosen.store))];

  const reasons: string[] = [decision.recommendationText];

  const topSwap = [...cart.items].filter((i) => i.savingsSEK > 0).sort((a, b) => b.savingsSEK - a.savingsSEK)[0];
  if (topSwap) {
    reasons.push(
      `${STORES[topSwap.chosen.store].name} har ${topSwap.displayName.toLowerCase()} billigast just nu — du sparar ${topSwap.savingsSEK} kr.`
    );
  }

  const skipStop = route?.stops.find((s) => s.skipRecommended);
  if (skipStop?.skipReasonText) {
    reasons.push(skipStop.skipReasonText);
  } else if (decision.weatherNote) {
    reasons.push(decision.weatherNote);
  } else {
    const campaignCount = cart.items.filter((i) => i.chosen.onCampaign).length;
    if (campaignCount > 0) {
      reasons.push(`${campaignCount} ${campaignCount === 1 ? "vara har" : "varor har"} kampanj just nu.`);
    }
  }

  return {
    storeLabel: formatStoreLabel(storeIds),
    totalSEK: winner.totalSEK,
    savingsSEK: cart.totalSavingsSEK,
    timeMin: winner.timeMin,
    fulfillmentLabel: winner.label,
    stopCount: storeIds.length,
    reasons: reasons.slice(0, 3),
  };
}
