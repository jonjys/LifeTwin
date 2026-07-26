import { fetchWithTimeout } from "@/lib/geo/fetch-with-timeout";
import type { LatLng } from "@/lib/geo/types";

/** Central Stockholm — used whenever geocoding fails or hasn't run yet. */
export const DEFAULT_HOME_COORDS: LatLng = { lat: 59.3293, lng: 18.0686 };

/** Session-lifetime cache — more than one component (the live map, the
 *  weather lookup) geocodes the same home address, so this keeps that to
 *  one real Nominatim call instead of one per caller. */
const cache = new Map<string, Promise<LatLng | null>>();

/**
 * Geocodes a free-text address via Nominatim (OpenStreetMap's free
 * geocoder — no API key). This is a real network call to a shared public
 * service with a fair-use rate limit, so callers should debounce (e.g. on
 * blur, not on every keystroke) rather than call this per keypress.
 * Falls back to null on any failure so the caller can show a sensible
 * default instead of breaking.
 */
export function geocodeAddress(address: string): Promise<LatLng | null> {
  const query = address.trim();
  if (!query) return Promise.resolve(null);

  const cached = cache.get(query);
  if (cached) return cached;

  const promise = (async (): Promise<LatLng | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=se&q=${encodeURIComponent(query)}`;
      const res = await fetchWithTimeout(url);
      if (!res || !res.ok) return null;
      const results = (await res.json()) as Array<{ lat: string; lon: string }>;
      const first = results[0];
      if (!first) return null;
      return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
    } catch {
      return null;
    }
  })();

  cache.set(query, promise);
  return promise;
}

type NominatimAddress = {
  road?: string;
  pedestrian?: string;
  house_number?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
};

function formatReverseAddress(displayName: string, address?: NominatimAddress): string {
  if (!address) return displayName;
  const street = address.road ?? address.pedestrian;
  const streetLine = street && address.house_number ? `${street} ${address.house_number}` : street;
  const city = address.city ?? address.town ?? address.village ?? address.municipality;
  const parts = [streetLine, city].filter((p): p is string => Boolean(p));
  return parts.length > 0 ? parts.join(", ") : displayName;
}

/**
 * The reverse of geocodeAddress: turns a real coordinate (from the
 * browser's own Geolocation API) into a human-readable Swedish address,
 * via the same free Nominatim service. Used for "Använd min plats" on
 * /profile — the user grants location once, real GPS coordinates come
 * back, and this turns them into the address string the rest of the app
 * already runs on. Falls back to null on any failure.
 */
export async function reverseGeocode(coords: LatLng): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`;
    const res = await fetchWithTimeout(url);
    if (!res || !res.ok) return null;
    const data = (await res.json()) as { display_name?: string; address?: NominatimAddress };
    if (!data.display_name) return null;
    return formatReverseAddress(data.display_name, data.address);
  } catch {
    return null;
  }
}
