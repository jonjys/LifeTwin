import { STORES } from "@/lib/cart-engine/stores";
import type { CartResult, DecisionResult, StoreId } from "@/lib/types";

function formatTime(min: number): string {
  if (min < 60) return `${min} minuter`;
  const hours = Math.round((min / 60) * 10) / 10;
  return hours === 1 ? "1 timme" : `${hours} timmar`;
}

/**
 * Flik 4 — "Smartaste beslutet", in one sentence: not the cheapest single
 * store, the smartest split. "Köp virket på Byggmax. Skruven på Hornbach.
 * Betongen från Beijer. Leverans från Byggmax. Du sparar totalt: 4 283 kr.
 * Du sparar: 3 timmar." Reads straight off the same CartResult/DecisionResult
 * every project already produces — nothing here is project-specific.
 */
export function summarizePurchasePlan(cart: CartResult, decision: DecisionResult): string {
  const byStore = new Map<StoreId, string[]>();
  for (const item of cart.items) {
    const list = byStore.get(item.chosen.store) ?? [];
    list.push(item.displayName);
    byStore.set(item.chosen.store, list);
  }

  const perStoreSentences = [...byStore.entries()].map(
    ([storeId, names]) => `Köp ${names.join(", ")} på ${STORES[storeId].name}.`
  );

  const winner = decision.options.find((o) => o.id === decision.recommendedId);
  const fulfillmentSentence = winner
    ? winner.id === "delivery"
      ? "Ta hemleverans."
      : winner.id === "walk"
        ? "Promenera dit."
        : "Hämta själv."
    : "";

  const runnerUp = decision.options.find((o) => o.id !== decision.recommendedId);
  const timeSavedMin = winner && runnerUp ? Math.max(0, runnerUp.timeMin - winner.timeMin) : 0;

  const parts = [
    ...perStoreSentences,
    fulfillmentSentence,
    `Du sparar totalt: ${cart.totalSavingsSEK} kr.`,
  ];
  if (timeSavedMin > 0) parts.push(`Du sparar: ${formatTime(timeSavedMin)}.`);

  return parts.filter(Boolean).join(" ");
}
