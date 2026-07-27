import type { CatalogItem } from "@/lib/cart-engine/catalog";

export const TV_SIZE_OPTIONS = [43, 55, 65, 75] as const;
export type TvSizeInch = (typeof TV_SIZE_OPTIONS)[number];

export function tvItemId(sizeInch: TvSizeInch): string {
  return `tv-${sizeInch}`;
}

const TV_BASE_PRICE_SEK: Record<TvSizeInch, number> = {
  43: 3990,
  55: 5990,
  65: 8990,
  75: 13990,
};

const TV_ITEMS: CatalogItem[] = TV_SIZE_OPTIONS.map((sizeInch) => ({
  id: tvItemId(sizeInch),
  // No bare "tv" keyword — every size id already contains "tv-" and a
  // unique number, so sizes never substring-collide with each other.
  keywords: [tvItemId(sizeInch), `${sizeInch} tum`],
  displayName: `TV ${sizeInch}"`,
  unitLabel: "st",
  basePriceSEK: TV_BASE_PRICE_SEK[sizeInch],
  naiveBrand: "Samsung",
  smartBrand: "",
  domain: "electronics",
}));

const ACCESSORY_ITEMS: CatalogItem[] = [
  {
    id: "vaggfaste",
    keywords: ["vaggfaste", "väggfäste", "tv-fäste"],
    displayName: "Väggfäste",
    unitLabel: "st",
    basePriceSEK: 599,
    naiveBrand: "Vogel's",
    smartBrand: "",
    domain: "electronics",
  },
  {
    id: "hdmi-kabel",
    keywords: ["hdmi-kabel", "hdmi"],
    displayName: "HDMI-kabel",
    unitLabel: "2 m",
    basePriceSEK: 129,
    naiveBrand: "Deltaco",
    smartBrand: "",
    domain: "electronics",
  },
  {
    id: "soundbar",
    keywords: ["soundbar"],
    displayName: "Soundbar",
    unitLabel: "st",
    basePriceSEK: 1490,
    naiveBrand: "Sony",
    smartBrand: "",
    domain: "electronics",
  },
];

export const ACCESSORY_ITEM_IDS = ACCESSORY_ITEMS.map((i) => i.id);

/**
 * "Elektronik" AI Plan — same idea as generatePetCatalog: a fixed
 * superset catalog (every TV size plus every accessory). Which items
 * actually show up in the cart is entirely decided by which ids the
 * intake page puts in `currentItems`, so this needs no parameters and no
 * extra state to persist across a reload.
 */
export function generateElectronicsCatalog(): CatalogItem[] {
  return [...TV_ITEMS, ...ACCESSORY_ITEMS];
}
