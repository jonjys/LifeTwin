import type { CatalogItem } from "@/lib/cart-engine/catalog";

const DOG_ITEMS: CatalogItem[] = [
  {
    id: "hundfoder-torr",
    // No bare "hundfoder" here — it would substring-match "hundfoder-vat"
    // too and, since matching takes the first array hit, always win.
    keywords: ["hundfoder-torr", "torrfoder hund", "hundmat"],
    displayName: "Hundfoder (torrfoder)",
    unitLabel: "12 kg säck",
    basePriceSEK: 459,
    naiveBrand: "Royal Canin",
    smartBrand: "Arken Zoo Eget märke",
    domain: "pet",
  },
  {
    id: "hundfoder-vat",
    keywords: ["hundfoder-vat", "våtfoder hund", "hundburk", "hundkonserv"],
    displayName: "Hundfoder (våtfoder)",
    unitLabel: "6-pack",
    basePriceSEK: 129,
    naiveBrand: "Pedigree",
    smartBrand: "Granngården Eget märke",
    domain: "pet",
  },
  {
    id: "hundgodis",
    keywords: ["hundgodis", "hundtugg"],
    displayName: "Hundgodis",
    unitLabel: "påse",
    basePriceSEK: 59,
    naiveBrand: "Dogman",
    smartBrand: "",
    domain: "pet",
  },
];

const CAT_ITEMS: CatalogItem[] = [
  {
    id: "kattfoder-torr",
    keywords: ["kattfoder-torr", "torrfoder katt", "kattmat"],
    displayName: "Kattfoder (torrfoder)",
    unitLabel: "4 kg säck",
    basePriceSEK: 289,
    naiveBrand: "Whiskas",
    smartBrand: "Arken Zoo Eget märke",
    domain: "pet",
  },
  {
    id: "kattsand",
    keywords: ["kattsand"],
    displayName: "Kattsand",
    unitLabel: "10 liter",
    basePriceSEK: 99,
    naiveBrand: "Catsan",
    smartBrand: "",
    domain: "pet",
  },
  {
    id: "kattgodis",
    keywords: ["kattgodis"],
    displayName: "Kattgodis",
    unitLabel: "påse",
    basePriceSEK: 35,
    naiveBrand: "Dreamies",
    smartBrand: "",
    domain: "pet",
  },
];

const SMADJUR_ITEMS: CatalogItem[] = [
  {
    id: "smadjursfoder",
    keywords: ["smådjursfoder", "smadjursfoder", "gnagarfoder", "hamsterfoder", "marsvinsfoder"],
    displayName: "Smådjursfoder",
    unitLabel: "1 kg påse",
    basePriceSEK: 79,
    naiveBrand: "Vitakraft",
    smartBrand: "Arken Zoo Eget märke",
    domain: "pet",
  },
  {
    id: "halm-stro",
    keywords: ["halm", "ströbädd", "strobadd", "flisspån", "flisspan"],
    displayName: "Halm/strö",
    unitLabel: "10 liter",
    basePriceSEK: 89,
    naiveBrand: "",
    smartBrand: "",
    domain: "pet",
  },
  {
    id: "gnagargodis",
    keywords: ["gnagargodis", "hamstergodis"],
    displayName: "Gnagargodis",
    unitLabel: "påse",
    basePriceSEK: 39,
    naiveBrand: "",
    smartBrand: "",
    domain: "pet",
  },
];

const FISK_ITEMS: CatalogItem[] = [
  {
    id: "fiskfoder",
    keywords: ["fiskfoder", "fiskmat"],
    displayName: "Fiskfoder",
    unitLabel: "flaska",
    basePriceSEK: 69,
    naiveBrand: "Tetra",
    smartBrand: "",
    domain: "pet",
  },
  {
    id: "akvariefilter",
    keywords: ["akvariefilter", "fiskfilter"],
    displayName: "Akvariefilter",
    unitLabel: "st",
    basePriceSEK: 249,
    naiveBrand: "Eheim",
    smartBrand: "",
    domain: "pet",
  },
  {
    id: "vattenrenare-akvarium",
    keywords: ["vattenrenare", "akvarievätska", "akvarievatska"],
    displayName: "Vattenrenare för akvarium",
    unitLabel: "flaska",
    basePriceSEK: 59,
    naiveBrand: "",
    smartBrand: "",
    domain: "pet",
  },
];

export const DOG_ITEM_IDS = DOG_ITEMS.map((i) => i.id);
export const CAT_ITEM_IDS = CAT_ITEMS.map((i) => i.id);
export const SMADJUR_ITEM_IDS = SMADJUR_ITEMS.map((i) => i.id);
export const FISK_ITEM_IDS = FISK_ITEMS.map((i) => i.id);
export const ALL_PET_ITEM_IDS = [...DOG_ITEM_IDS, ...CAT_ITEM_IDS, ...SMADJUR_ITEM_IDS, ...FISK_ITEM_IDS];

/**
 * "Husdjur" AI Plan — same idea as generateDeckMaterialsCatalog, minus a
 * size input: no dimensions to scale by, just which animals the profile
 * (or the quick-start chip) says you have. Falls back to every species
 * together when none is specified, so the home screen's "Hundmat" example
 * always has something real to plan.
 */
export function generatePetCatalog(
  includeDog: boolean,
  includeCat: boolean,
  includeSmadjur = false,
  includeFisk = false
): CatalogItem[] {
  if (!includeDog && !includeCat && !includeSmadjur && !includeFisk) {
    return [...DOG_ITEMS, ...CAT_ITEMS, ...SMADJUR_ITEMS, ...FISK_ITEMS];
  }
  const items: CatalogItem[] = [];
  if (includeDog) items.push(...DOG_ITEMS);
  if (includeCat) items.push(...CAT_ITEMS);
  if (includeSmadjur) items.push(...SMADJUR_ITEMS);
  if (includeFisk) items.push(...FISK_ITEMS);
  return items;
}
