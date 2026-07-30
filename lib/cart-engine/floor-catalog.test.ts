import { describe, expect, it } from "vitest";
import { matchCatalogItem } from "@/lib/cart-engine/catalog";
import { estimateFloorLaborHours, generateFloorCatalog, type FloorOptions } from "@/lib/cart-engine/floor-catalog";

const BASE: FloorOptions = {
  widthM: 4,
  lengthM: 5,
  golvvarme: false,
  troskel: true,
  tier: "budget",
};

describe("generateFloorCatalog", () => {
  it("always includes the core flooring items", () => {
    const catalog = generateFloorCatalog(BASE);
    const ids = catalog.map((i) => i.id);
    expect(ids).toContain("golv-golv");
    expect(ids).toContain("underlag-golv");
    expect(ids).toContain("list-golv");
  });

  it("only includes golvvärme when golvvarme is true", () => {
    const withIt = generateFloorCatalog({ ...BASE, golvvarme: true });
    const withoutIt = generateFloorCatalog({ ...BASE, golvvarme: false });
    expect(withIt.some((i) => i.id === "golvvarme-golv")).toBe(true);
    expect(withoutIt.some((i) => i.id === "golvvarme-golv")).toBe(false);
  });

  it("only includes trösklar when troskel is true", () => {
    const withIt = generateFloorCatalog({ ...BASE, troskel: true });
    const withoutIt = generateFloorCatalog({ ...BASE, troskel: false });
    expect(withIt.some((i) => i.id === "troskel-golv")).toBe(true);
    expect(withoutIt.some((i) => i.id === "troskel-golv")).toBe(false);
  });

  it("premium costs more than budget for the same dimensions", () => {
    const budget = generateFloorCatalog({ ...BASE, tier: "budget" });
    const premium = generateFloorCatalog({ ...BASE, tier: "premium" });
    const sum = (items: typeof budget) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(premium)).toBeGreaterThan(sum(budget));
  });

  it("a bigger room costs more than a smaller one", () => {
    const small = generateFloorCatalog({ ...BASE, widthM: 2, lengthM: 2 });
    const large = generateFloorCatalog({ ...BASE, widthM: 6, lengthM: 8 });
    const sum = (items: typeof small) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(large)).toBeGreaterThan(sum(small));
  });

  it("every domain is 'building', same as Bygga altan and Innervägg", () => {
    for (const item of generateFloorCatalog({ ...BASE, golvvarme: true, troskel: true })) {
      expect(item.domain).toBe("building");
    }
  });

  it("every item id resolves back to itself", () => {
    const catalog = generateFloorCatalog({ ...BASE, golvvarme: true, troskel: true });
    for (const item of catalog) {
      expect(matchCatalogItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});

describe("estimateFloorLaborHours", () => {
  it("is positive and grows with room size", () => {
    const small = estimateFloorLaborHours({ ...BASE, widthM: 2, lengthM: 2 });
    const large = estimateFloorLaborHours({ ...BASE, widthM: 6, lengthM: 8 });
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
  });

  it("adds extra time for golvvärme", () => {
    const without = estimateFloorLaborHours({ ...BASE, golvvarme: false });
    const withIt = estimateFloorLaborHours({ ...BASE, golvvarme: true });
    expect(withIt).toBeGreaterThan(without);
  });
});
