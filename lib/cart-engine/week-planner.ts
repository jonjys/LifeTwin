import { CATALOG, GROCERY_CATEGORIES, type CatalogItem, type GroceryCategory } from "@/lib/cart-engine/catalog";
import { cheapestStoreFor, priceAt } from "@/lib/cart-engine/optimize";
import { DEFAULT_STORE_BY_DOMAIN, STORES } from "@/lib/cart-engine/stores";
import type { StoreId } from "@/lib/types";

export type WeeklyPlanItem = {
  catalogId: string;
  displayName: string;
  category: GroceryCategory;
  storeId: StoreId;
  storeName: string;
  priceSEK: number;
  naivePriceSEK: number;
  discountPct: number;
  onCampaign: boolean;
};

/** One item per aisle guaranteed, then the best remaining deals fill out
 *  a believable week's worth of groceries. */
const TARGET_TOTAL_ITEMS = 12;

/**
 * "Veckoplanering" — scans every grocery store's price and campaign state
 * for today (the same deterministic scan `optimizeItem` already runs per
 * item, just run across the whole catalog at once) and assembles the
 * week's cheapest believable shopping list: at least one deal per aisle,
 * then whatever else is discounted hardest. Pure and synchronous, same
 * dateKey always returns the same plan.
 */
export function buildWeeklyPlan(dateKey: string): WeeklyPlanItem[] {
  const groceryItems = CATALOG.filter(
    (item): item is CatalogItem & { category: GroceryCategory } => item.domain === "grocery" && !!item.category
  );

  const scored: WeeklyPlanItem[] = groceryItems.map((item) => {
    const defaultStore = DEFAULT_STORE_BY_DOMAIN[item.domain];
    const naivePriceSEK = Math.round(priceAt(item, defaultStore, dateKey));
    const best = cheapestStoreFor(item, dateKey);
    const discountPct = naivePriceSEK > 0 ? Math.round((1 - best.priceSEK / naivePriceSEK) * 100) : 0;
    return {
      catalogId: item.id,
      displayName: item.displayName,
      category: item.category,
      storeId: best.storeId,
      storeName: STORES[best.storeId].name,
      priceSEK: best.priceSEK,
      naivePriceSEK,
      discountPct,
      onCampaign: best.onCampaign,
    };
  });

  const byCategory = new Map<GroceryCategory, WeeklyPlanItem[]>();
  for (const s of scored) {
    const list = byCategory.get(s.category) ?? [];
    list.push(s);
    byCategory.set(s.category, list);
  }
  for (const list of byCategory.values()) list.sort((a, b) => b.discountPct - a.discountPct);

  const picked: WeeklyPlanItem[] = [];
  const pickedIds = new Set<string>();

  // Every aisle earns at least its single best deal.
  for (const category of GROCERY_CATEGORIES) {
    const best = byCategory.get(category)?.[0];
    if (best) {
      picked.push(best);
      pickedIds.add(best.catalogId);
    }
  }

  // Fill the rest of the week with whatever's discounted hardest.
  const remaining = scored
    .filter((s) => !pickedIds.has(s.catalogId))
    .sort((a, b) => b.discountPct - a.discountPct);
  for (const item of remaining) {
    if (picked.length >= TARGET_TOTAL_ITEMS) break;
    picked.push(item);
    pickedIds.add(item.catalogId);
  }

  return picked.sort(
    (a, b) => GROCERY_CATEGORIES.indexOf(a.category) - GROCERY_CATEGORIES.indexOf(b.category)
  );
}
