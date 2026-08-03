import type { MaterialItem } from "@/lib/quote-engine/material";

export type WallTier = "budget" | "premium";

export type WallOptions = {
  widthM: number;
  heightM: number;
  isolera: boolean;
  dorr: boolean;
  malas: boolean;
  verktyg: boolean;
  tier: WallTier;
};

const DOOR_AREA_M2 = 1.89; // standard 0.9m × 2.1m innerdörr
const STUD_SPACING_M = 0.6;
const SHEET_AREA_M2 = 3.12; // standard 1.2m × 2.6m gipsskiva

/** Shared derived quantities — both the catalog generator and the labor
 *  estimate need these, so they're computed once from the same inputs. */
function deriveWallQuantities(opts: WallOptions) {
  const width = Math.max(0.5, opts.widthM);
  const height = Math.max(0.5, opts.heightM);
  const doorAreaM2 = opts.dorr ? DOOR_AREA_M2 : 0;
  const wallAreaM2 = Math.max(0, width * height - doorAreaM2);
  // Both faces of an interior wall get gips — it separates two rooms.
  const gipsAreaM2 = wallAreaM2 * 2;
  const studCount = Math.max(3, Math.ceil(width / STUD_SPACING_M) + 1);
  const sheetsNeeded = Math.max(2, Math.ceil(gipsAreaM2 / SHEET_AREA_M2));
  const screwBoxes = Math.max(1, Math.ceil(sheetsNeeded / 10));
  const paintLiters = Math.max(1, Math.ceil(gipsAreaM2 / 4)); // ~2 coats, 8 m²/L per coat
  const skirtingM = Math.ceil(width);
  return { width, height, wallAreaM2, gipsAreaM2, studCount, sheetsNeeded, screwBoxes, paintLiters, skirtingM };
}

export const WALL_ITEM_IDS = [
  "regel-innervagg",
  "gipsskiva-innervagg",
  "skruv-innervagg",
  "isolering-innervagg",
  "spackel-innervagg",
  "farg-innervagg",
  "list-innervagg",
  "dorrsats-innervagg",
  "verktygssats-innervagg",
];

/**
 * "Innervägg" AI Plan — the flagship AI calculator: dimensions in,
 * follow-up answers in, a fully quantified materials list out. Same
 * shape as generateDeckMaterialsCatalog (quantities are honest rules-of-
 * thumb, not a certified materials calculator), and — unlike Bygga altan
 * — shares the exact same "building" domain/retailers rather than
 * needing its own, proving a project category can piggyback on an
 * existing domain instead of always minting a new one.
 */
