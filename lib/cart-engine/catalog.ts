import type { StoreDomain } from "@/lib/types";

export const GROCERY_CATEGORIES = [
  "Kylvaror",
  "Frys",
  "Skafferi",
  "Frukt & Grönt",
  "Kött & Fisk",
  "Bröd & Bageri",
  "Dryck & Snacks",
] as const;
export type GroceryCategory = (typeof GROCERY_CATEGORIES)[number];

export type CatalogItem = {
  id: string;
  keywords: string[];
  displayName: string;
  unitLabel: string;
  /** A believable "naive" single-unit price, name-brand, no campaign. */
  basePriceSEK: number;
  naiveBrand: string;
  /** The cheaper store-brand alternative Karma swaps toward. */
  smartBrand: string;
  /** Large-pack details, for items where buying bigger is the smarter move. */
  bulkPack?: { naiveUnits: number; bulkPriceSEK: number; bulkLabel: string };
  /** Which retailer domain prices this item — grocery vs. building, etc. */
  domain: StoreDomain;
  /** Grocery-only aisle grouping — "Kylvaror", "Frys", "bunkra upp"… — used
   *  by the category picker on /build and by the week planner. */
  category?: GroceryCategory;
};

type GroceryItemInput = Omit<CatalogItem, "domain">;

/**
 * A small, believable grocery catalog. Prices are illustrative, not real —
 * there is no live pricing API here, only deterministic mock data seeded
 * per day (see optimize.ts).
 */
