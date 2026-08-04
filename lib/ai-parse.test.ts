// lib/ai-parse.test.ts
import { describe, expect, it } from "vitest";
import { mapRawExtractionToDraft, type RawQuoteExtraction } from "@/lib/ai-parse";

function raw(overrides: Partial<RawQuoteExtraction> = {}): RawQuoteExtraction {
  return {
    customerName: null,
    customerAddress: null,
    jobTitle: null,
    projectType: "malning",
    widthM: null,
    heightM: null,
    areaM2: null,
    tier: null,
    hourlyRateSEK: null,
    markupPct: null,
    includeRot: null,
    isolera: null,
    malas: null,
    golvvarme: null,
    troskel: null,
    rannor: null,
    malaTaket: null,
    inkluderaVerktyg: null,
    angspar: null,
    kantsten: null,
    ...overrides,
  };
}

describe("mapRawExtractionToDraft", () => {
  it("maps the exact voice example from the product brief end-to-end", () => {
    const draft = mapRawExtractionToDraft(
      raw({
        customerName: "Anna Andersson",
        customerAddress: "Storgatan 12",
        jobTitle: "Måla villa 180 kvm",
        projectType: "malning",
        areaM2: 180,
        markupPct: 20,
      }),
      "fallback title"
    );

    expect(draft.customerName).toBe("Anna Andersson");
    expect(draft.customerAddress).toBe("Storgatan 12");
    expect(draft.jobTitle).toBe("Måla villa 180 kvm");
    expect(draft.type).toBe("malning");
    expect(draft.areaM2).toBe(180);
    expect(draft.markupPct).toBe(20);
    expect(draft.hourlyRateSEK).toBeNull();
    expect(draft.includeRot).toBeNull();
  });

  it("routes semantic booleans to toggleA/toggleB per projectType", () => {
    expect(mapRawExtractionToDraft(raw({ projectType: "innervagg", isolera: true, malas: false }), "x")).toMatchObject({
      toggleA: true,
      toggleB: false,
    });
    expect(mapRawExtractionToDraft(raw({ projectType: "golv", golvvarme: true, troskel: true }), "x")).toMatchObject({
      toggleA: true,
      toggleB: true,
    });
    expect(mapRawExtractionToDraft(raw({ projectType: "tak", rannor: false }), "x")).toMatchObject({
      toggleA: false,
      toggleB: null,
    });
    expect(mapRawExtractionToDraft(raw({ projectType: "altan", isolera: true }), "x")).toMatchObject({
      toggleA: null,
      toggleB: null,
    });
  });

  it("falls back to innervagg for an unknown/hallucinated projectType", () => {
    const draft = mapRawExtractionToDraft(raw({ projectType: "renovera-hela-huset" }), "x");
    expect(draft.type).toBe("innervagg");
  });

  it("falls back to the provided title when jobTitle is blank", () => {
    const draft = mapRawExtractionToDraft(raw({ jobTitle: "  " }), "Måla villa 180 kvm åt Anna Andersson");
    expect(draft.jobTitle).toBe("Måla villa 180 kvm åt Anna Andersson");
  });

  it("clamps out-of-range numbers instead of passing them through untouched", () => {
    const draft = mapRawExtractionToDraft(
      raw({ areaM2: 999999, hourlyRateSEK: -50, markupPct: 500, widthM: 0 }),
      "x"
    );
    expect(draft.areaM2).toBe(5000);
    expect(draft.hourlyRateSEK).toBe(0);
    expect(draft.markupPct).toBe(200);
    expect(draft.widthM).toBe(0.1);
  });

  it("blanks customerName/customerAddress to null instead of empty strings", () => {
    const draft = mapRawExtractionToDraft(raw({ customerName: "  ", customerAddress: "" }), "x");
    expect(draft.customerName).toBeNull();
    expect(draft.customerAddress).toBeNull();
  });
});
