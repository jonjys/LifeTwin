export const STORE_IDS = [
  "ica",
  "willys",
  "coop",
  "hemkop",
  "lidl",
  "citygross",
  "mathem",
  "matsmart",
  "byggmax",
  "hornbach",
  "bauhaus",
  "beijer",
  "xlbygg",
] as const;

export type StoreId = (typeof STORE_IDS)[number];

/** Every project category draws from one retailer domain — a grocery
 *  store never gets compared against a building-materials store. */
export type StoreDomain = "grocery" | "building";

export type Store = {
  id: StoreId;
  name: string;
  /** Short tag shown on badges/logos. */
  tag: string;
  /** Brand accent color for this store's badge. */
  color: string;
  deliveryEtaMin: number;
  deliveryFeeSEK: number;
  domain: StoreDomain;
};

/* ------------------------------------------------------------------ */
/* Projects — the top-level entity everything else hangs off           */
/* ------------------------------------------------------------------ */

export const PROJECT_CATEGORIES = ["grocery", "deck"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/** One line the user asked for, e.g. "mjölk" or "tacos" (a meal, expanded to items). */
export type RequestedItem = {
  id: string;
  raw: string;
};

export type SwapReason = "brand" | "pack-size" | "campaign" | "store";

/** One product, priced at one store, on one day. */
export type ProductOffer = {
  store: StoreId;
  productName: string;
  priceSEK: number;
  /** Price per standard unit, for comparing pack sizes fairly. */
  unitPriceSEK: number;
  unitLabel: string;
  onCampaign: boolean;
  packSize: "small" | "large";
};

/** The result of optimizing one requested item across every store. */
export type OptimizedItem = {
  requested: RequestedItem;
  /** The catalog entry matched, or null if nothing matched. */
  catalogId: string | null;
  displayName: string;
  /** What a naive shopper would have picked: first store, default brand/size. */
  naive: ProductOffer;
  /** What SmartCart picked instead. */
  chosen: ProductOffer;
  savingsSEK: number;
  swapReason: SwapReason | null;
  /** One sentence explaining the swap, e.g. "ICA har 4 för 20 idag." */
  swapNote: string | null;
};

export type CheckoutOptionId = "cheapest" | "fastest" | "fewest-stores";

export type CheckoutOption = {
  id: CheckoutOptionId;
  label: string;
  totalSEK: number;
  deliveryEtaMin: number;
  storeIds: StoreId[];
  recommended: boolean;
};

export type NotificationKind =
  | "price-drop"
  | "wait-recommendation"
  | "campaign-start"
  | "usual-cart-cheaper";

export type SmartNotification = {
  id: string;
  kind: NotificationKind;
  text: string;
};

/** One optimized shopping cart, ready to render. */
export type CartResult = {
  items: OptimizedItem[];
  checkoutOptions: CheckoutOption[];
  notifications: SmartNotification[];
  totalNaiveSEK: number;
  totalOptimizedSEK: number;
  totalSavingsSEK: number;
  /** Which retailer domain this cart was built from — grocery-only
   *  features (AI Memory, Matsmart, notifications) only make sense here. */
  domain: StoreDomain;
};

/** One completed order, recorded for the savings dashboard. */
export type OrderRecord = {
  date: string;
  savingsSEK: number;
  totalSEK: number;
  checkoutOptionId: CheckoutOptionId;
  /** Which fulfillment method was actually used, if the Decision Engine ran. */
  fulfillmentId?: FulfillmentId;
  timeSavedMin?: number;
  carTripAvoided?: boolean;
  caloriesWalked?: number;
  co2SavedGrams?: number;
};

/* ------------------------------------------------------------------ */
/* Personal Profile — powers the Decision Engine                       */
/* ------------------------------------------------------------------ */

export const TRANSPORT_MODES = [
  "car",
  "ev",
  "motorcycle",
  "moped",
  "bike",
  "cargo-bike",
  "walk",
  "public-transit",
] as const;
export type TransportMode = (typeof TRANSPORT_MODES)[number];

export type FuelType = "petrol" | "diesel" | "electric";

export const SHOPPING_PREFERENCES = [
  "pickup",
  "delivery",
  "cheapest",
  "fastest",
  "fewest-stops",
  "avoid-queues",
  "evenings",
  "weekends",
] as const;
export type ShoppingPreference = (typeof SHOPPING_PREFERENCES)[number];

export const DELIVERY_PREFERENCES = [
  "home-delivery",
  "click-collect",
  "self-pickup",
  "mixed",
] as const;
export type DeliveryPreference = (typeof DELIVERY_PREFERENCES)[number];

export const FOOD_PREFERENCES = [
  "vegetarian",
  "vegan",
  "lchf",
  "gluten-free",
  "lactose-free",
  "halal",
  "kosher",
  "organic",
  "cheapest",
  "premium",
] as const;
export type FoodPreference = (typeof FOOD_PREFERENCES)[number];

export type UserProfile = {
  /** Optional — used only for the home screen's greeting. */
  name: string;
  homeAddress: string;
  transportMode: TransportMode;
  fuelType: FuelType;
  /** Liter (or kWh for EVs) per mil (10 km) — the Swedish standard unit. */
  fuelConsumptionPerMil: number;
  /** SEK per liter/kWh. */
  fuelPriceSEK: number;
  /** Wear-and-tear cost per mil, beyond fuel — tires, service, depreciation. */
  wearCostPerMilSEK: number;
  /** null = "vet inte" — the engine estimates a reasonable default. */
  hourlyValueSEK: number | null;
  shoppingPreferences: ShoppingPreference[];
  hasKids: boolean;
  kidsCount: number;
  hasDog: boolean;
  hasCat: boolean;
  hasOtherPets: boolean;
  foodPreferences: FoodPreference[];
  favoriteStores: StoreId[];
  deliveryPreference: DeliveryPreference;
  /** Owns a trailer — relevant for "Stora Köp" like bygga altan, where
   *  bulky building materials otherwise need a rented one. */
  hasTrailer: boolean;
};

/** A sensible starting point so the Decision Engine works before anyone
 *  visits /profile — refining it only sharpens the recommendations. */
export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  homeAddress: "",
  transportMode: "car",
  fuelType: "petrol",
  fuelConsumptionPerMil: 0.7,
  fuelPriceSEK: 18,
  wearCostPerMilSEK: 8,
  hourlyValueSEK: null,
  shoppingPreferences: [],
  hasKids: false,
  kidsCount: 0,
  hasDog: false,
  hasCat: false,
  hasOtherPets: false,
  foodPreferences: [],
  favoriteStores: [],
  deliveryPreference: "mixed",
  hasTrailer: false,
};

