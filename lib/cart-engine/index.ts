import { CATALOG, MEAL_EXPANSIONS, type CatalogItem } from "@/lib/cart-engine/catalog";
import { optimizeItem } from "@/lib/cart-engine/optimize";
import { buildCheckoutOptions } from "@/lib/cart-engine/checkout";
import { generateNotifications } from "@/lib/cart-engine/notifications";
import type { CartResult, RequestedItem, StoreDomain } from "@/lib/types";

export { STORES, STORE_LIST, storesForDomain, DEFAULT_STORE_BY_DOMAIN } from "@/lib/cart-engine/stores";
export {
  CATALOG,
  MEAL_EXPANSIONS,
  GROCERY_CATEGORIES,
  groceryItemsByCategory,
  type GroceryCategory,
} from "@/lib/cart-engine/catalog";
export { buildWeeklyPlan, type WeeklyPlanItem } from "@/lib/cart-engine/week-planner";
export { scanCatalogForDeals, type DealScanItem } from "@/lib/cart-engine/deal-scanner";

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
 * app, and no idea what kind of project this is: give it a list of items,
 * today's date, what the user usually buys, and (optionally) a catalog
 * for a different project domain — it hands back an optimized cart,
 * checkout options scoped to that domain's retailers, and a small feed of
 * savings notices. Groceries and "bygga altan" run through the exact same
 * code here; only the catalog argument differs. A real pricing API would
 * replace `optimizeItem`/`buildCheckoutOptions` internals without
 * changing this shape at all.
 */
export function buildCart(
  rawItems: string[],
  dateKey: string,
  usualItems: string[],
  catalog: CatalogItem[] = CATALOG
): CartResult {
  const domain: StoreDomain = catalog[0]?.domain ?? "grocery";
  const requested = expandItems(rawItems);
  const items = requested.map((r) => optimizeItem(r, dateKey, catalog, domain));

  const totalNaiveSEK = items.reduce((sum, it) => sum + it.naive.priceSEK, 0);
  const totalOptimizedSEK = items.reduce((sum, it) => sum + it.chosen.priceSEK, 0);
  const totalSavingsSEK = Math.max(0, totalNaiveSEK - totalOptimizedSEK);

  return {
    items,
    checkoutOptions: buildCheckoutOptions(items, dateKey, catalog, domain),
    notifications: domain === "grocery" ? generateNotifications(usualItems, dateKey) : [],
    totalNaiveSEK,
    totalOptimizedSEK,
    totalSavingsSEK,
    domain,
  };
}
