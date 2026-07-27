import type { CatalogItem } from "@/lib/cart-engine/catalog";

const AUTO_ITEMS: CatalogItem[] = [
  {
    id: "motorolja",
    keywords: ["motorolja", "olja"],
    displayName: "Motorolja",
    unitLabel: "5 liter",
    basePriceSEK: 349,
    naiveBrand: "Castrol",
    smartBrand: "Mekonomen Eget Märke",
    domain: "auto",
  },
  {
    id: "oljefilter",
    keywords: ["oljefilter"],
    displayName: "Oljefilter",
    unitLabel: "st",
    basePriceSEK: 149,
    naiveBrand: "Mann Filter",
    smartBrand: "",
    domain: "auto",
  },
  {
    id: "bromsklossar",
    keywords: ["bromsklossar", "bromsar"],
    displayName: "Bromsklossar",
    unitLabel: "sats",
    basePriceSEK: 599,
    naiveBrand: "Brembo",
    smartBrand: "",
    domain: "auto",
  },
  {
    id: "vindrutetorkare",
    keywords: ["vindrutetorkare", "torkarblad"],
    displayName: "Vindrutetorkare",
    unitLabel: "par",
    basePriceSEK: 199,
    naiveBrand: "Bosch",
    smartBrand: "",
    domain: "auto",
  },
  {
    id: "spolarvatska",
    keywords: ["spolarvatska", "spolarvätska"],
    displayName: "Spolarvätska",
    unitLabel: "5 liter",
    basePriceSEK: 59,
    naiveBrand: "",
    smartBrand: "",
    domain: "auto",
  },
];

export const AUTO_ITEM_IDS = AUTO_ITEMS.map((i) => i.id);
export const AUTO_ITEM_OPTIONS = AUTO_ITEMS.map((i) => ({ value: i.id, label: i.displayName }));

/**
 * "Bilservice" AI Plan — same pattern as generateApotekCatalog: a fixed,
 * small catalog. No dimensions or animal-type inputs to branch on; the
 * intake page's multi-select decides which ids land in `currentItems`.
 */
export function generateAutoCatalog(): CatalogItem[] {
  return AUTO_ITEMS;
}
