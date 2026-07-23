export const STORE_IDS = [
  "ica",
  "willys",
  "coop",
  "hemkop",
  "lidl",
  "citygross",
  "mathem",
] as const;

export type StoreId = (typeof STORE_IDS)[number];

export type Store = {
  id: StoreId;
  name: string;
  /** Short tag shown on badges/logos. */
  tag: string;
  /** Brand accent color for this store's badge. */
  color: string;
  deliveryEtaMin: number;
  deliveryFeeSEK: number;
};

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
};

/** One completed order, recorded for the savings dashboard. */
export type OrderRecord = {
  date: string;
  savingsSEK: number;
  totalSEK: number;
  checkoutOptionId: CheckoutOptionId;
};

/** Everything SmartCart persists locally. */
export type SmartCartState = {
  createdAt: string;
  /** Items seen across 2+ past lists — the "AI Memory" of usual purchases. */
  usualItems: string[];
  /** Every raw item the user has ever typed, for building AI Memory. */
  itemHistory: string[];
  orders: OrderRecord[];
  /** The list just built on /build — read by /cart to build the cart. */
  currentItems: string[];
};
