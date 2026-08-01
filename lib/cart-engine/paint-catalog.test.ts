import { describe, expect, it } from "vitest";
import { matchCatalogItem } from "@/lib/cart-engine/catalog";
import { estimatePaintLaborHours, generatePaintCatalog, type PaintOptions } from "@/lib/cart-engine/paint-catalog";

const BASE: PaintOptions = { areaM2: 30, tak: false, verktyg: false, tier: "budget" };

describe("generatePaintCatalog", () => {
  it("always includes the core items", () => {
    const ids = generatePaintCatalog(BASE).map((i) => i.id);
    expect(ids).toContain("farg-malning");
    expect(ids).toContain("spackel-malning");
    expect(ids).toContain("skydd-malning");
  });

  it("only includes verktygssats when verktyg is true", () => {
    expect(generatePaintCatalog({ ...BASE, verktyg: true }).some((i) => i.id === "verktygssats-malning")).toBe(true);
    expect(generatePaintCatalog({ ...BASE, verktyg: false }).some((i) => i.id === "verktygssats-malning")).toBe(false);
  });

  it("uses more paint when tak is included", () => {
    const withCeiling = generatePaintCatalog({ ...BASE, tak: true }).find((i) => i.id === "farg-malning")!;
    const withoutCeiling = generatePaintCatalog({ ...BASE, tak: false }).find((i) => i.id === "farg-malning")!;
    expect(withCeiling.basePriceSEK).toBeGreaterThan(withoutCeiling.basePriceSEK);
  });

  it("premium costs more than budget for the same area", () => {
    const sum = (items: ReturnType<typeof generatePaintCatalog>) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generatePaintCatalog({ ...BASE, tier: "premium" }))).toBeGreaterThan(
      sum(generatePaintCatalog({ ...BASE, tier: "budget" }))
    );
  });

  it("a bigger room costs more than a smaller one", () => {
    const sum = (items: ReturnType<typeof generatePaintCatalog>) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generatePaintCatalog({ ...BASE, areaM2: 80 }))).toBeGreaterThan(
      sum(generatePaintCatalog({ ...BASE, areaM2: 10 }))
    );
  });

  it("every domain is 'building'", () => {
    for (const item of generatePaintCatalog({ ...BASE, verktyg: true })) {
      expect(item.domain).toBe("building");
    }
  });

  it("every item id resolves back to itself", () => {
    const catalog = generatePaintCatalog({ ...BASE, verktyg: true, tak: true });
    for (const item of catalog) {
      expect(matchCatalogItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});

describe("estimatePaintLaborHours", () => {
  it("is positive and grows with area", () => {
    const small = estimatePaintLaborHours({ ...BASE, areaM2: 10 });
    const large = estimatePaintLaborHours({ ...BASE, areaM2: 80 });
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
  });
});
