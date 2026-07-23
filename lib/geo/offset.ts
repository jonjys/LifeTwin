import { unit } from "@/lib/seeded";
import type { LatLng } from "@/lib/geo/types";

const EARTH_RADIUS_KM = 6371;

/**
 * Standard great-circle destination point: given an origin, a bearing,
 * and a distance, returns the resulting coordinate. This is how the
 * engine's already-seeded distances (lib/cart-engine/distance.ts) become
 * real map points around the user's real, geocoded home — the distances
 * driving all the cost math don't change, they just gain a direction.
 */
export function destinationPoint(
  origin: LatLng,
  distanceKm: number,
  bearingDeg: number
): LatLng {
  const angularDistance = distanceKm / EARTH_RADIUS_KM;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lng1 = (origin.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return { lat: (lat2 * 180) / Math.PI, lng: (((lng2 * 180) / Math.PI + 540) % 360) - 180 };
}

/** Deterministic bearing (0–360°) so each store lands in a stable direction. */
export function bearingForStore(seed: string): number {
  return Math.round(unit(`${seed}:bearing`) * 360);
}
