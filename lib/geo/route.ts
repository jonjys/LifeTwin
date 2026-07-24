import { fetchWithTimeout } from "@/lib/geo/fetch-with-timeout";
import type { LatLng } from "@/lib/geo/types";

/**
 * Real road-following geometry from OSRM's public demo routing server
 * (no API key, but a shared, rate-limited service — fine for a demo,
 * not for production traffic). Falls back to null on any failure so the
 * caller can draw a straight line instead of breaking the map.
 */
export async function fetchDrivingRoute(from: LatLng, to: LatLng): Promise<LatLng[] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetchWithTimeout(url);
    if (!res || !res.ok) return null;
    const data = (await res.json()) as {
      routes?: Array<{ geometry: { coordinates: [number, number][] } }>;
    };
    const coords = data.routes?.[0]?.geometry.coordinates;
    if (!coords || coords.length === 0) return null;
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return null;
  }
}
