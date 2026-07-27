import type { CatalogItem } from "@/lib/cart-engine/catalog";

const APOTEK_ITEMS: CatalogItem[] = [
  {
    id: "smartstillande",
    keywords: ["smartstillande", "huvudvark", "alvedon", "ipren"],
    displayName: "Smärtstillande",
    unitLabel: "20-pack",
    basePriceSEK: 49,
    naiveBrand: "Alvedon",
    smartBrand: "Apotekets Eget Paracetamol",
    domain: "pharmacy",
  },
  {
    id: "vitaminer",
    keywords: ["vitaminer", "vitamin"],
    displayName: "Vitamintillskott",
    unitLabel: "100-pack",
    basePriceSEK: 89,
    naiveBrand: "Möller's",
    smartBrand: "",
    domain: "pharmacy",
  },
  {
    id: "plaster",
    keywords: ["plaster", "plåster"],
    displayName: "Plåster",
    unitLabel: "20-pack",
    basePriceSEK: 39,
    naiveBrand: "Hansaplast",
    smartBrand: "",
    domain: "pharmacy",
  },
  {
    id: "tandkram",
    keywords: ["tandkram", "tandkräm"],
    displayName: "Tandkräm",
    unitLabel: "75 ml",
    basePriceSEK: 35,
    naiveBrand: "Colgate",
    smartBrand: "Apotekets Eget",
    domain: "pharmacy",
  },
  {
    id: "hudkram",
    keywords: ["hudkram", "hudkräm", "fuktkram"],
    displayName: "Hudkräm",
    unitLabel: "250 ml",
    basePriceSEK: 65,
    naiveBrand: "Neutrogena",
    smartBrand: "",
    domain: "pharmacy",
  },
  {
    id: "allergitabletter",
    keywords: ["allergitabletter", "allergi"],
    displayName: "Allergitabletter",
    unitLabel: "30-pack",
    basePriceSEK: 79,
    naiveBrand: "Aerius",
    smartBrand: "Apotekets Eget Loratadin",
    domain: "pharmacy",
  },
];

export const APOTEK_ITEM_IDS = APOTEK_ITEMS.map((i) => i.id);
export const APOTEK_ITEM_OPTIONS = APOTEK_ITEMS.map((i) => ({ value: i.id, label: i.displayName }));

/**
 * "Apotek" AI Plan — a fixed, small catalog of everyday health basics.
 * No dimensions or animal-type inputs to branch on (unlike deck/pet), so
 * this always returns the same superset; the intake page's multi-select
 * decides which ids actually land in `currentItems`.
 */
export function generateApotekCatalog(): CatalogItem[] {
  return APOTEK_ITEMS;
}
