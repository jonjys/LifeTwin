import type { MaterialItem } from "@/lib/quote-engine/material";

export type ExteriorWallTier = "budget" | "premium";

export type ExteriorWallOptions = {
  widthM: number;
  heightM: number;
  isolera: boolean;
  malas: boolean;
  tier: ExteriorWallTier;
};

const STUD_SPACING_M = 0.6;
const SHEET_AREA_M2 = 2.88; // standard 1.2m × 2.4m vindskyddsskiva

function deriveExteriorWallQuantities(opts: ExteriorWallOptions) {
  const width = Math.max(0.5, opts.widthM);
  const height = Math.max(0.5, opts.heightM);
  const areaM2 = width * height;
  const studCount = Math.max(3, Math.ceil(width / STUD_SPACING_M) + 1);
  const sheetsNeeded = Math.max(2, Math.ceil((areaM2 * 1.1) / SHEET_AREA_M2));
  const paintLiters = Math.max(1, Math.ceil(areaM2 / 5));
  return { width, height, areaM2, studCount, sheetsNeeded, paintLiters };
}

export const EXTERIOR_WALL_ITEM_IDS = [
  "regel-yttervagg",
  "vindskyddsskiva-yttervagg",
  "fasadpanel-yttervagg",
  "skruv-yttervagg",
  "isolering-yttervagg",
  "farg-yttervagg",
];

/**
 * "Yttervägg" AI Plan — mirrors Innervägg's shape (bredd × höjd, samma
 * "building"-domän) men med väderskyddande material istället för
 * gipsskivor: vindskydd, fasadpanel, och isolering/målning som tillval.
 */
export function generateExteriorWallCatalog(opts: ExteriorWallOptions): MaterialItem[] {
  const { areaM2, studCount, sheetsNeeded, height, paintLiters } = deriveExteriorWallQuantities(opts);
  const premium = opts.tier === "premium";

  const items: MaterialItem[] = [
    {
      id: "regel-yttervagg",
      keywords: ["regel-yttervagg"],
      displayName: `Reglar (${studCount} st)`,
      unitLabel: `${studCount} st`,
      basePriceSEK: Math.round(studCount * height * (premium ? 48 : 39)),
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: studCount * height,
      unitPriceSEK: premium ? 48 : 39,
    },
    {
      id: "vindskyddsskiva-yttervagg",
      keywords: ["vindskyddsskiva-yttervagg"],
      displayName: `Vindskyddsskivor (${sheetsNeeded} st)`,
      unitLabel: `${sheetsNeeded} st`,
      basePriceSEK: sheetsNeeded * 179,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: sheetsNeeded,
      unitPriceSEK: 179,
    },
    {
      id: "fasadpanel-yttervagg",
      keywords: ["fasadpanel-yttervagg"],
      displayName: `Fasadpanel (${Math.round(areaM2)} m²)`,
      unitLabel: `${Math.round(areaM2)} m²`,
      basePriceSEK: Math.round(areaM2 * (premium ? 289 : 179)),
      naiveBrand: premium ? "Kährs" : "",
      smartBrand: premium ? "" : "Byggmax Eget Märke",
      domain: "building",
      qty: areaM2,
      unitPriceSEK: premium ? 289 : 179,
    },
    {
      id: "skruv-yttervagg",
      keywords: ["skruv-yttervagg"],
      displayName: "Skruv/spik (2 askar)",
      unitLabel: "2 askar",
      basePriceSEK: 178,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: 2,
      unitPriceSEK: 89,
    },
  ];

  if (opts.isolera) {
    items.push({
      id: "isolering-yttervagg",
      keywords: ["isolering-yttervagg"],
      displayName: `Isolering (${Math.round(areaM2)} m²)`,
      unitLabel: `${Math.round(areaM2)} m²`,
      basePriceSEK: Math.round(areaM2 * (premium ? 69 : 49)),
      naiveBrand: premium ? "Paroc" : "Rockwool",
      smartBrand: "",
      domain: "building",
      qty: areaM2,
      unitPriceSEK: premium ? 69 : 49,
    });
  }

  if (opts.malas) {
    items.push({
      id: "farg-yttervagg",
      keywords: ["farg-yttervagg"],
      displayName: `Fasadfärg (${paintLiters} liter)`,
      unitLabel: `${paintLiters} liter`,
      basePriceSEK: paintLiters * (premium ? 259 : 169),
      naiveBrand: premium ? "Flügger" : "Beckers",
      smartBrand: "",
      domain: "building",
      qty: paintLiters,
      unitPriceSEK: premium ? 259 : 169,
    });
  }

  return items;
}

/** Rough labor estimate, hours — exterior work is slower than interior
 *  (väder, ställning, mer förarbete). */
export function estimateExteriorWallLaborHours(opts: ExteriorWallOptions): number {
  const { areaM2 } = deriveExteriorWallQuantities(opts);
  let hours = areaM2 * 1.1;
  if (opts.isolera) hours += areaM2 * 0.15;
  if (opts.malas) hours += areaM2 * 0.1;
  return Math.round(hours * 10) / 10;
}
