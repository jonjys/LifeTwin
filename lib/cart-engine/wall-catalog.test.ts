import { describe, expect, it } from "vitest";
import { matchMaterialItem } from "@/lib/quote-engine/material";
import { estimateWallLaborHours, generateWallCatalog, type WallOptions } from "@/lib/cart-engine/wall-catalog";

const BASE: WallOptions = {
  widthM: 3.6,
  heightM: 2.3,
  isolera: true,
  dorr: false,
  malas: true,
  verktyg: false,
  tier: "budget",
};

describe("generateWallCatalog", () => {
  it("always includes the core framing items", () => {
    const catalog = generateWallCatalog(BASE);
    const ids = catalog.map((i) => i.id);
    expect(ids).toContain("regel-innervagg");
    expect(ids).toContain("gipsskiva-innervagg");
    expect(ids).toContain("skruv-innervagg");
    expect(ids).toContain("list-innervagg");
  });

  it("only includes isolering when isolera is true", () => {
    const withIt = generateWallCatalog({ ...BASE, isolera: true });
    const withoutIt = generateWallCatalog({ ...BASE, isolera: false });
    expect(withIt.some((i) => i.id === "isolering-innervagg")).toBe(true);
    expect(withoutIt.some((i) => i.id === "isolering-innervagg")).toBe(false);
  });

  it("only includes spackel + färg when malas is true", () => {
    const withIt = generateWallCatalog({ ...BASE, malas: true });
    const withoutIt = generateWallCatalog({ ...BASE, malas: false });
    expect(withIt.some((i) => i.id === "spackel-innervagg")).toBe(true);
    expect(withIt.some((i) => i.id === "farg-innervagg")).toBe(true);
    expect(withoutIt.some((i) => i.id === "spackel-innervagg")).toBe(false);
    expect(withoutIt.some((i) => i.id === "farg-innervagg")).toBe(false);
  });

  it("only includes a dörrsats when dorr is true", () => {
    const withIt = generateWallCatalog({ ...BASE, dorr: true });
    const withoutIt = generateWallCatalog({ ...BASE, dorr: false });
    expect(withIt.some((i) => i.id === "dorrsats-innervagg")).toBe(true);
    expect(withoutIt.some((i) => i.id === "dorrsats-innervagg")).toBe(false);
  });

  it("only includes verktygssats when verktyg is true", () => {
    const withIt = generateWallCatalog({ ...BASE, verktyg: true });
    const withoutIt = generateWallCatalog({ ...BASE, verktyg: false });
    expect(withIt.some((i) => i.id === "verktygssats-innervagg")).toBe(true);
    expect(withoutIt.some((i) => i.id === "verktygssats-innervagg")).toBe(false);
  });

  it("premium costs more than budget for the same dimensions", () => {
    const budget = generateWallCatalog({ ...BASE, tier: "budget" });
    const premium = generateWallCatalog({ ...BASE, tier: "premium" });
    const sum = (items: typeof budget) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(premium)).toBeGreaterThan(sum(budget));
  });

  it("a bigger wall costs more than a smaller one", () => {
    const small = generateWallCatalog({ ...BASE, widthM: 2, heightM: 2 });
    const large = generateWallCatalog({ ...BASE, widthM: 6, heightM: 3 });
    const sum = (items: typeof small) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(large)).toBeGreaterThan(sum(small));
  });

  it("every domain is 'building', same as Bygga altan", () => {
    for (const item of generateWallCatalog({ ...BASE, dorr: true, verktyg: true })) {
      expect(item.domain).toBe("building");
    }
  });

  it("every item id resolves back to itself", () => {
    const catalog = generateWallCatalog({ ...BASE, dorr: true, verktyg: true });
    for (const item of catalog) {
      expect(matchMaterialItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});

describe("estimateWallLaborHours", () => {
  it("is positive and grows with wall size", () => {
    const small = estimateWallLaborHours({ ...BASE, widthM: 2, heightM: 2 });
    const large = estimateWallLaborHours({ ...BASE, widthM: 6, heightM: 3 });
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
  });

  it("adds extra time for a door", () => {
    const withoutDoor = estimateWallLaborHours({ ...BASE, dorr: false });
    const withDoor = estimateWallLaborHours({ ...BASE, dorr: true });
    expect(withDoor).toBeGreaterThan(withoutDoor);
  });
});
