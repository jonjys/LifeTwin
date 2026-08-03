import { describe, expect, it } from "vitest";
import { matchMaterialItem } from "@/lib/quote-engine/material";
import {
  estimateParkingLaborHours,
  generateParkingCatalog,
  type ParkingOptions,
} from "@/lib/cart-engine/parking-catalog";

const BASE: ParkingOptions = { areaM2: 30, kantsten: true, tier: "budget" };

describe("generateParkingCatalog", () => {
  it("always includes underlag and markduk", () => {
    const ids = generateParkingCatalog(BASE).map((i) => i.id);
    expect(ids).toContain("underlag-parkering");
    expect(ids).toContain("markduk-parkering");
  });

  it("only includes kantsten when kantsten is true", () => {
    expect(generateParkingCatalog({ ...BASE, kantsten: true }).some((i) => i.id === "kantsten-parkering")).toBe(
      true
    );
    expect(generateParkingCatalog({ ...BASE, kantsten: false }).some((i) => i.id === "kantsten-parkering")).toBe(
      false
    );
  });

  it("premium (asfalt) costs more than budget (grus) for the same area", () => {
    const sum = (items: ReturnType<typeof generateParkingCatalog>) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generateParkingCatalog({ ...BASE, tier: "premium" }))).toBeGreaterThan(
      sum(generateParkingCatalog({ ...BASE, tier: "budget" }))
    );
  });

  it("a bigger area costs more than a smaller one", () => {
    const sum = (items: ReturnType<typeof generateParkingCatalog>) => items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generateParkingCatalog({ ...BASE, areaM2: 60 }))).toBeGreaterThan(
      sum(generateParkingCatalog({ ...BASE, areaM2: 10 }))
    );
  });

  it("every domain is 'building'", () => {
    for (const item of generateParkingCatalog(BASE)) {
      expect(item.domain).toBe("building");
    }
  });

  it("every item id resolves back to itself", () => {
    const catalog = generateParkingCatalog(BASE);
    for (const item of catalog) {
      expect(matchMaterialItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});

describe("estimateParkingLaborHours", () => {
  it("is positive, grows with area, and grows with kantsten", () => {
    const small = estimateParkingLaborHours({ ...BASE, areaM2: 10 });
    const large = estimateParkingLaborHours({ ...BASE, areaM2: 60 });
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
    expect(estimateParkingLaborHours({ ...BASE, kantsten: true })).toBeGreaterThan(
      estimateParkingLaborHours({ ...BASE, kantsten: false })
    );
  });
});
