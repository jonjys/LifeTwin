import { between, chance } from "@/lib/seeded";
import { CATALOG, matchCatalogItem, type CatalogItem } from "@/lib/cart-engine/catalog";
import { DEFAULT_STORE_BY_DOMAIN, STORES, storesForDomain } from "@/lib/cart-engine/stores";
import type { OptimizedItem, ProductOffer, RequestedItem, StoreDomain, StoreId, SwapReason } from "@/lib/types";

const CAMPAIGN_CHANCE = 0.28;
const DAY_JITTER = 0.05;

function priceAt(item: CatalogItem, storeId: StoreId, dateKey: string): number {
  const store = STORES[storeId];
  const jitter = 1 + between(`${item.id}:${storeId}:${dateKey}:jitter`, -DAY_JITTER, DAY_JITTER);
  return item.basePriceSEK * store.priceMultiplier * jitter;
}

function isOnCampaign(item: CatalogItem, storeId: StoreId, dateKey: string): boolean {
  return chance(`${item.id}:${storeId}:${dateKey}:campaign`, CAMPAIGN_CHANCE);
}

/** The cheapest store for one catalog item today, campaigns included —
 *  only ever compared against stores in the item's own domain. */
function cheapestStoreFor(
  item: CatalogItem,
  dateKey: string
): { storeId: StoreId; priceSEK: number; onCampaign: boolean } {
  let best: { storeId: StoreId; priceSEK: number; onCampaign: boolean } | null = null;
  for (const store of storesForDomain(item.domain)) {
    const onCampaign = isOnCampaign(item, store.id, dateKey);
    const discount = onCampaign
      ? between(`${item.id}:${store.id}:${dateKey}:disc`, 0.18, 0.4)
      : 0;
    const price = Math.round(priceAt(item, store.id, dateKey) * (1 - discount));
    if (!best || price < best.priceSEK) best = { storeId: store.id, priceSEK: price, onCampaign };
  }
  return best as { storeId: StoreId; priceSEK: number; onCampaign: boolean };
}

/** Loose produce (bananer, ägg, ...) has no brand worth printing. */
function brandedName(brand: string, displayName: string): string {
  return brand ? `${brand} ${displayName}` : displayName;
}

function offer(
  store: StoreId,
  productName: string,
  priceSEK: number,
  unitLabel: string,
  onCampaign: boolean,
  packSize: "small" | "large" = "small"
): ProductOffer {
  return { store, productName, priceSEK, unitPriceSEK: priceSEK, unitLabel, onCampaign, packSize };
}

/**
 * The three moments the product pitch describes verbatim — always these
 * exact numbers, so the first three grocery items anyone tries produce
 * the flagship "wow" swaps rather than a random mock number.
 */
function scriptedSwap(item: CatalogItem, requested: RequestedItem): OptimizedItem | null {
  if (item.id === "ketchup") {
    return {
      requested,
      catalogId: item.id,
      displayName: item.displayName,
      naive: offer("ica", "Felix Ketchup", 32, item.unitLabel, false),
      chosen: offer("ica", "ICA Basic Ketchup", 14, item.unitLabel, false),
      savingsSEK: 18,
      swapReason: "brand",
      swapNote: null,
    };
  }
  if (item.id === "mjolk") {
    return {
      requested,
      catalogId: item.id,
      displayName: item.displayName,
      naive: offer("ica", "2 st Arla Mjölk (1L)", 30, item.unitLabel, false),
      chosen: offer("ica", "1 st Arla Mjölk (2L)", 19, item.unitLabel, false, "large"),
      savingsSEK: 11,
      swapReason: "pack-size",
      swapNote: "Jag bytte till 1 stor.",
    };
  }
  if (item.id === "avokado") {
    return {
      requested,
      catalogId: item.id,
      displayName: item.displayName,
      naive: offer("ica", "4 st Avokado (styckpris)", 56, item.unitLabel, false),
      chosen: offer("ica", "4 för 20 kr", 20, item.unitLabel, true),
      savingsSEK: 36,
      swapReason: "campaign",
      swapNote: "ICA har 4 för 20 idag.",
    };
  }
  return null;
}

