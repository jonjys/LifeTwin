import { describe, expect, it } from "vitest";
import { matchCatalogItem } from "@/lib/cart-engine/catalog";
import { ALL_PET_ITEM_IDS, CAT_ITEM_IDS, DOG_ITEM_IDS, generatePetCatalog } from "@/lib/cart-engine/pet-catalog";

describe("generatePetCatalog", () => {
  it("returns only dog items when only a dog is selected", () => {
    const catalog = generatePetCatalog(true, false);
    expect(catalog.map((i) => i.id).sort()).toEqual([...DOG_ITEM_IDS].sort());
  });

  it("returns only cat items when only a cat is selected", () => {
    const catalog = generatePetCatalog(false, true);
    expect(catalog.map((i) => i.id).sort()).toEqual([...CAT_ITEM_IDS].sort());
  });

  it("falls back to both dog and cat items when neither is specified", () => {
    const catalog = generatePetCatalog(false, false);
    expect(catalog.map((i) => i.id).sort()).toEqual([...ALL_PET_ITEM_IDS].sort());
  });

  it("every domain is 'pet'", () => {
    for (const item of generatePetCatalog(true, true)) {
      expect(item.domain).toBe("pet");
    }
  });

  // Regression test: hundfoder-torr and hundfoder-vat (and their cat
  // equivalents) used to collide because a bare "hundfoder" keyword
  // substring-matched both ids — always resolving to whichever came
  // first in the array. See catalog.test.ts for the general invariant.
  it("dog and cat item ids never resolve to the wrong sibling", () => {
    const catalog = generatePetCatalog(true, true);
    for (const item of catalog) {
      expect(matchCatalogItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});