export function generateWallCatalog(opts: WallOptions): MaterialItem[] {
  const { height, wallAreaM2, gipsAreaM2, studCount, sheetsNeeded, screwBoxes, paintLiters, skirtingM } =
    deriveWallQuantities(opts);
  const premium = opts.tier === "premium";

  const items: MaterialItem[] = [
    {
      id: "regel-innervagg",
      keywords: ["regel-innervagg"],
      displayName: `Reglar (${studCount} st)`,
      unitLabel: `${studCount} st`,
      basePriceSEK: Math.round(studCount * height * (premium ? 42 : 35)),
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: studCount * height,
      unitPriceSEK: premium ? 42 : 35,
    },
    {
      id: "gipsskiva-innervagg",
      keywords: ["gipsskiva-innervagg"],
      displayName: `Gipsskivor (${sheetsNeeded} st)`,
      unitLabel: `${sheetsNeeded} st`,
      basePriceSEK: sheetsNeeded * (premium ? 149 : 99),
      naiveBrand: premium ? "Gyproc Robust" : "Gyproc Normal",
      smartBrand: "",
      domain: "building",
      qty: sheetsNeeded,
      unitPriceSEK: premium ? 149 : 99,
    },
    {
      id: "skruv-innervagg",
      keywords: ["skruv-innervagg"],
      displayName: `Skruv (${screwBoxes} ${screwBoxes === 1 ? "ask" : "askar"})`,
      unitLabel: `${screwBoxes} ${screwBoxes === 1 ? "ask" : "askar"}`,
      basePriceSEK: screwBoxes * 89,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: screwBoxes,
      unitPriceSEK: 89,
    },
  ];

  if (opts.isolera) {
    items.push({
      id: "isolering-innervagg",
      keywords: ["isolering-innervagg"],
      displayName: `Isolering (${Math.round(wallAreaM2)} m²)`,
      unitLabel: `${Math.round(wallAreaM2)} m²`,
      basePriceSEK: Math.round(wallAreaM2 * (premium ? 69 : 49)),
      naiveBrand: premium ? "Paroc" : "Rockwool",
      smartBrand: "",
      domain: "building",
      qty: wallAreaM2,
      unitPriceSEK: premium ? 69 : 49,
    });
  }

  if (opts.malas) {
    items.push(
      {
        id: "spackel-innervagg",
        keywords: ["spackel-innervagg"],
        displayName: "Spackel",
        unitLabel: "1 hink",
        basePriceSEK: premium ? 149 : 89,
        naiveBrand: "",
        smartBrand: "",
        domain: "building",
        qty: 1,
        unitPriceSEK: premium ? 149 : 89,
      },
      {
        id: "farg-innervagg",
        keywords: ["farg-innervagg"],
        displayName: `Väggfärg (${paintLiters} liter)`,
        unitLabel: `${paintLiters} liter`,
        basePriceSEK: paintLiters * (premium ? 219 : 129),
        naiveBrand: premium ? "Flügger" : "Beckers",
        smartBrand: "Byggmax Eget Märke",
        domain: "building",
        qty: paintLiters,
        unitPriceSEK: premium ? 219 : 129,
      }
    );
  }

  items.push({
    id: "list-innervagg",
    keywords: ["list-innervagg"],
    displayName: `Golvlister (${skirtingM} m)`,
    unitLabel: `${skirtingM} m`,
    basePriceSEK: skirtingM * (premium ? 49 : 29),
    naiveBrand: "",
    smartBrand: "",
    domain: "building",
    qty: skirtingM,
    unitPriceSEK: premium ? 49 : 29,
  });

  if (opts.dorr) {
    items.push({
      id: "dorrsats-innervagg",
      keywords: ["dorrsats-innervagg"],
      displayName: "Dörrsats (dörrblad, karm, handtag)",
      unitLabel: "1 sats",
      basePriceSEK: premium ? 2200 : 1200,
      naiveBrand: premium ? "Swedoor Premium" : "Swedoor Basic",
      smartBrand: "",
      domain: "building",
      qty: 1,
      unitPriceSEK: premium ? 2200 : 1200,
    });
  }

  if (opts.verktyg) {
    items.push({
      id: "verktygssats-innervagg",
      keywords: ["verktygssats-innervagg"],
      displayName: "Verktygssats (kniv, spackelspade, pensel, skruvdragare)",
      unitLabel: "1 sats",
      basePriceSEK: 800,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: 1,
      unitPriceSEK: 800,
    });
  }

  return items;
}

/** Rough labor estimate, hours — shown alongside the price, never folded
 *  into totalSEK (the same "money vs. time are separate, both honest"
 *  split the rest of the engine already keeps). */
export function estimateWallLaborHours(opts: WallOptions): number {
  const { wallAreaM2, gipsAreaM2 } = deriveWallQuantities(opts);
  let hours = wallAreaM2 * 0.9;
  if (opts.isolera) hours += wallAreaM2 * 0.2;
  if (opts.malas) hours += gipsAreaM2 * 0.15;
  // Cutting a rough opening, framing a header, and hanging + trimming a
  // door is real extra work — enough to always net positive even though
  // the door cutout itself slightly shrinks the area-driven hours above
  // (max possible reduction is DOOR_AREA_M2 × 1.4 ≈ 2.6h; see
  // wall-catalog.test.ts's regression test for this).
  if (opts.dorr) hours += 4;
  return Math.round(hours * 10) / 10;
}
