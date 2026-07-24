import {
  co2AvoidedGrams,
  distanceToStoreKm,
  inStoreTimeMin,
  travelTimeMin,
  usesFuel,
  walkingCalories,
  walkingSteps,
} from "@/lib/cart-engine/distance";
import { STORES } from "@/lib/cart-engine/stores";
import {
  ESTIMATED_HOURLY_VALUE_SEK,
  type CartResult,
  type DecisionResult,
  type FulfillmentOption,
  type StoreId,
  type UserProfile,
} from "@/lib/types";

function roundTripDistanceKm(homeAddress: string, storeIds: StoreId[]): number {
  // No real routing between stores — a round trip home → each store → home,
  // which is the honest worst case when stores aren't on the way to each other.
  return storeIds.reduce((sum, id) => sum + distanceToStoreKm(homeAddress, id) * 2, 0);
}

function driveModeLabel(profile: UserProfile): string {
  switch (profile.transportMode) {
    case "car":
    case "ev":
      return "köra själv";
    case "motorcycle":
    case "moped":
      return "köra dit själv";
    case "bike":
    case "cargo-bike":
      return "cykla dit själv";
    default:
      return "hämta själv";
  }
}

function buildRecommendationText(
  pickup: FulfillmentOption,
  delivery: FulfillmentOption,
  walk: FulfillmentOption,
  recommendedId: FulfillmentOption["id"],
  profile: UserProfile
): string {
  if (recommendedId === "delivery") {
    const moneySaved = pickup.totalSEK - delivery.totalSEK;
    if (moneySaved > 0) {
      return `Du sparar bara ${moneySaved} kr genom att ${driveModeLabel(profile)}. Din tid är betydligt mer värd.`;
    }
    const timeSaved = pickup.timeMin - delivery.timeMin;
    return `Ta hemleverans istället. Du sparar ${timeSaved} minuter.`;
  }
  if (recommendedId === "walk") {
    const extraTime = Math.max(0, walk.timeMin - Math.min(pickup.timeMin, delivery.timeMin));
    return `Promenera istället. Det tar ${extraTime} minuter extra men sparar bensin och ger dagens motion.`;
  }
  const moneySaved = delivery.totalSEK - pickup.totalSEK;
  const extraTime = Math.max(0, pickup.timeMin - delivery.timeMin);
  return `Hämta själv. Du sparar ${moneySaved} kr på ${extraTime} extra minuter.`;
}

/**
 * The core of the Decision Engine: not three prices, but three fully
 * costed outcomes — money, time, gas, wear, steps, calories, CO2 — scored
 * against the user's own hourly value so the "best" option is whichever
 * actually costs least once time is priced in.
 */
export function computeFulfillmentOptions(
  cart: CartResult,
  profile: UserProfile
): DecisionResult {
  const cheapest =
    cart.checkoutOptions.find((o) => o.id === "cheapest") ?? cart.checkoutOptions[0];
  const storeIds = cheapest.storeIds;
  const itemCount = cart.items.length;
  const hourlyValue = profile.hourlyValueSEK ?? ESTIMATED_HOURLY_VALUE_SEK;

  const deliveryFeesSEK = storeIds.reduce((sum, id) => sum + STORES[id].deliveryFeeSEK, 0);
  const itemsOnlySEK = cheapest.totalSEK - deliveryFeesSEK;

  const distanceKm = roundTripDistanceKm(profile.homeAddress, storeIds);
  const inStoreMin = inStoreTimeMin(itemCount) * storeIds.length;

  const pickupDriveMin = travelTimeMin(distanceKm, profile.transportMode);
  const pickupTimeMin = pickupDriveMin + inStoreMin;
  const fuelNeeded = usesFuel(profile.transportMode);
  const gasSEK = fuelNeeded
    ? Math.round((distanceKm / 10) * profile.fuelConsumptionPerMil * profile.fuelPriceSEK)
    : 0;
  const wearSEK = fuelNeeded ? Math.round((distanceKm / 10) * profile.wearCostPerMilSEK) : 0;

  const pickup: FulfillmentOption = {
    id: "pickup",
    label: "Hämta själv",
    totalSEK: itemsOnlySEK + gasSEK + wearSEK,
    timeMin: pickupTimeMin,
    gasSEK,
    wearCostSEK: wearSEK,
    deliveryFeeSEK: 0,
    steps: 0,
    calories: 0,
    co2Grams: 0,
    storeIds,
    recommended: false,
  };

  const delivery: FulfillmentOption = {
    id: "delivery",
    label: "Hemleverans",
    totalSEK: cheapest.totalSEK,
    timeMin: 5,
    gasSEK: 0,
    wearCostSEK: 0,
    deliveryFeeSEK: deliveryFeesSEK,
    steps: 0,
    calories: 0,
    co2Grams: co2AvoidedGrams(distanceKm),
    storeIds,
    recommended: false,
  };

  const walkTimeMin = travelTimeMin(distanceKm, "walk") + inStoreMin;
  const walk: FulfillmentOption = {
    id: "walk",
    label: "Promenera",
    totalSEK: itemsOnlySEK,
    timeMin: walkTimeMin,
    gasSEK: 0,
    wearCostSEK: 0,
    deliveryFeeSEK: 0,
    steps: walkingSteps(distanceKm),
    calories: walkingCalories(distanceKm),
    co2Grams: co2AvoidedGrams(distanceKm),
    storeIds,
    recommended: false,
  };

  // Bulky building materials aren't realistically carried home on foot —
  // "Promenera" only makes sense for a grocery-domain cart.
  const options = cart.domain === "building" ? [pickup, delivery] : [pickup, delivery, walk];
  const netCost = (opt: FulfillmentOption) => opt.totalSEK + (opt.timeMin / 60) * hourlyValue;
  const winner = options.reduce((a, b) => (netCost(b) < netCost(a) ? b : a));
  winner.recommended = true;

  return {
    options,
    recommendedId: winner.id,
    recommendationText: buildRecommendationText(pickup, delivery, walk, winner.id, profile),
  };
}
