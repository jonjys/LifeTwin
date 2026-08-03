import type { MaterialItem } from "@/lib/quote-engine/material";

/**
 * The "Bygga altan" AI Plan: given a deck's width and depth, computes how
 * much of each material the build actually needs, then hands back a
 * catalog shaped exactly like the grocery one — same `MaterialItem` type,
 * same engine (optimize.ts/checkout.ts) reads it the same way. Quantities
 * are honest rules-of-thumb (spacing, coverage), not a real materials
 * calculator; prices are illustrative, same as the grocery catalog.
 */
export function generateDeckMaterialsCatalog(widthM: number, depthM: number): MaterialItem[] {
  const width = Math.max(1, widthM);
  const depth = Math.max(1, depthM);
  const areaM2 = Math.round(width * depth * 10) / 10;

  // Concrete deck footings on a ~1.2m grid, at least 6 for stability.
  const plintCount = Math.max(6, Math.ceil(areaM2 / 1.44));
  const screwBoxes = Math.max(1, Math.ceil(areaM2 / 5));
  const concreteBags = plintCount * 2;

  return [
    {
      id: "trall",
      keywords: ["trall"],
      displayName: `Trall (${areaM2} m²)`,
      unitLabel: `${areaM2} m²`,
      basePriceSEK: Math.round(areaM2 * 449),
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: areaM2,
      unitPriceSEK: 449,
    },
    {
      id: "reglar",
      keywords: ["reglar"],
      displayName: `Reglar (${areaM2} m²)`,
      unitLabel: `${areaM2} m²`,
      basePriceSEK: Math.round(areaM2 * 165),
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: areaM2,
      unitPriceSEK: 165,
    },
    {
      id: "plintar",
      keywords: ["plintar", "plint"],
      displayName: `Plintar (${plintCount} st)`,
      unitLabel: `${plintCount} st`,
      basePriceSEK: plintCount * 149,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: plintCount,
      unitPriceSEK: 149,
    },
    {
      id: "skruv",
      keywords: ["skruv"],
      displayName: `Skruv (${screwBoxes} ${screwBoxes === 1 ? "ask" : "askar"})`,
      unitLabel: `${screwBoxes} ${screwBoxes === 1 ? "ask" : "askar"}`,
      basePriceSEK: screwBoxes * 249,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: screwBoxes,
      unitPriceSEK: 249,
    },
    {
      id: "betong",
      keywords: ["betong"],
      displayName: `Betong (${concreteBags} säckar)`,
      unitLabel: `${concreteBags} säckar`,
      basePriceSEK: concreteBags * 89,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: concreteBags,
      unitPriceSEK: 89,
    },
    {
      id: "verktyg",
      keywords: ["verktyg"],
      displayName: "Verktyg (hyra för projektet)",
      unitLabel: "1 sats",
      basePriceSEK: 1200,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: 1,
      unitPriceSEK: 1200,
    },
  ];
}

/** The fixed AI-Plan item order for a deck build — used as the requested
 *  item list once the user confirms dimensions on /projects/deck. */
export const DECK_ITEM_IDS = ["trall", "reglar", "plintar", "skruv", "betong", "verktyg"];
