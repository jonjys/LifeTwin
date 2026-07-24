import { fetchWithTimeout } from "@/lib/geo/fetch-with-timeout";
import type { LatLng } from "@/lib/geo/types";
import type { StoreId } from "@/lib/types";

/** Two independent free Overpass instances — the public service is
 *  shared and occasionally slow or briefly rate-limited, so a failure on
 *  the first is retried against the second before giving up. */
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const SEARCH_RADIUS_M = 25000;
const QUERY_TIMEOUT_MS = 8000;

/** Real, physical chains only — Mathem and Matsmart are delivery/
 *  warehouse-only with no public storefront to search for, so they're
 *  intentionally absent and always fall back to the seeded placement. */
const BRAND_QUERY: Partial<Record<StoreId, string>> = {
  ica: "ICA",
  willys: "Willys",
  coop: "Coop",
  hemkop: "Hemköp",
  lidl: "Lidl",
  citygross: "City Gross",
  byggmax: "Byggmax",
  hornbach: "Hornbach",
  bauhaus: "Bauhaus",
  beijer: "Beijer",
  xlbygg: "XL-BYGG",
};

export type RealStoreMatch = { coords: LatLng; name: string };

type OverpassElement = { lat: number; lon: number; tags?: { name?: string } };

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function queryOverpass(endpoint: string, ql: string): Promise<OverpassElement[] | null> {
  const res = await fetchWithTimeout(`${endpoint}?data=${encodeURIComponent(ql)}`, QUERY_TIMEOUT_MS);
  if (!res || !res.ok) return null;
  const data = (await res.json()) as { elements?: OverpassElement[] };
  return data.elements ?? null;
}

/** Session-lifetime cache so re-rendering the map never repeats a lookup
 *  already in flight or already answered. */
const cache = new Map<string, Promise<RealStoreMatch | null>>();

/**
 * The real thing behind "Live karta": searches OpenStreetMap (via the
 * free, keyless Overpass API — the same public-data source Nominatim and
 * OSRM already draw from) for an actual, named storefront of the given
 * chain near the user's real geocoded home, and returns the nearest one.
 * Never throws — returns null on any failure (no match, brand has no
 * physical stores, or the shared service is slow/down) so the caller can
 * fall back to the existing seeded placement instead of breaking the map.
 */
export function findRealStoreLocation(storeId: StoreId, home: LatLng): Promise<RealStoreMatch | null> {
  const brand = BRAND_QUERY[storeId];
  if (!brand) return Promise.resolve(null);

  const cacheKey = `${storeId}:${home.lat.toFixed(3)}:${home.lng.toFixed(3)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const promise = (async (): Promise<RealStoreMatch | null> => {
    const ql = `[out:json][timeout:8];node["shop"]["name"~"${brand}",i](around:${SEARCH_RADIUS_M},${home.lat},${home.lng});out body 8;`;

    let elements: OverpassElement[] | null = null;
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        elements = await queryOverpass(endpoint, ql);
      } catch {
        elements = null;
      }
      if (elements && elements.length > 0) break;
    }
    if (!elements || elements.length === 0) return null;

    let nearest = elements[0];
    let nearestDistKm = haversineKm(home, { lat: nearest.lat, lng: nearest.lon });
    for (const el of elements.slice(1)) {
      const d = haversineKm(home, { lat: el.lat, lng: el.lon });
      if (d < nearestDistKm) {
        nearest = el;
        nearestDistKm = d;
      }
    }

    return { coords: { lat: nearest.lat, lng: nearest.lon }, name: nearest.tags?.name ?? brand };
  })();

  cache.set(cacheKey, promise);
  return promise;
}
