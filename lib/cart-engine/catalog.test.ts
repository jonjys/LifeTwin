import { describe, expect, it } from "vitest";
import { CATALOG, groceryItemsByCategory, matchCatalogItem, MEAL_EXPANSIONS, MEAL_OPTIONS } from "@/lib/cart-engine/catalog";

describe("matchCatalogItem", () => {
  it("returns null for empty input", () => {
    expect(matchCatalogItem("", CATALOG)).toBeNull();
    expect(matchCatalogItem("   ", CATALOG)).toBeNull();
  });

  it("matches a known grocery keyword", () => {
    expect(matchCatalogItem("mjölk", CATALOG)?.id).toBe("mjolk");
  });

  it("returns null for something nothing in the catalog matches", () => {
    expect(matchCatalogItem("flygbiljett-till-mars", CATALOG)).toBeNull();
  });

  /**
   * Regression test for a real bug: matchCatalogItem does first-array-hit,
   * substring matching, so every one of an item's own keywords must
   * resolve back to that item — not to an earlier sibling whose keyword
   * happens to be a substring of it. This is exactly how "lättmjölk" used
   * to always resolve to plain "mjölk" (mjolk's own "mjölk" keyword is a
   * substring of "lättmjölk", and mjolk came first in the array).
   */
  it("every item's own keywords resolve back to that item, never an earlier sibling", () => {
    for (const item of CATALOG) {
      for (const keyword of item.keywords) {
        expect(matchCatalogItem(keyword, CATALOG)?.id).toBe(item.id);
      }
    }
  });
});

describe("MEAL_EXPANSIONS / MEAL_OPTIONS", () => {
  it("every MEAL_OPTIONS entry has a matching expansion", () => {
    for (const option of MEAL_OPTIONS) {
      expect(MEAL_EXPANSIONS[option.value]).toBeDefined();
    }
  });

  it("every expansion only references real catalog ids", () => {
    const validIds = new Set(CATALOG.map((i) => i.id));
    for (const ingredientIds of Object.values(MEAL_EXPANSIONS)) {
      for (const id of ingredientIds) {
        expect(validIds.has(id)).toBe(true);
      }
    }
  });
});

describe("groceryItemsByCategory", () => {
  it("only groups grocery items with a category set", () => {
    const grouped = groceryItemsByCategory();
    for (const items of Object.values(grouped)) {
      for (const item of items) {
        expect(item.domain).toBe("grocery");
        expect(item.category).toBeDefined();
      }
    }
  });
});
