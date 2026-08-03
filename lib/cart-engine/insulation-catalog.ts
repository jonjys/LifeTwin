import type { CatalogItem } from "@/lib/cart-engine/catalog";

export type InsulationTier = "budget" | "premium";

export type InsulationOptions = {
  areaM2: number;
  angsparr: boolean;
  tier: InsulationTier;
};

function deriveInsulationQuantities(opts: InsulationOptions) {
  const areaM2 = Math.max(1, opts.areaM2);
  const tapeRullar = Math.max(1, Math.ceil(areaM2 / 40));
  return { areaM2, tapeRullar };
}

export const INSULATION_ITEM_IDS = ["isolering-isolering", "angsparr-isolering", "tejp-isolering"];

/**
 * "Isolering" AI Plan — same shape as generateFloorCatalog: one dimension
 * (yta) plus follow-up answers in, a fully quantified materials list out.
 * Shares the "building" domain with the rest of Bygg.
 */
export function generateInsulationCatalog(opts: InsulationOptions): CatalogItem[] {
  const { areaM2, tapeRullar } = deriveInsulationQuantities(opts);
  const premium = opts.tier === "premium";

  const items: CatalogItem[] = [
    {
      id: "isolering-isolering",
      keywords: ["isolering-isolering"],
      displayName: `Isoleringsskivor (${Math.round(areaM2)} m²)`,
      unitLabel: `${Math.round(areaM2)} m²`,
      basePriceSEK: Math.round(areaM2 * (premium ? 69 : 49)),
      naiveBrand: premium ? "Paroc" : "Rockwool",
      smartBrand: "",
      domain: "building",
    },
  ];

  if (opts.angsparr) {
    items.push(
      {
        id: "angsparr-isolering",
        keywords: ["angsparr-isolering"],
        displayName: `Ångspärr (${Math.round(areaM2)} m²)`,
        unitLabel: `${Math.round(areaM2)} m²`,
        basePriceSEK: Math.round(areaM2 * 19),
        naiveBrand: "",
        smartBrand: "",
        domain: "building",
      },
      {
        id: "tejp-isolering",
        keywords: ["tejp-isolering"],
        displayName: `Ångspärrtejp (${tapeRullar} rullar)`,
        unitLabel: `${tapeRullar} rullar`,
        basePriceSEK: tapeRullar * 99,
        naiveBrand: "",
        smartBrand: "",
        domain: "building",
      }
    );
  }

  return items;
}

/** Rough labor estimate, hours — money vs. time stay separate. */
export function estimateInsulationLaborHours(opts: InsulationOptions): number {
  const { areaM2 } = deriveInsulationQuantities(opts);
  let hours = areaM2 * 0.3;
  if (opts.angsparr) hours += areaM2 * 0.1;
  return Math.round(hours * 10) / 10;
}
