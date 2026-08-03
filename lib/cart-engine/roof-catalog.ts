import type { MaterialItem } from "@/lib/quote-engine/material";

export type RoofTier = "budget" | "premium"; // budget = plåt, premium = tegel

export type RoofOptions = {
  areaM2: number;
  rannor: boolean;
  tier: RoofTier;
};

const UNDERLAYER_ROLL_AREA_M2 = 25;
const WASTE_FACTOR = 1.1;

function deriveRoofQuantities(opts: RoofOptions) {
  const areaM2 = Math.max(1, opts.areaM2);
  const underlagRullar = Math.max(1, Math.ceil((areaM2 * WASTE_FACTOR) / UNDERLAYER_ROLL_AREA_M2));
  const spikSkruvAskar = Math.max(1, Math.ceil(areaM2 / 50));
  return { areaM2, underlagRullar, spikSkruvAskar };
}

export const ROOF_ITEM_IDS = ["takmaterial-tak", "underlag-tak", "spik-tak", "hangranna-tak"];

/**
 * "Tak" AI Plan — same shape as generateFloorCatalog: one dimension
 * (yta) plus follow-up answers in, a fully quantified materials list out.
 * Shares the "building" domain with Bygga altan, Innervägg, Golv and
 * Målning.
 */
export function generateRoofCatalog(opts: RoofOptions): MaterialItem[] {
  const { areaM2, underlagRullar, spikSkruvAskar } = deriveRoofQuantities(opts);
  const premium = opts.tier === "premium";

  const items: MaterialItem[] = [
    {
      id: "takmaterial-tak",
      keywords: ["takmaterial-tak"],
      displayName: premium ? `Tegelpannor (${Math.round(areaM2)} m²)` : `Plåttak (${Math.round(areaM2)} m²)`,
      unitLabel: `${Math.round(areaM2)} m²`,
      basePriceSEK: Math.round(areaM2 * (premium ? 349 : 189)),
      naiveBrand: premium ? "Benders" : "Plannja",
      smartBrand: "",
      domain: "building",
    },
    {
      id: "underlag-tak",
      keywords: ["underlag-tak"],
      displayName: `Underlagspapp (${underlagRullar} rullar)`,
      unitLabel: `${underlagRullar} rullar`,
      basePriceSEK: underlagRullar * 349,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
    },
    {
      id: "spik-tak",
      keywords: ["spik-tak"],
      displayName: `Takspik/skruv (${spikSkruvAskar} ${spikSkruvAskar === 1 ? "ask" : "askar"})`,
      unitLabel: `${spikSkruvAskar} ${spikSkruvAskar === 1 ? "ask" : "askar"}`,
      basePriceSEK: spikSkruvAskar * 119,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
    },
  ];

  if (opts.rannor) {
    items.push({
      id: "hangranna-tak",
      keywords: ["hangranna-tak"],
      displayName: "Hängrännor + stuprör (ca 10 m sats)",
      unitLabel: "1 sats",
      basePriceSEK: premium ? 2400 : 1600,
      naiveBrand: premium ? "Lindab" : "",
      smartBrand: "",
      domain: "building",
    });
  }

  return items;
}

/** Rough labor estimate, hours — money vs. time stay separate, same
 *  split the rest of the engine keeps. */
export function estimateRoofLaborHours(opts: RoofOptions): number {
  const { areaM2 } = deriveRoofQuantities(opts);
  let hours = areaM2 * 0.4;
  if (opts.rannor) hours += 4;
  return Math.round(hours * 10) / 10;
}
