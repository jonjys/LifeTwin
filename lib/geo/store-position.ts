import { distanceToStoreKm } from "@/lib/cart-engine/distance";
import { bearingForStore, destinationPoint } from "@/lib/geo/offset";
import type { LatLng } from "@/lib/geo/types";
import type { StoreId } from "@/lib/types";

/**
 * Where a store sits on the map: the same seeded distance the Decision
 * Engine already costs gas/wear/time against (lib/cart-engine/distance.ts),
 * placed at a deterministic bearing around the user's real, geocoded
 * home coordinate. Nothing here invents a new distance — it only gives
 * the existing one a direction to draw.
 */
export function storeCoordinates(
  homeCoords: LatLng,
  homeAddress: string,
  storeId: StoreId
): LatLng {
  const distanceKm = distanceToStoreKm(homeAddress, storeId);
  const bearing = bearingForStore(`${homeAddress || "default-home"}:${storeId}`);
  return destinationPoint(homeCoords, distanceKm, bearing);
}
