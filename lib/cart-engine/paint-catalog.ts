import type { MaterialItem } from "@/lib/quote-engine/material";

export type PaintTier = "budget" | "premium";

export type PaintOptions = {
  areaM2: number;
  tak: boolean;
  verktyg: boolean;
  tier: PaintTier;
};

const LITERS_PER_M2 = 0.25; // ~2 strykningar, ~8 m² per liter och strykning

function derivePaintQuantities(opts: PaintOptions) {
  const areaM2 = Math.max(1, opts.areaM2);
  const paintedAreaM2 = opts.tak ? areaM2 * 1.3 : areaM2;
  const paintLiters = Math.max(1, Math.ceil(paintedAreaM2 * LITERS_PER_M2));
  const spackelHinkar = Math.max(1, Math.ceil(areaM2 / 25));
  const skyddRullar = Math.max(1, Math.ceil(areaM2 / 15));
  return { areaM2, paintedAreaM2, paintLiters, spackelHinkar, skyddRullar };
}

export const PAINT_ITEM_IDS = ["farg-malning", "spackel-malning", "skydd-malning", "verktygssats-malning"];

/**
 * "Målning" AI Plan — same shape as generateFloorCatalog: one dimension
 * (yta) plus follow-up answers in, a fully quantified materials list out.
 * Shares the "building" domain with Bygga altan, Innervägg and Golv.
 */
export function generatePaintCatalog(opts: PaintOptions): MaterialItem[] {
  const { paintLiters, spackelHinkar, skyddRullar } = derivePaintQuantities(opts);
  const premium = opts.tier === "premium";

  const items: MaterialItem[] = [
    {
      id: "farg-malning",
      keywords: ["farg-malning"],
      displayName: `Väggfärg (${paintLiters} liter)`,
      unitLabel: `${paintLiters} liter`,
      basePriceSEK: paintLiters * (premium ? 219 : 129),
      naiveBrand: premium ? "Flügger" : "Beckers",
      smartBrand: "Byggmax Eget Märke",
      domain: "building",
    },
    {
      id: "spackel-malning",
      keywords: ["spackel-malning"],
      displayName: `Spackel (${spackelHinkar} ${spackelHinkar === 1 ? "hink" : "hinkar"})`,
      unitLabel: `${spackelHinkar} ${spackelHinkar === 1 ? "hink" : "hinkar"}`,
      basePriceSEK: spackelHinkar * (premium ? 149 : 89),
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
    },
    {
      id: "skydd-malning",
      keywords: ["skydd-malning"],
      displayName: `Skyddsplast + målartejp (${skyddRullar} rullar)`,
      unitLabel: `${skyddRullar} rullar`,
      basePriceSEK: skyddRullar * 79,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
    },
  ];

  if (opts.verktyg) {
    items.push({
      id: "verktygssats-malning",
      keywords: ["verktygssats-malning"],
      displayName: "Verktygssats (penslar, roller, målarbalja)",
      unitLabel: "1 sats",
      basePriceSEK: 449,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
    });
  }

  return items;
}

/** Rough labor estimate, hours — money vs. time stay separate, same
 *  split the rest of the engine keeps. */
export function estimatePaintLaborHours(opts: PaintOptions): number {
  const { paintedAreaM2 } = derivePaintQuantities(opts);
  const hours = paintedAreaM2 * 0.25;
  return Math.round(hours * 10) / 10;
}
