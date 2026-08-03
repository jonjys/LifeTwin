import { describe, expect, it } from "vitest";
import { matchMaterialItem } from "@/lib/quote-engine/material";
import { DECK_ITEM_IDS, generateDeckMaterialsCatalog } from "@/lib/cart-engine/materials-catalog";

describe("generateDeckMaterialsCatalog", () => {
  it("returns the fixed set of material ids regardless of size", () => {
    const catalog = generateDeckMaterialsCatalog(4, 3);
    expect(catalog.map((i) => i.id).sort()).toEqual([...DECK_ITEM_IDS].sort());
  });

  it("scales quantities (and therefore price) up with a larger deck", () => {
    const small = generateDeckMaterialsCatalog(2, 2);
    const large = generateDeckMaterialsCatalog(6, 6);
    const smallTrall = small.find((i) => i.id === "trall")!;
    const largeTrall = large.find((i) => i.id === "trall")!;
    expect(largeTrall.basePriceSEK).toBeGreaterThan(smallTrall.basePriceSEK);
  });

  it("never generates fewer than 6 plintar even for a tiny deck", () => {
    const catalog = generateDeckMaterialsCatalog(1, 1);
    const plintar = catalog.find((i) => i.id === "plintar")!;
    expect(plintar.unitLabel).toContain("6");
  });

  it("every domain is 'building'", () => {
    for (const item of generateDeckMaterialsCatalog(5, 4)) {
      expect(item.domain).toBe("building");
    }
  });

  it("every item id resolves back to itself", () => {
    const catalog = generateDeckMaterialsCatalog(4, 3);
    for (const item of catalog) {
      expect(matchMaterialItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});
