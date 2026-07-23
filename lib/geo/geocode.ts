import { fetchWithTimeout } from "@/lib/geo/fetch-with-timeout";
import type { LatLng } from "@/lib/geo/types";

/** Central Stockholm — used whenever geocoding fails or hasn't run yet. */
export const DEFAULT_HOME_COORDS: LatLng = { lat: 59.3293, lng: 18.0686 };

/**
 * Geocodes a free-text address via Nominatim (OpenStreetMap's free
 * geocoder — no API key). This is a real network call to a shared public
 * service with a fair-use rate limit, so callers should debounce (e.g. on
 * blur, not on every keystroke) rather than call this per keypress.
 * Falls back to null on any failure so the caller can show a sensible
 * default instead of breaking.
 */
export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const query = address.trim();
  if (!query) return null;

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
}
