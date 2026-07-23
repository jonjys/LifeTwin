import { distanceToStoreKm, travelTimeMin, inStoreTimeMin } from "@/lib/cart-engine/distance";
import { ESTIMATED_HOURLY_VALUE_SEK } from "@/lib/types";
import type { CartResult, RouteStop, ShoppingRoute, StoreId, UserProfile } from "@/lib/types";

/**
 * When "hämta själv" spans multiple stores, this is the route — and
 * whether every stop actually earns its place. A stop only survives if
 * its savings beat the extra time it costs, priced at the user's own
 * hourly value; the first stop is always kept, since skipping it just
 * means picking a different first stop.
 */
export function buildShoppingRoute(cart: CartResult, profile: UserProfile): ShoppingRoute {
  const byStore = new Map<StoreId, typeof cart.items>();
  for (const item of cart.items) {
    const list = byStore.get(item.chosen.store) ?? [];
    list.push(item);
    byStore.set(item.chosen.store, list);
  }

  const storeIds = [...byStore.keys()];
  if (storeIds.length <= 1) {
    return { stops: [], totalExtraTimeMin: 0, totalSavingsSEK: 0 };
  }

  const ordered = storeIds
    .map((id) => ({ id, distanceKm: distanceToStoreKm(profile.homeAddress, id) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const hourlyValue = profile.hourlyValueSEK ?? ESTIMATED_HOURLY_VALUE_SEK;
  const fuelCostPerKm =
    (profile.fuelConsumptionPerMil * profile.fuelPriceSEK + profile.wearCostPerMilSEK) / 10;

  let previousDistance = 0;
  let totalExtraTimeMin = 0;
  let totalSavingsSEK = 0;

  const stops: RouteStop[] = ordered.map(({ id, distanceKm }, index) => {
    const items = byStore.get(id) ?? [];
    const stopSavingsSEK = items.reduce((sum, it) => sum + it.savingsSEK, 0);
    // A rough leg estimate: the extra detour beyond the direct route home.
    const legDistanceKm = index === 0 ? distanceKm : Math.abs(distanceKm - previousDistance) + 1;
    previousDistance = distanceKm;

    const legTimeMin = travelTimeMin(legDistanceKm, profile.transportMode) + inStoreTimeMin(items.length);
    const legCostSEK = (legTimeMin / 60) * hourlyValue + legDistanceKm * fuelCostPerKm;
    const skipRecommended = index > 0 && stopSavingsSEK < legCostSEK;

    totalExtraTimeMin += legTimeMin;
    totalSavingsSEK += stopSavingsSEK;

    return {
      store: id,
      distanceFromPreviousKm: Math.round(legDistanceKm * 10) / 10,
      itemNames: items.map((it) => it.displayName),
      stopSavingsSEK,
      skipRecommended,
      skipReasonText: skipRecommended
        ? `Du sparar bara ${stopSavingsSEK} kr. Inte värt stoppet.`
        : null,
    };
  });

  return { stops, totalExtraTimeMin: Math.round(totalExtraTimeMin), totalSavingsSEK };
}
