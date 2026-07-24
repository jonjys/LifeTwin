import { distanceToStoreKm } from "@/lib/cart-engine/distance";
import { findRealStoreLocation } from "@/lib/geo/places";
import { bearingForStore, destinationPoint } from "@/lib/geo/offset";
import type { LatLng } from "@/lib/geo/types";
import type { StoreId } from "@/lib/types";

/**
 * Fallback only: the same seeded distance the Decision Engine already
 * costs gas/wear/time against (lib/cart-engine/distance.ts), placed at a
 * deterministic bearing around the user's real, geocoded home — used
 * only when no real storefront was found nearby.
 */
function seededStoreCoordinates(homeCoords: LatLng, homeAddress: string, storeId: StoreId): LatLng {
  const distanceKm = distanceToStoreKm(homeAddress, storeId);
  const bearing = bearingForStore(`${homeAddress || "default-home"}:${storeId}`);
  return destinationPoint(homeCoords, distanceKm, bearing);
}

export type ResolvedStorePosition = {
  coords: LatLng;
  /** The real storefront's own name (e.g. "ICA Kvantum Liljeholmen") when
   *  found, otherwise the generic chain name — for the map tooltip. */
  label: string;
  /** Whether `coords` is a real OpenStreetMap storefront or the seeded estimate. */
  real: boolean;
};

/**
 * Where a store actually sits on the map: first tries a real, named
 * storefront near the user's home (lib/geo/places.ts, OpenStreetMap via
 * Overpass), and only falls back to the seeded placement — same
 * distance the cost math already uses, just no confirmed real address —
 * when nothing real was found, the brand has no physical stores, or the
 * lookup is slow/unavailable.
 */
export async function resolveStoreCoordinates(
  homeCoords: LatLng,
  homeAddress: string,
  storeId: StoreId,
  chainName: string
): Promise<ResolvedStorePosition> {
  const real = await findRealStoreLocation(storeId, homeCoords);
  if (real) return { coords: real.coords, label: real.name, real: true };
  return { coords: seededStoreCoordinates(homeCoords, homeAddress, storeId), label: chainName, real: false };
}
