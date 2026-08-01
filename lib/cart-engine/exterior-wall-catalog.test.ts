import { describe, expect, it } from "vitest";
import { matchCatalogItem } from "@/lib/cart-engine/catalog";
import {
  estimateExteriorWallLaborHours,
  generateExteriorWallCatalog,
  type ExteriorWallOptions,
} from "@/lib/cart-engine/exterior-wall-catalog";

const BASE: ExteriorWallOptions = { widthM: 6, heightM: 2.4, isolera: true, malas: true, tier: "budget" };

describe("generateExteriorWallCatalog", () => {
  it("always includes the core framing/cladding items", () => {
    const ids = generateExteriorWallCatalog(BASE).map((i) => i.id);
    expect(ids).toContain("regel-yttervagg");
    expect(ids).toContain("vindskyddsskiva-yttervagg");
    expect(ids).toContain("fasadpanel-yttervagg");
    expect(ids).toContain("skruv-yttervagg");
  });

  it("only includes isolering when isolera is true", () => {
    expect(generateExteriorWallCatalog({ ...BASE, isolera: true }).some((i) => i.id === "isolering-yttervagg")).toBe(
      true
    );
    expect(generateExteriorWallCatalog({ ...BASE, isolera: false }).some((i) => i.id === "isolering-yttervagg")).toBe(
      false
    );
  });

  it("only includes fasadfärg when malas is true", () => {
    expect(generateExteriorWallCatalog({ ...BASE, malas: true }).some((i) => i.id === "farg-yttervagg")).toBe(true);
    expect(generateExteriorWallCatalog({ ...BASE, malas: false }).some((i) => i.id === "farg-yttervagg")).toBe(false);
  });

  it("premium costs more than budget for the same dimensions", () => {
    const sum = (items: ReturnType<typeof generateExteriorWallCatalog>) =>
      items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generateExteriorWallCatalog({ ...BASE, tier: "premium" }))).toBeGreaterThan(
      sum(generateExteriorWallCatalog({ ...BASE, tier: "budget" }))
    );
  });

  it("a bigger wall costs more than a smaller one", () => {
    const sum = (items: ReturnType<typeof generateExteriorWallCatalog>) =>
      items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generateExteriorWallCatalog({ ...BASE, widthM: 10, heightM: 3 }))).toBeGreaterThan(
      sum(generateExteriorWallCatalog({ ...BASE, widthM: 3, heightM: 2 }))
    );
  });

  it("every domain is 'building'", () => {
    for (const item of generateExteriorWallCatalog(BASE)) {
      expect(item.domain).toBe("building");
    }
  });

  it("every item id resolves back to itself", () => {
    const catalog = generateExteriorWallCatalog(BASE);
    for (const item of catalog) {
      expect(matchCatalogItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});

describe("estimateExteriorWallLaborHours", () => {
  it("is positive and grows with wall size", () => {
    const small = estimateExteriorWallLaborHours({ ...BASE, widthM: 3, heightM: 2 });
    const large = estimateExteriorWallLaborHours({ ...BASE, widthM: 10, heightM: 3 });
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
  });
});
