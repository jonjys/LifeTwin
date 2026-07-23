import { STORE_LIST, STORES } from "@/lib/cart-engine/stores";
import { priceForCatalogIdAtStore } from "@/lib/cart-engine/optimize";
import type { CheckoutOption, OptimizedItem, StoreId } from "@/lib/types";

function totalAtSingleStore(items: OptimizedItem[], storeId: StoreId, dateKey: string): number {
  const itemsTotal = items.reduce((sum, it) => {
    const price = it.catalogId
      ? priceForCatalogIdAtStore(it.catalogId, storeId, dateKey)
      : it.naive.priceSEK;
    return sum + price;
  }, 0);
  return Math.round(itemsTotal) + STORES[storeId].deliveryFeeSEK;
}

/**
 * Three ways to check out: the true cross-store optimum, the single
 * fastest-delivery store, and the cheapest single store. Whichever of
 * the three actually costs least gets marked recommended — consolidating
 * into one store can beat the "optimal" mix once delivery fees stack up,
 * exactly like it would in real life.
 */
export function buildCheckoutOptions(items: OptimizedItem[], dateKey: string): CheckoutOption[] {
  if (items.length === 0) return [];

  const storesUsed = [...new Set(items.map((it) => it.chosen.store))];
  const mixedItemsTotal = items.reduce((sum, it) => sum + it.chosen.priceSEK, 0);
  const mixedDeliveryFees = storesUsed.reduce((sum, id) => sum + STORES[id].deliveryFeeSEK, 0);
  const cheapestTotal = Math.round(mixedItemsTotal) + mixedDeliveryFees;
  const cheapestEta = Math.max(...storesUsed.map((id) => STORES[id].deliveryEtaMin));

  const singleStoreTotals = STORE_LIST.map((s) => ({
    storeId: s.id,
    total: totalAtSingleStore(items, s.id, dateKey),
  }));

  const fastestStore = [...STORE_LIST].sort((a, b) => a.deliveryEtaMin - b.deliveryEtaMin)[0];
  const fastestTotal =
    singleStoreTotals.find((s) => s.storeId === fastestStore.id)?.total ?? cheapestTotal;

  const fewestStoresBest = [...singleStoreTotals].sort((a, b) => a.total - b.total)[0];

  const options: CheckoutOption[] = [
    {
      id: "cheapest",
      label: "Billigast",
      totalSEK: cheapestTotal,
      deliveryEtaMin: cheapestEta,
      storeIds: storesUsed,
      recommended: false,
    },
    {
      id: "fastest",
      label: "Snabbast hem",
      totalSEK: fastestTotal,
      deliveryEtaMin: fastestStore.deliveryEtaMin,
      storeIds: [fastestStore.id],
      recommended: false,
    },
    {
      id: "fewest-stores",
      label: "Minst antal butiker",
      totalSEK: fewestStoresBest.total,
      deliveryEtaMin: STORES[fewestStoresBest.storeId].deliveryEtaMin,
      storeIds: [fewestStoresBest.storeId],
      recommended: false,
    },
  ];

  const cheapestOption = options.reduce((a, b) => (b.totalSEK < a.totalSEK ? b : a));
  cheapestOption.recommended = true;

  return options;
}
