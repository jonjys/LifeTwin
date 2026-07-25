import { fetchWithTimeout } from "@/lib/geo/fetch-with-timeout";
import type { LatLng } from "@/lib/geo/types";
import type { WeatherSnapshot } from "@/lib/types";

const HARSH_PRECIP_MM = 0.3;
const HARSH_COLD_C = -5;
const HARSH_HOT_C = 28;

/**
 * Real, live weather at the user's geocoded home, via Open-Meteo (free,
 * no API key, no rate-limit surprises so far — unlike some of the other
 * free services this app leans on). Used to give the Decision Engine one
 * more real input: walking to the store in the rain isn't actually free,
 * even though the cost math alone can't see that. Never throws — returns
 * null on any failure so the caller just skips the weather adjustment.
 */
export async function fetchCurrentWeather(coords: LatLng): Promise<WeatherSnapshot | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,precipitation`;
    const res = await fetchWithTimeout(url, 6000);
    if (!res || !res.ok) return null;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; precipitation?: number };
    };
    const tempC = data.current?.temperature_2m;
    const precipitationMm = data.current?.precipitation;
    if (tempC === undefined || precipitationMm === undefined) return null;

    let reason = "";
    if (precipitationMm > HARSH_PRECIP_MM) reason = "regn";
    else if (tempC < HARSH_COLD_C) reason = "kyla";
    else if (tempC > HARSH_HOT_C) reason = "värme";

    return { tempC, precipitationMm, harsh: reason !== "", reason };
  } catch {
    return null;
  }
}
