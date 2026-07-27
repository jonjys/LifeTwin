import { describe, expect, it } from "vitest";
import { matchCatalogItem } from "@/lib/cart-engine/catalog";
import {
  generateElectronicsCatalog,
  tvItemId,
  TV_SIZE_OPTIONS,
} from "@/lib/cart-engine/electronics-catalog";

describe("generateElectronicsCatalog", () => {
  const catalog = generateElectronicsCatalog();

  it("includes one TV item per size option", () => {
    for (const size of TV_SIZE_OPTIONS) {
      expect(catalog.some((i) => i.id === tvItemId(size))).toBe(true);
    }
  });

  it("includes the fixed accessories", () => {
    expect(catalog.some((i) => i.id === "hdmi-kabel")).toBe(true);
    expect(catalog.some((i) => i.id === "vaggfaste")).toBe(true);
    expect(catalog.some((i) => i.id === "soundbar")).toBe(true);
  });

  it("larger TVs cost more", () => {
    const prices = TV_SIZE_OPTIONS.map(
      (size) => catalog.find((i) => i.id === tvItemId(size))!.basePriceSEK
    );
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    }
  });

  it("every domain is 'electronics'", () => {
    for (const item of catalog) {
      expect(item.domain).toBe("electronics");
    }
  });

  // Same class of bug as pet-catalog: every TV size id must resolve back
  // to itself, not to a different size that happens to share a prefix.
  it("every item id (including every TV size) resolves back to itself", () => {
    for (const item of catalog) {
      expect(matchCatalogItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});
