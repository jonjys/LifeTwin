import type { MaterialItem } from "@/lib/quote-engine/material";

export type FloorTier = "budget" | "premium";

export type FloorOptions = {
  widthM: number;
  lengthM: number;
  golvvarme: boolean;
  troskel: boolean;
  tier: FloorTier;
};

const PLANK_PACK_AREA_M2 = 2.22; // standard laminatgolv-förpackning
const WASTE_FACTOR = 1.1; // 10% spill vid kapning i hörn och längs väggar
const UNDERLAY_ROLL_AREA_M2 = 15;

/** Shared derived quantities — the catalog generator and the labor
 *  estimate both need these, so they're computed once from the same
 *  inputs, same pattern as wall-catalog.ts's deriveWallQuantities. */
function deriveFloorQuantities(opts: FloorOptions) {
  const width = Math.max(0.5, opts.widthM);
  const length = Math.max(0.5, opts.lengthM);
  const areaM2 = width * length;
  const perimeterM = Math.ceil(2 * (width + length));
  const packsNeeded = Math.max(1, Math.ceil((areaM2 * WASTE_FACTOR) / PLANK_PACK_AREA_M2));
  const underlayRolls = Math.max(1, Math.ceil(areaM2 / UNDERLAY_ROLL_AREA_M2));
  return { width, length, areaM2, perimeterM, packsNeeded, underlayRolls };
}

export const FLOOR_ITEM_IDS = ["golv-golv", "underlag-golv", "list-golv", "golvvarme-golv", "troskel-golv"];

/**
 * "Golv" AI Plan — same shape as generateWallCatalog: dimensions in, a
 * fully quantified materials list out. Shares the "building" domain with
 * Bygga altan and Innervägg instead of needing its own stores, the same
 * insight Innervägg proved first.
 */
export function generateFloorCatalog(opts: FloorOptions): MaterialItem[] {
  const { areaM2, perimeterM, packsNeeded, underlayRolls } = deriveFloorQuantities(opts);
  const premium = opts.tier === "premium";

  const items: MaterialItem[] = [
    {
      id: "golv-golv",
      keywords: ["golv-golv"],
      displayName: `Laminatgolv (${packsNeeded} paket)`,
      unitLabel: `${packsNeeded} paket`,
      basePriceSEK: packsNeeded * (premium ? 399 : 249),
      naiveBrand: premium ? "Pergo Premium" : "Pergo Original",
      smartBrand: premium ? "" : "Byggmax Eget Märke",
      domain: "building",
    },
    {
      id: "underlag-golv",
      keywords: ["underlag-golv"],
      displayName: `Underlagspapp (${underlayRolls} rullar)`,
      unitLabel: `${underlayRolls} rullar`,
      basePriceSEK: underlayRolls * (premium ? 229 : 149),
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
    },
    {
      id: "list-golv",
      keywords: ["list-golv"],
      displayName: `Golvlister (${perimeterM} m)`,
      unitLabel: `${perimeterM} m`,
      basePriceSEK: perimeterM * (premium ? 49 : 29),
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
    },
  ];

  if (opts.golvvarme) {
    items.push({
      id: "golvvarme-golv",
      keywords: ["golvvarme-golv"],
      displayName: `Golvvärme (${Math.round(areaM2)} m²)`,
      unitLabel: `${Math.round(areaM2)} m²`,
      basePriceSEK: Math.round(areaM2 * (premium ? 189 : 129)),
      naiveBrand: premium ? "Warmup" : "Thermotech",
      smartBrand: "",
      domain: "building",
    });
  }

  if (opts.troskel) {
    items.push({
      id: "troskel-golv",
      keywords: ["troskel-golv"],
      displayName: "Trösklar (3 st)",
      unitLabel: "3 st",
      basePriceSEK: 3 * (premium ? 149 : 89),
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
    });
  }

  return items;
}

/** Rough labor estimate, hours — shown alongside the price, never folded
 *  into totalSEK, same "money vs. time are separate, both honest" split
 *  the rest of the engine keeps. */
export function estimateFloorLaborHours(opts: FloorOptions): number {
  const { areaM2 } = deriveFloorQuantities(opts);
  let hours = areaM2 * 0.35;
  if (opts.golvvarme) hours += areaM2 * 0.15;
  if (opts.troskel) hours += 1;
  return Math.round(hours * 10) / 10;
}
