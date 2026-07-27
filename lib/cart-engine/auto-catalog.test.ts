import { describe, expect, it } from "vitest";
import { matchCatalogItem } from "@/lib/cart-engine/catalog";
import { AUTO_ITEM_IDS, AUTO_ITEM_OPTIONS, generateAutoCatalog } from "@/lib/cart-engine/auto-catalog";

describe("generateAutoCatalog", () => {
  const catalog = generateAutoCatalog();

  it("returns the fixed set of item ids", () => {
    expect(catalog.map((i) => i.id).sort()).toEqual([...AUTO_ITEM_IDS].sort());
  });

  it("every domain is 'auto'", () => {
    for (const item of catalog) {
      expect(item.domain).toBe("auto");
    }
  });

  it("AUTO_ITEM_OPTIONS has one label per item id", () => {
    expect(AUTO_ITEM_OPTIONS.map((o) => o.value).sort()).toEqual([...AUTO_ITEM_IDS].sort());
  });

  it("every item id resolves back to itself", () => {
    for (const item of catalog) {
      expect(matchCatalogItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});
