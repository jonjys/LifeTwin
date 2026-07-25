import type { CatalogItem } from "@/lib/cart-engine/catalog";
import { cheapestStoreFor, priceAt } from "@/lib/cart-engine/optimize";
import { DEFAULT_STORE_BY_DOMAIN, STORES } from "@/lib/cart-engine/stores";
import type { StoreId } from "@/lib/types";

export type DealScanItem = {
  catalogId: string;
  displayName: string;
  storeId: StoreId;
  storeName: string;
  priceSEK: number;
  naivePriceSEK: number;
  discountPct: number;
  onCampaign: boolean;
};

/**
 * The scan behind every "AI checked every store" moment in the app —
 * grocery's Veckoplanering and the deck project's material prices both
 * call this. For each catalog item, it checks every store in that item's
 * own domain (ICA/Willys/Coop/Lidl/Hemköp/City Gross/Mathem/Matsmart for
 * groceries; Byggmax/Hornbach/Bauhaus/Beijer/XL-BYGG for building) for
 * today's price and campaign state, and returns the cheapest one — the
 * same per-item lookup `optimizeItem` already runs, just across a whole
 * catalog at once so a project can show "here's what's actually cheapest
 * right now" automatically, before anyone builds a cart or checks out.
 * Pure and synchronous — same catalog + dateKey always returns the same scan.
 */
export function scanCatalogForDeals(catalog: CatalogItem[], dateKey: string): DealScanItem[] {
  return catalog.map((item) => {
    const defaultStore = DEFAULT_STORE_BY_DOMAIN[item.domain];
    const naivePriceSEK = Math.round(priceAt(item, defaultStore, dateKey));
    const best = cheapestStoreFor(item, dateKey);
    const discountPct = naivePriceSEK > 0 ? Math.round((1 - best.priceSEK / naivePriceSEK) * 100) : 0;
    return {
      catalogId: item.id,
      displayName: item.displayName,
      storeId: best.storeId,
      storeName: STORES[best.storeId].name,
      priceSEK: best.priceSEK,
      naivePriceSEK,
      discountPct,
      onCampaign: best.onCampaign,
    };
  });
}
