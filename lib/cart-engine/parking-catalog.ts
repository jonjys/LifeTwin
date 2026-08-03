import type { MaterialItem } from "@/lib/quote-engine/material";

export type ParkingTier = "budget" | "premium"; // budget = grus, premium = asfalt

export type ParkingOptions = {
  areaM2: number;
  kantsten: boolean;
  tier: ParkingTier;
};

function deriveParkingQuantities(opts: ParkingOptions) {
  const areaM2 = Math.max(1, opts.areaM2);
  const markdukRullar = Math.max(1, Math.ceil(areaM2 / 25));
  return { areaM2, markdukRullar };
}

export const PARKING_ITEM_IDS = ["underlag-parkering", "markduk-parkering", "kantsten-parkering"];

/**
 * "Parkering" AI Plan — same shape as generateFloorCatalog: one dimension
 * (yta) plus follow-up answers in, a fully quantified materials list out.
 * Shares the "building" domain with the rest of Bygg.
 */
export function generateParkingCatalog(opts: ParkingOptions): MaterialItem[] {
  const { areaM2, markdukRullar } = deriveParkingQuantities(opts);
  const premium = opts.tier === "premium";

  const items: MaterialItem[] = [
    {
      id: "underlag-parkering",
      keywords: ["underlag-parkering"],
      displayName: premium ? `Asfalt (${Math.round(areaM2)} m²)` : `Grus (${Math.round(areaM2)} m²)`,
      unitLabel: `${Math.round(areaM2)} m²`,
      basePriceSEK: Math.round(areaM2 * (premium ? 449 : 89)),
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: areaM2,
      unitPriceSEK: premium ? 449 : 89,
    },
    {
      id: "markduk-parkering",
      keywords: ["markduk-parkering"],
      displayName: `Markduk (${markdukRullar} rullar)`,
      unitLabel: `${markdukRullar} rullar`,
      basePriceSEK: markdukRullar * 249,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: markdukRullar,
      unitPriceSEK: 249,
    },
  ];

  if (opts.kantsten) {
    items.push({
      id: "kantsten-parkering",
      keywords: ["kantsten-parkering"],
      displayName: "Kantsten (sats, ca 20 m)",
      unitLabel: "1 sats",
      basePriceSEK: premium ? 3200 : 1900,
      naiveBrand: "",
      smartBrand: "",
      domain: "building",
      qty: 1,
      unitPriceSEK: premium ? 3200 : 1900,
    });
  }

  return items;
}

/** Rough labor estimate, hours — money vs. time stay separate. */
export function estimateParkingLaborHours(opts: ParkingOptions): number {
  const { areaM2 } = deriveParkingQuantities(opts);
  const premium = opts.tier === "premium";
  let hours = areaM2 * (premium ? 0.5 : 0.3);
  if (opts.kantsten) hours += 6;
  return Math.round(hours * 10) / 10;
}