const GROCERY_ITEMS: GroceryItemInput[] = [
  {
    // Must come before "mjolk" below — its own "lattmjolk" keyword is a
    // substring of "mjolk"'s keyword match order would otherwise never
    // let a request for lättmjölk resolve to anything but regular mjölk
    // (matchCatalogItem is first-array-hit; see catalog.test.ts).
    id: "lattmjolk",
    keywords: ["lättmjölk", "lattmjolk"],
    displayName: "Lättmjölk",
    unitLabel: "liter",
    basePriceSEK: 14,
    naiveBrand: "Arla",
    smartBrand: "ICA Basic",
    category: "Kylvaror",
  },
  {
    id: "mjolk",
    keywords: ["mjölk", "mjolk", "milk"],
    displayName: "Mjölk",
    unitLabel: "liter",
    basePriceSEK: 15,
    naiveBrand: "Arla",
    smartBrand: "ICA Basic",
    bulkPack: { naiveUnits: 2, bulkPriceSEK: 19, bulkLabel: "1 stor (2L)" },
    category: "Kylvaror",
  },
  {
    id: "kottfars",
    keywords: ["köttfärs", "kottfars", "nötfärs", "notfars"],
    displayName: "Köttfärs",
    unitLabel: "kg",
    basePriceSEK: 79,
    naiveBrand: "Scan",
    smartBrand: "ICA Basic",
    category: "Kött & Fisk",
  },
  {
    id: "kyckling",
    keywords: ["kyckling", "kycklingfilé", "kycklingfile"],
    displayName: "Kycklingfilé",
    unitLabel: "kg",
    basePriceSEK: 89,
    naiveBrand: "Kronfågel",
    smartBrand: "ICA Basic",
    category: "Kött & Fisk",
  },
  {
    id: "lax",
    keywords: ["lax", "laxfilé", "laxfile"],
    displayName: "Laxfilé",
    unitLabel: "kg",
    basePriceSEK: 149,
    naiveBrand: "",
    smartBrand: "",
    category: "Kött & Fisk",
  },
  {
    id: "kaffe",
    keywords: ["kaffe", "coffee"],
    displayName: "Kaffe",
    unitLabel: "paket",
    basePriceSEK: 59,
    naiveBrand: "Zoégas",
    smartBrand: "Gevalia",
    category: "Skafferi",
  },
  {
    id: "bananer",
    keywords: ["banan", "bananer"],
    displayName: "Bananer",
    unitLabel: "kg",
    basePriceSEK: 22,
    naiveBrand: "",
    smartBrand: "",
    category: "Frukt & Grönt",
  },
  {
    id: "vattenmelon",
    keywords: ["vattenmelon", "melon"],
    displayName: "Vattenmelon",
    unitLabel: "st",
    basePriceSEK: 39,
    naiveBrand: "",
    smartBrand: "",
    category: "Frukt & Grönt",
  },
  {
    id: "chips",
    keywords: ["chips"],
    displayName: "Chips",
    unitLabel: "påse",
    basePriceSEK: 29,
    naiveBrand: "OLW",
    smartBrand: "ICA Basic",
    category: "Dryck & Snacks",
  },
  {
    id: "ketchup",
    keywords: ["ketchup"],
    displayName: "Ketchup",
    unitLabel: "flaska",
    basePriceSEK: 32,
    naiveBrand: "Felix",
    smartBrand: "ICA Basic",
    category: "Skafferi",
  },
  {
    id: "avokado",
    keywords: ["avokado", "avocado"],
    displayName: "Avokado",
    unitLabel: "st",
    basePriceSEK: 14,
    naiveBrand: "",
    smartBrand: "",
    category: "Frukt & Grönt",
  },
  {
    id: "smor",
    keywords: ["smör", "smor", "bregott"],
    displayName: "Smör",
    unitLabel: "förpackning",
    basePriceSEK: 45,
    naiveBrand: "Bregott",
    smartBrand: "ICA Basic",
    category: "Kylvaror",
  },
  {
    id: "pasta",
    keywords: ["pasta", "spagetti", "spaghetti"],
    displayName: "Pasta",
    unitLabel: "paket",
    basePriceSEK: 18,
    naiveBrand: "Eldorado",
    smartBrand: "ICA Basic",
    category: "Skafferi",
  },
  {
    id: "agg",
    keywords: ["ägg", "agg", "eggs"],
    displayName: "Ägg",
    unitLabel: "förpackning",
    basePriceSEK: 39,
    naiveBrand: "",
    smartBrand: "",
    category: "Kylvaror",
  },
  {
    id: "ost",
    keywords: ["ost", "riven ost"],
    displayName: "Ost",
    unitLabel: "paket",
    basePriceSEK: 55,
    naiveBrand: "Arla",
    smartBrand: "ICA Basic",
    category: "Kylvaror",
  },
  {
    id: "tacokrydda",
    keywords: ["tacokrydda", "tacokryddmix"],
    displayName: "Tacokrydda",
    unitLabel: "påse",
    basePriceSEK: 15,
    naiveBrand: "Santa Maria",
    smartBrand: "ICA Basic",
    category: "Skafferi",
  },
  {
    id: "tortilla",
    keywords: ["tortilla", "tortillabröd"],
    displayName: "Tortillabröd",
    unitLabel: "paket",
    basePriceSEK: 25,
    naiveBrand: "Santa Maria",
    smartBrand: "ICA Basic",
    category: "Skafferi",
  },
  {
    id: "salsa",
    keywords: ["salsa"],
    displayName: "Salsa",
    unitLabel: "burk",
    basePriceSEK: 22,
    naiveBrand: "Santa Maria",
    smartBrand: "ICA Basic",
    category: "Skafferi",
  },
  {
    id: "brod",
    keywords: ["bröd", "brod", "limpa"],
    displayName: "Bröd",
    unitLabel: "st",
    basePriceSEK: 28,
    naiveBrand: "",
    smartBrand: "",
    category: "Bröd & Bageri",
  },
  {
    id: "frallor",
    keywords: ["frallor", "fralla"],
    displayName: "Frallor",
    unitLabel: "paket",
    basePriceSEK: 25,
    naiveBrand: "",
    smartBrand: "",
    category: "Bröd & Bageri",
  },
  {
    id: "yoghurt",
    keywords: ["yoghurt", "yogurt"],
    displayName: "Yoghurt",
    unitLabel: "förpackning",
    basePriceSEK: 32,
    naiveBrand: "Arla",
    smartBrand: "ICA Basic",
    category: "Kylvaror",
  },
  {
    id: "tomater",
    keywords: ["tomat", "tomater"],
    displayName: "Tomater",
    unitLabel: "kg",
    basePriceSEK: 35,
    naiveBrand: "",
    smartBrand: "",
    category: "Frukt & Grönt",
  },
  {
    id: "gurka",
    keywords: ["gurka"],
    displayName: "Gurka",
    unitLabel: "st",
    basePriceSEK: 12,
    naiveBrand: "",
    smartBrand: "",
    category: "Frukt & Grönt",
  },
  {
    id: "pepsi",
    keywords: ["pepsi", "pepsi max", "läsk", "lask"],
    displayName: "Pepsi Max",
    unitLabel: "flaska",
    basePriceSEK: 22,
    naiveBrand: "",
    smartBrand: "",
    category: "Dryck & Snacks",
  },
  {
    id: "applen",
    keywords: ["äpple", "applen", "äpplen"],
    displayName: "Äpplen",
    unitLabel: "kg",
    basePriceSEK: 29,
    naiveBrand: "",
    smartBrand: "",
    category: "Frukt & Grönt",
  },
  {
    id: "glass",
    keywords: ["glass"],
    displayName: "Glass",
    unitLabel: "liter",
    basePriceSEK: 49,
    naiveBrand: "GB Glace",
    smartBrand: "ICA Basic",
    category: "Frys",
  },
  {
    id: "frystpizza",
    keywords: ["fryst pizza", "frysta pizza", "pizza"],
    displayName: "Fryst pizza",
    unitLabel: "st",
    basePriceSEK: 45,
    naiveBrand: "Grandiosa",
    smartBrand: "ICA Basic",
    category: "Frys",
  },
  {
    id: "fiskpinnar",
    keywords: ["fiskpinnar"],
    displayName: "Fiskpinnar",
    unitLabel: "paket",
    basePriceSEK: 39,
    naiveBrand: "Findus",
    smartBrand: "ICA Basic",
    category: "Frys",
  },
  {
    id: "frystagronsaker",
    keywords: ["frysta grönsaker", "frysta gronsaker", "fryst grönsaksmix"],
    displayName: "Frysta grönsaker",
    unitLabel: "påse",
    basePriceSEK: 29,
    naiveBrand: "Findus",
    smartBrand: "ICA Basic",
    category: "Frys",
  },
];

