import { describe, expect, it } from "vitest";
import { matchCatalogItem } from "@/lib/cart-engine/catalog";
import { estimateRoofLaborHours, generateRoofCatalog, type RoofOptions } from "@/lib/cart-engine/roof-catalog";

const BASE: RoofOptions = { areaM2: 80, rannor: false, tier: "budget" };

describe("generateRoofCatalog", () => {
  it("always includes the core items", () => {
    const ids = generateRoofCatalog(BASE).map((i) => i.id);
    expect(ids).toContain("takmaterial-tak");
    expect(ids).toContain("underlag-tak");
    expect(ids).toContain("spik-tak");
  });

  it("only includes hängrännor when rannor is true", () => {
    expect(generateRoofCatalog({ ...BASE, rannor: true }).some((i) => i.id === "hangranna-tak")).toBe(true);
    expect(generateRoofCatalog({ ...BASE, rannor: false }).some((i) => i.id === "hangranna-tak")).toBe(false);
  });

  it("premium (tegel) costs more than budget (plåt) for the same area", () => {
    const sum = (items: ReturnType<typeof generateRoofCatalog>) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generateRoofCatalog({ ...BASE, tier: "premium" }))).toBeGreaterThan(
      sum(generateRoofCatalog({ ...BASE, tier: "budget" }))
    );
  });

  it("a bigger roof costs more than a smaller one", () => {
    const sum = (items: ReturnType<typeof generateRoofCatalog>) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generateRoofCatalog({ ...BASE, areaM2: 150 }))).toBeGreaterThan(
      sum(generateRoofCatalog({ ...BASE, areaM2: 30 }))
    );
  });

  it("every domain is 'building'", () => {
    for (const item of generateRoofCatalog({ ...BASE, rannor: true })) {
      expect(item.domain).toBe("building");
    }
  });

  it("every item id resolves back to itself", () => {
    const catalog = generateRoofCatalog({ ...BASE, rannor: true });
    for (const item of catalog) {
      expect(matchCatalogItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});

describe("estimateRoofLaborHours", () => {
  it("is positive, grows with area, and grows with hängrännor", () => {
    const small = estimateRoofLaborHours({ ...BASE, areaM2: 30 });
    const large = estimateRoofLaborHours({ ...BASE, areaM2: 150 });
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
    expect(estimateRoofLaborHours({ ...BASE, rannor: true })).toBeGreaterThan(estimateRoofLaborHours(BASE));
  });
});
