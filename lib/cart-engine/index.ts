import { MEAL_EXPANSIONS } from "@/lib/cart-engine/catalog";
import { optimizeItem } from "@/lib/cart-engine/optimize";
import { buildCheckoutOptions } from "@/lib/cart-engine/checkout";
import { generateNotifications } from "@/lib/cart-engine/notifications";
import type { CartResult, RequestedItem } from "@/lib/types";

export { STORES, STORE_LIST } from "@/lib/cart-engine/stores";
export { CATALOG, MEAL_EXPANSIONS } from "@/lib/cart-engine/catalog";

function expandItems(rawItems: string[]): RequestedItem[] {
  const expanded: string[] = [];
  for (const raw of rawItems) {
    const meal = MEAL_EXPANSIONS[raw.trim().toLowerCase()];
    if (meal) expanded.push(...meal);
    else expanded.push(raw);
  }
  return expanded.map((raw, i) => ({ id: `item-${i}-${raw.trim().toLowerCase()}`, raw }));
}

/**
 * The Cart Engine's single entry point — pure and synchronous, same
 * input always produces the same output. It has no idea this is a web
 * app: give it a list of grocery items, today's date, and what the user
 * usually buys, and it hands back an optimized cart, three checkout
 * options, and a small feed of savings notices. A real pricing API would
 * replace `optimizeItem`/`buildCheckoutOptions` internals without
 * changing this shape at all.
 */
export function buildCart(rawItems: string[], dateKey: string, usualItems: string[]): CartResult {
  const requested = expandItems(rawItems);
  const items = requested.map((r) => optimizeItem(r, dateKey));

  const totalNaiveSEK = items.reduce((sum, it) => sum + it.naive.priceSEK, 0);
  const totalOptimizedSEK = items.reduce((sum, it) => sum + it.chosen.priceSEK, 0);
  const totalSavingsSEK = Math.max(0, totalNaiveSEK - totalOptimizedSEK);

  return {
    items,
    checkoutOptions: buildCheckoutOptions(items, dateKey),
    notifications: generateNotifications(usualItems, dateKey),
    totalNaiveSEK,
    totalOptimizedSEK,
    totalSavingsSEK,
  };
}
