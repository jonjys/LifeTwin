import type { StoreDomain } from "@/lib/types";

export type CatalogItem = {
  id: string;
  keywords: string[];
  displayName: string;
  unitLabel: string;
  /** A believable "naive" single-unit price, name-brand, no campaign. */
  basePriceSEK: number;
  naiveBrand: string;
  /** The cheaper store-brand alternative ProjektOS swaps toward. */
  smartBrand: string;
  /** Large-pack details, for items where buying bigger is the smarter move. */
  bulkPack?: { naiveUnits: number; bulkPriceSEK: number; bulkLabel: string };
  /** Which retailer domain prices this item — grocery vs. building, etc. */
  domain: StoreDomain;
};

type GroceryItemInput = Omit<CatalogItem, "domain">;

/**
 * A small, believable grocery catalog. Prices are illustrative, not real —
 * there is no live pricing API here, only deterministic mock data seeded
 * per day (see optimize.ts).
 */
const GROCERY_ITEMS: GroceryItemInput[] = [
  {
    id: "mjolk",
    keywords: ["mjölk", "mjolk", "milk"],
    displayName: "Mjölk",
    unitLabel: "liter",
    basePriceSEK: 15,
    naiveBrand: "Arla",
    smartBrand: "ICA Basic",
    bulkPack: { naiveUnits: 2, bulkPriceSEK: 19, bulkLabel: "1 stor (2L)" },
  },
  {
    id: "lattmjolk",
    keywords: ["lättmjölk", "lattmjolk"],
    displayName: "Lättmjölk",
    unitLabel: "liter",
    basePriceSEK: 14,
    naiveBrand: "Arla",
    smartBrand: "ICA Basic",
  },
  {
    id: "kottfars",
    keywords: ["köttfärs", "kottfars", "nötfärs", "notfars"],
    displayName: "Köttfärs",
    unitLabel: "kg",
    basePriceSEK: 79,
    naiveBrand: "Scan",
    smartBrand: "ICA Basic",
  },
  {
    id: "kaffe",
    keywords: ["kaffe", "coffee"],
    displayName: "Kaffe",
    unitLabel: "paket",
    basePriceSEK: 59,
    naiveBrand: "Zoégas",
    smartBrand: "Gevalia",
  },
  {
    id: "bananer",
    keywords: ["banan", "bananer"],
    displayName: "Bananer",
    unitLabel: "kg",
    basePriceSEK: 22,
    naiveBrand: "",
    smartBrand: "",
  },
  {
    id: "vattenmelon",
    keywords: ["vattenmelon", "melon"],
    displayName: "Vattenmelon",
    unitLabel: "st",
    basePriceSEK: 39,
    naiveBrand: "",
    smartBrand: "",
  },
  {
    id: "chips",
    keywords: ["chips"],
    displayName: "Chips",
    unitLabel: "påse",
    basePriceSEK: 29,
    naiveBrand: "OLW",
    smartBrand: "ICA Basic",
  },
  {
    id: "ketchup",
    keywords: ["ketchup"],
    displayName: "Ketchup",
    unitLabel: "flaska",
    basePriceSEK: 32,
    naiveBrand: "Felix",
    smartBrand: "ICA Basic",
  },
  {
    id: "avokado",
    keywords: ["avokado", "avocado"],
    displayName: "Avokado",
    unitLabel: "st",
    basePriceSEK: 14,
    naiveBrand: "",
    smartBrand: "",
  },
  {
    id: "smor",
    keywords: ["smör", "smor", "bregott"],
    displayName: "Smör",
    unitLabel: "förpackning",
    basePriceSEK: 45,
    naiveBrand: "Bregott",
    smartBrand: "ICA Basic",
  },
  {
    id: "pasta",
    keywords: ["pasta", "spagetti", "spaghetti"],
    displayName: "Pasta",
    unitLabel: "paket",
    basePriceSEK: 18,
    naiveBrand: "Eldorado",
    smartBrand: "ICA Basic",
  },
  {
    id: "agg",
    keywords: ["ägg", "agg", "eggs"],
    displayName: "Ägg",
    unitLabel: "förpackning",
    basePriceSEK: 39,
    naiveBrand: "",
    smartBrand: "",
  },
  {
    id: "ost",
    keywords: ["ost", "riven ost"],
    displayName: "Ost",
    unitLabel: "paket",
    basePriceSEK: 55,
    naiveBrand: "Arla",
    smartBrand: "ICA Basic",
  },
  {
    id: "tacokrydda",
    keywords: ["tacokrydda", "tacokryddmix"],
    displayName: "Tacokrydda",
    unitLabel: "påse",
    basePriceSEK: 15,
    naiveBrand: "Santa Maria",
    smartBrand: "ICA Basic",
  },
  {
    id: "tortilla",
    keywords: ["tortilla", "tortillabröd"],
    displayName: "Tortillabröd",
    unitLabel: "paket",
    basePriceSEK: 25,
    naiveBrand: "Santa Maria",
    smartBrand: "ICA Basic",
  },
  {
    id: "salsa",
    keywords: ["salsa"],
    displayName: "Salsa",
    unitLabel: "burk",
    basePriceSEK: 22,
    naiveBrand: "Santa Maria",
    smartBrand: "ICA Basic",
  },
  {
    id: "brod",
    keywords: ["bröd", "brod", "limpa"],
    displayName: "Bröd",
    unitLabel: "st",
    basePriceSEK: 28,
    naiveBrand: "",
    smartBrand: "",
  },
  {
    id: "yoghurt",
    keywords: ["yoghurt", "yogurt"],
    displayName: "Yoghurt",
    unitLabel: "förpackning",
    basePriceSEK: 32,
    naiveBrand: "Arla",
    smartBrand: "ICA Basic",
  },
  {
    id: "tomater",
    keywords: ["tomat", "tomater"],
    displayName: "Tomater",
    unitLabel: "kg",
    basePriceSEK: 35,
    naiveBrand: "",
    smartBrand: "",
  },
  {
    id: "gurka",
    keywords: ["gurka"],
    displayName: "Gurka",
    unitLabel: "st",
    basePriceSEK: 12,
    naiveBrand: "",
    smartBrand: "",
  },
  {
    id: "pepsi",
    keywords: ["pepsi", "pepsi max", "läsk", "lask"],
    displayName: "Pepsi Max",
    unitLabel: "flaska",
    basePriceSEK: 22,
    naiveBrand: "",
    smartBrand: "",
  },
  {
    id: "applen",
    keywords: ["äpple", "applen", "äpplen"],
    displayName: "Äpplen",
    unitLabel: "kg",
    basePriceSEK: 29,
    naiveBrand: "",
    smartBrand: "",
  },
];

export const CATALOG: CatalogItem[] = GROCERY_ITEMS.map((item) => ({
  ...item,
  domain: "grocery" as const,
}));

/** Meals expand into a few grocery items — "tacos" isn't a product. */
export const MEAL_EXPANSIONS: Record<string, string[]> = {
  tacos: ["tacokrydda", "tortilla", "kottfars", "ost", "salsa"],
  taco: ["tacokrydda", "tortilla", "kottfars", "ost", "salsa"],
};

/** Fuzzy-matches free text against a catalog's keyword lists — defaults
 *  to the grocery catalog, but any project's catalog works the same way. */
export function matchCatalogItem(raw: string, catalog: CatalogItem[] = CATALOG): CatalogItem | null {
  const needle = raw.trim().toLowerCase();
  if (!needle) return null;
  return (
    catalog.find((item) => item.keywords.some((k) => needle.includes(k))) ?? null
  );
}