export const CATALOG: CatalogItem[] = GROCERY_ITEMS.map((item) => ({
  ...item,
  domain: "grocery" as const,
}));

/** Meals expand into a few grocery items — "tacos" isn't a product.
 *  Keys are matched exactly (trimmed, lowercased) against what the AI
 *  Meal Planner (`/build/meals`) sends through, the same expansion
 *  `expandItems` already applies to free-text /build input. */
export const MEAL_EXPANSIONS: Record<string, string[]> = {
  tacos: ["tacokrydda", "tortilla", "kottfars", "ost", "salsa"],
  taco: ["tacokrydda", "tortilla", "kottfars", "ost", "salsa"],
  "pasta bolognese": ["pasta", "kottfars", "tomater", "ost"],
  kycklinggryta: ["kyckling", "frystagronsaker", "tomater"],
  laxwok: ["lax", "frystagronsaker"],
  pannkakor: ["agg", "mjolk", "smor"],
  "grekisk sallad": ["tomater", "gurka", "ost"],
  avokadotoast: ["brod", "avokado", "agg"],
  fruktsallad: ["bananer", "applen", "vattenmelon"],
};

/** Display list for the AI Meal Planner's chip picker — one entry per
 *  distinct meal (skips the "taco"/"tacos" duplicate key). */
export const MEAL_OPTIONS: { value: string; label: string }[] = [
  { value: "tacos", label: "Tacos" },
  { value: "pasta bolognese", label: "Pasta Bolognese" },
  { value: "kycklinggryta", label: "Kycklinggryta" },
  { value: "laxwok", label: "Laxwok" },
  { value: "pannkakor", label: "Pannkakor" },
  { value: "grekisk sallad", label: "Grekisk sallad" },
  { value: "avokadotoast", label: "Avokadotoast" },
  { value: "fruktsallad", label: "Fruktsallad" },
];

/** Fuzzy-matches free text against a catalog's keyword lists — defaults
 *  to the grocery catalog, but any project's catalog works the same way. */
export function matchCatalogItem(raw: string, catalog: CatalogItem[] = CATALOG): CatalogItem | null {
  const needle = raw.trim().toLowerCase();
  if (!needle) return null;
  return (
    catalog.find((item) => item.keywords.some((k) => needle.includes(k))) ?? null
  );
}

/** The grocery catalog grouped by aisle, in `GROCERY_CATEGORIES` order —
 *  what the category picker on /build and the week planner iterate over. */
export function groceryItemsByCategory(): Record<GroceryCategory, CatalogItem[]> {
  const grouped = Object.fromEntries(GROCERY_CATEGORIES.map((c) => [c, [] as CatalogItem[]])) as Record<
    GroceryCategory,
    CatalogItem[]
  >;
  for (const item of CATALOG) {
    if (item.category) grouped[item.category].push(item);
  }
  return grouped;
}
