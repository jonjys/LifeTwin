import { describe, expect, it } from "vitest";
import { matchMaterialItem } from "@/lib/quote-engine/material";
import {
  estimateInsulationLaborHours,
  generateInsulationCatalog,
  type InsulationOptions,
} from "@/lib/cart-engine/insulation-catalog";

const BASE: InsulationOptions = { areaM2: 40, angsparr: true, tier: "budget" };

describe("generateInsulationCatalog", () => {
  it("always includes isoleringsskivor", () => {
    expect(generateInsulationCatalog(BASE).some((i) => i.id === "isolering-isolering")).toBe(true);
  });

  it("only includes ångspärr + tejp when angsparr is true", () => {
    expect(generateInsulationCatalog({ ...BASE, angsparr: true }).some((i) => i.id === "angsparr-isolering")).toBe(
      true
    );
    expect(generateInsulationCatalog({ ...BASE, angsparr: false }).some((i) => i.id === "angsparr-isolering")).toBe(
      false
    );
    expect(generateInsulationCatalog({ ...BASE, angsparr: false }).some((i) => i.id === "tejp-isolering")).toBe(
      false
    );
  });

  it("premium costs more than budget for the same area", () => {
    const sum = (items: ReturnType<typeof generateInsulationCatalog>) =>
      items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generateInsulationCatalog({ ...BASE, tier: "premium" }))).toBeGreaterThan(
      sum(generateInsulationCatalog({ ...BASE, tier: "budget" }))
    );
  });

  it("a bigger area costs more than a smaller one", () => {
    const sum = (items: ReturnType<typeof generateInsulationCatalog>) =>
      items.reduce((s, i) => s + i.basePriceSEK, 0);
    expect(sum(generateInsulationCatalog({ ...BASE, areaM2: 100 }))).toBeGreaterThan(
      sum(generateInsulationCatalog({ ...BASE, areaM2: 10 }))
    );
  });

  it("every domain is 'building'", () => {
    for (const item of generateInsulationCatalog(BASE)) {
      expect(item.domain).toBe("building");
    }
  });

  it("every item id resolves back to itself", () => {
    const catalog = generateInsulationCatalog(BASE);
    for (const item of catalog) {
      expect(matchMaterialItem(item.id, catalog)?.id).toBe(item.id);
    }
  });
});

describe("estimateInsulationLaborHours", () => {
  it("is positive and grows with area", () => {
    const small = estimateInsulationLaborHours({ ...BASE, areaM2: 10 });
    const large = estimateInsulationLaborHours({ ...BASE, areaM2: 100 });
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
  });
});
