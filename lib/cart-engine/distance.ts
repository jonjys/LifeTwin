import { between } from "@/lib/seeded";
import type { StoreId, TransportMode } from "@/lib/types";

/**
 * There is no real geocoding here — no map, no address lookup. Each
 * store gets a believable, deterministic distance from "home", seeded by
 * the user's address string so it stays stable but differs per user.
 */
export function distanceToStoreKm(homeAddress: string, storeId: StoreId): number {
  const seed = `${homeAddress || "default-home"}:${storeId}:distance`;
  return Math.round(between(seed, 0.8, 9) * 10) / 10;
}

const AVG_SPEED_KMH: Record<TransportMode, number> = {
  car: 40,
  ev: 40,
  motorcycle: 42,
  moped: 30,
  bike: 16,
  "cargo-bike": 13,
  walk: 4.8,
  "public-transit": 22,
};

export function travelTimeMin(distanceKm: number, mode: TransportMode): number {
  return Math.round((distanceKm / AVG_SPEED_KMH[mode]) * 60);
}

/** Browsing + queue time, per stop — grows a little with the list size. */
export function inStoreTimeMin(itemCount: number): number {
  return Math.round(8 + itemCount * 1.2);
}

export function walkingSteps(distanceKm: number): number {
  return Math.round(distanceKm * 1300);
}

export function walkingCalories(distanceKm: number): number {
  return Math.round(distanceKm * 60);
}

/** Grams of CO2 avoided by not driving this distance. */
export function co2AvoidedGrams(distanceKm: number): number {
  return Math.round(distanceKm * 180);
}

const FUEL_FREE_MODES: ReadonlySet<TransportMode> = new Set([
  "bike",
  "cargo-bike",
  "walk",
  "public-transit",
]);

export function usesFuel(mode: TransportMode): boolean {
  return !FUEL_FREE_MODES.has(mode);
}
