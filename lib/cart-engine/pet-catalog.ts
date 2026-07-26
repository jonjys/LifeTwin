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

export const DOG_ITEM_IDS = DOG_ITEMS.map((i) => i.id);
export const CAT_ITEM_IDS = CAT_ITEMS.map((i) => i.id);
export const ALL_PET_ITEM_IDS = [...DOG_ITEM_IDS, ...CAT_ITEM_IDS];

/**
 * "Husdjur" AI Plan — same idea as generateDeckMaterialsCatalog, minus a
 * size input: no dimensions to scale by, just which animals the profile
 * (or the quick-start chip) says you have. Falls back to dog+cat together
 * when neither is specified, so the home screen's "Hundmat" example
 * always has something real to plan.
 */
export function generatePetCatalog(includeDog: boolean, includeCat: boolean): CatalogItem[] {
  if (!includeDog && !includeCat) return [...DOG_ITEMS, ...CAT_ITEMS];
  const items: CatalogItem[] = [];
  if (includeDog) items.push(...DOG_ITEMS);
  if (includeCat) items.push(...CAT_ITEMS);
  return items;
}