function optimizeCatalogItem(
  item: CatalogItem,
  requested: RequestedItem,
  dateKey: string
): OptimizedItem {
  const scripted = scriptedSwap(item, requested);
  if (scripted) return scripted;

  const defaultStore = DEFAULT_STORE_BY_DOMAIN[item.domain];
  const naivePriceSEK = Math.round(priceAt(item, defaultStore, dateKey));
  const naiveName = brandedName(item.naiveBrand, item.displayName);
  const naive = offer(defaultStore, naiveName, naivePriceSEK, item.unitLabel, false);

  type Candidate = { offer: ProductOffer; savings: number; reason: SwapReason; note: string | null };
  const candidates: Candidate[] = [];

  if (item.naiveBrand !== item.smartBrand) {
    const discount = between(`${item.id}:${dateKey}:brand-disc`, 0.15, 0.32);
    const price = Math.round(naivePriceSEK * (1 - discount));
    candidates.push({
      offer: offer(defaultStore, brandedName(item.smartBrand, item.displayName), price, item.unitLabel, false),
      savings: naivePriceSEK - price,
      reason: "brand",
      note: null,
    });
  }

  const best = cheapestStoreFor(item, dateKey);
  if (best.priceSEK < naivePriceSEK) {
    const storeName = STORES[best.storeId].name;
    candidates.push({
      offer: offer(best.storeId, naiveName, best.priceSEK, item.unitLabel, best.onCampaign),
      savings: naivePriceSEK - best.priceSEK,
      reason: best.onCampaign ? "campaign" : "store",
      note: best.onCampaign
        ? `${storeName} har kampanj idag.`
        : `${storeName} är billigast idag.`,
    });
  }

  if (candidates.length === 0) {
    return {
      requested,
      catalogId: item.id,
      displayName: item.displayName,
      naive,
      chosen: naive,
      savingsSEK: 0,
      swapReason: null,
      swapNote: null,
    };
  }

  const winner = candidates.reduce((a, b) => (b.savings > a.savings ? b : a));
  return {
    requested,
    catalogId: item.id,
    displayName: item.displayName,
    naive,
    chosen: winner.offer,
    savingsSEK: Math.max(0, Math.round(winner.savings)),
    swapReason: winner.reason,
    swapNote: winner.note,
  };
}

/** For free text that matched nothing — still usable, just not swappable. */
function unmatchedItem(requested: RequestedItem, dateKey: string, domain: StoreDomain): OptimizedItem {
  const priceSEK = Math.round(between(`${requested.raw}:${dateKey}:unknown`, 18, 55));
  const label = requested.raw.trim();
  const displayName = label.charAt(0).toUpperCase() + label.slice(1);
  const naive = offer(DEFAULT_STORE_BY_DOMAIN[domain], displayName, priceSEK, "st", false);
  return {
    requested,
    catalogId: null,
    displayName,
    naive,
    chosen: naive,
    savingsSEK: 0,
    swapReason: null,
    swapNote: "Ny vara — vi lär oss priser för den här snart.",
  };
}

export function optimizeItem(
  requested: RequestedItem,
  dateKey: string,
  catalog: CatalogItem[] = CATALOG,
  domain: StoreDomain = "grocery"
): OptimizedItem {
  const item = matchCatalogItem(requested.raw, catalog);
  if (!item) return unmatchedItem(requested, dateKey, domain);
  return optimizeCatalogItem(item, requested, dateKey);
}

/** Re-prices a known catalog item at a specific store — used to compare
 *  "what if everything came from just this one store" for checkout. */
export function priceForCatalogIdAtStore(
  catalogId: string,
  storeId: StoreId,
  dateKey: string,
  catalog: CatalogItem[] = CATALOG
): number {
  const item = catalog.find((c) => c.id === catalogId);
  if (!item) return 0;
  return Math.round(priceAt(item, storeId, dateKey));
}

export { CATALOG };
