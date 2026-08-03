import type { MaterialItem } from "@/lib/quote-engine/material";

export type MaterialBankPriceSource = { name: string; priceSEK: number };

/** displayName carries a dynamic quantity suffix ("Reglar (16 st)") that
 *  would never match a materialbank entry's plain name — this strips it
 *  back to a stable base name ("Reglar") for matching purposes. */
function baseName(displayName: string): string {
  return displayName.replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();
}

/**
 * Overrides a calculator's simulated unitPriceSEK with the company's own
 * materialbank price wherever a match exists — best-effort substring
 * match (either direction), same approach as the receipt-scan matcher,
 * since a materialbank entry's wording rarely matches the catalog's
 * generic display name exactly. basePriceSEK is recomputed from the
 * item's own qty, never guessed — this is what makes the substitution
 * mathematically safe even for items whose price depends on a dimension
 * (e.g. reglar's qty already bakes in wall height, see qty-invariant.test.ts).
 */
export function applyMaterialBankPricing(materials: MaterialItem[], bank: MaterialBankPriceSource[]): MaterialItem[] {
  if (bank.length === 0) return materials;

  return materials.map((item) => {
    const needle = baseName(item.displayName);
    if (!needle) return item;

    const match = bank.find((b) => {
      const hay = b.name.trim().toLowerCase();
      return hay.length > 0 && (needle.includes(hay) || hay.includes(needle));
    });
    if (!match) return item;

    return {
      ...item,
      unitPriceSEK: match.priceSEK,
      basePriceSEK: Math.round(item.qty * match.priceSEK),
      sourcedFromBank: true,
    };
  });
}
