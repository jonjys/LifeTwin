import { reverseGeocode } from "@/lib/geo/geocode";

/**
 * Turns the browser's own Geolocation API into a real Swedish address via
 * reverseGeocode — used to auto-fill an empty homeAddress the moment the
 * app loads, so the live map, weather, and store distances all work from
 * your real location without a trip to /profile first. Resolves null on
 * any denial, timeout, or failure — the app already has an honest
 * Stockholm-centroid fallback for that case, so this never blocks anything.
 */
export function autoDetectHomeAddress(): Promise<string | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const address = await reverseGeocode({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        resolve(address);
      },
      () => resolve(null),
      { timeout: 10000 }
    );
  });
}
