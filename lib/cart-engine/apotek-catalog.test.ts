import { describe, expect, it } from "vitest";
import { matchCatalogItem } from "@/lib/cart-engine/catalog";
import { APOTEK_ITEM_IDS, APOTEK_ITEM_OPTIONS, generateApotekCatalog } from "@/lib/cart-engine/apotek-catalog";

describe("generateApotekCatalog", () => {
  const catalog = generateApotekCatalog();

  it("returns the fixed set of item ids", () => {
    expect(catalog.map((i) => i.id).sort()).toEqual([...APOTEK_ITEM_IDS].sort());
  });

  it("every domain is 'pharmacy'", () => {
    for (const item of catalog) {
      expect(item.domain).toBe("pharmacy");
    }
  });

  it("APOTEK_ITEM_OPTIONS has one label per item id", () => {
    expect(APOTEK_ITEM_OPTIONS.map((o) => o.value).sort()).toEqual([...APOTEK_ITEM_IDS].sort());
  });

  it("every item id resolves back to itself", () => {
    for (const item of catalog) {
      expect(matchCatalogItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});
