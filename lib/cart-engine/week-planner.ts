import { CATALOG, GROCERY_CATEGORIES, type CatalogItem, type GroceryCategory } from "@/lib/cart-engine/catalog";
import { scanCatalogForDeals, type DealScanItem } from "@/lib/cart-engine/deal-scanner";

export type WeeklyPlanItem = DealScanItem & { category: GroceryCategory };

/** One item per aisle guaranteed, then the best remaining deals fill out
 *  a believable week's worth of groceries. */
const TARGET_TOTAL_ITEMS = 12;

/**
 * "Veckoplanering" — runs the same cross-store deal scan every project
 * uses (lib/cart-engine/deal-scanner.ts) across the whole grocery catalog,
 * then curates it into a believable week: at least one deal per aisle,
 * then whatever else is discounted hardest.
 */
export function buildWeeklyPlan(dateKey: string): WeeklyPlanItem[] {
  const groceryItems = CATALOG.filter(
    (item): item is CatalogItem & { category: GroceryCategory } => item.domain === "grocery" && !!item.category
  );
  const categoryById = new Map(groceryItems.map((item) => [item.id, item.category]));

  const scored: WeeklyPlanItem[] = scanCatalogForDeals(groceryItems, dateKey).map((scan) => ({
    ...scan,
    category: categoryById.get(scan.catalogId)!,
  }));

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