/** A reasonable estimate when the user doesn't know their hourly value. */
export const ESTIMATED_HOURLY_VALUE_SEK = 180;

/* ------------------------------------------------------------------ */
/* Decision Engine — pickup vs. delivery vs. walk                      */
/* ------------------------------------------------------------------ */

export const FULFILLMENT_IDS = ["pickup", "delivery", "walk"] as const;
export type FulfillmentId = (typeof FULFILLMENT_IDS)[number];

export type FulfillmentOption = {
  id: FulfillmentId;
  label: string;
  totalSEK: number;
  timeMin: number;
  gasSEK: number;
  wearCostSEK: number;
  deliveryFeeSEK: number;
  steps: number;
  calories: number;
  co2Grams: number;
  storeIds: StoreId[];
  recommended: boolean;
  /** "Stora Köp": a rented trailer, when the load is bulky and the
   *  user doesn't own one — folded into totalSEK, shown separately. */
  extraFeeSEK?: number;
  extraFeeLabel?: string;
};

export type DecisionResult = {
  options: FulfillmentOption[];
  recommendedId: FulfillmentId;
  /** e.g. "Du sparar bara 51 kr genom att köra själv. Din tid är betydligt mer värd." */
  recommendationText: string;
  /** Set when real weather made walking measurably less attractive today. */
  weatherNote: string | null;
};

/** Live conditions at the user's home, from lib/geo/weather.ts — a real
 *  input the Decision Engine can weigh, not a mocked one. */
export type WeatherSnapshot = {
  tempC: number;
  precipitationMm: number;
  /** Rain, extreme cold, or extreme heat — walking is measurably worse. */
  harsh: boolean;
  /** "regn" | "kyla" | "värme" | "" (empty when not harsh). */
  reason: string;
};

/* ------------------------------------------------------------------ */
/* AI Shopping Routes                                                   */
/* ------------------------------------------------------------------ */

export type RouteStop = {
  store: StoreId;
  distanceFromPreviousKm: number;
  itemNames: string[];
  stopSavingsSEK: number;
  skipRecommended: boolean;
  skipReasonText: string | null;
};

export type ShoppingRoute = {
  stops: RouteStop[];
  totalExtraTimeMin: number;
  totalSavingsSEK: number;
};

/* ------------------------------------------------------------------ */
/* Matsmart deals                                                       */
/* ------------------------------------------------------------------ */

export type MatsmartDeal = {
  catalogId: string;
  displayName: string;
  discountPct: number;
  priceSEK: number;
};

/** Everything ProjektOS persists locally. */
export type SmartCartState = {
  createdAt: string;
  profile: UserProfile;
  /** Items seen across 2+ past grocery lists — the "AI Memory" of usual purchases. */
  usualItems: string[];
  /** Every raw grocery item the user has ever typed, for building AI Memory. */
  itemHistory: string[];
  orders: OrderRecord[];
  /** The list just built for the current project — read by /cart. */
  currentItems: string[];
  /** Which project is currently being planned/shopped for. */
  currentCategory: ProjectCategory;
  /** Set when currentCategory is "deck" — the inputs the AI Plan was generated from. */
  deckDimensions: { widthM: number; depthM: number } | null;
};
