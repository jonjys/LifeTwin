import { describe, expect, it } from "vitest";
import { interpretHomeQuery } from "@/lib/home-intent";

describe("interpretHomeQuery", () => {
  it("treats empty input as an empty grocery list", () => {
    expect(interpretHomeQuery("")).toEqual({ kind: "grocery", items: [] });
    expect(interpretHomeQuery("   ")).toEqual({ kind: "grocery", items: [] });
  });

  it("recognizes a deck project", () => {
    expect(interpretHomeQuery("bygg altan")).toEqual({ kind: "deck" });
  });

  it("recognizes a week-plan request", () => {
    expect(interpretHomeQuery("veckohandling")).toEqual({ kind: "week" });
  });

  it("recognizes a dog-only pet request", () => {
    expect(interpretHomeQuery("hundmat")).toEqual({
      kind: "pet",
      hasDog: true,
      hasCat: false,
      hasSmadjur: false,
      hasFisk: false,
    });
  });

  it("recognizes a cat-only pet request", () => {
    expect(interpretHomeQuery("kattmat")).toEqual({
      kind: "pet",
      hasDog: false,
      hasCat: true,
      hasSmadjur: false,
      hasFisk: false,
    });
  });

  it("recognizes both dog and cat when both are mentioned", () => {
    expect(interpretHomeQuery("hund och katt")).toEqual({
      kind: "pet",
      hasDog: true,
      hasCat: true,
      hasSmadjur: false,
      hasFisk: false,
    });
  });

  it("recognizes a smådjur request", () => {
    expect(interpretHomeQuery("smådjur")).toEqual({
      kind: "pet",
      hasDog: false,
      hasCat: false,
      hasSmadjur: true,
      hasFisk: false,
    });
  });

  it("recognizes a fisk/aquarium request", () => {
    expect(interpretHomeQuery("akvarium")).toEqual({
      kind: "pet",
      hasDog: false,
      hasCat: false,
      hasSmadjur: false,
      hasFisk: true,
    });
  });

  it("does not mis-route a real grocery item containing 'fisk' as a substring", () => {
    expect(interpretHomeQuery("fiskpinnar")).toEqual({ kind: "grocery", items: ["fiskpinnar"] });
  });

  it("recognizes an electronics request", () => {
    expect(interpretHomeQuery("ny tv")).toEqual({ kind: "electronics" });
  });

  it("recognizes a pharmacy request", () => {
    expect(interpretHomeQuery("apotek")).toEqual({ kind: "pharmacy" });
  });

  it("recognizes a car-service request", () => {
    expect(interpretHomeQuery("bilservice")).toEqual({ kind: "auto" });
  });

  it("recognizes every category-accordion subcategory query used on the home screen", () => {
    // These are the exact `query` strings lib/categories.ts feeds through
    // submit() for its built subcategories — every one must resolve to
    // something other than a mis-parsed grocery item.
    expect(interpretHomeQuery("tacos").kind).toBe("grocery");
    expect(interpretHomeQuery("reservdelar bil")).toEqual({ kind: "auto" });
    expect(interpretHomeQuery("allergi apotek")).toEqual({ kind: "pharmacy" });
    expect(interpretHomeQuery("förkylning apotek")).toEqual({ kind: "pharmacy" });
    expect(interpretHomeQuery("hudvård apotek")).toEqual({ kind: "pharmacy" });
    expect(interpretHomeQuery("barnvård apotek")).toEqual({ kind: "pharmacy" });
    expect(interpretHomeQuery("första hjälpen apotek")).toEqual({ kind: "pharmacy" });
  });

  it("flags genuinely unsupported categories honestly instead of mis-parsing them", () => {
    expect(interpretHomeQuery("semester i spanien")).toEqual({ kind: "unsupported", label: "Semester" });
    expect(interpretHomeQuery("ikea")).toEqual({ kind: "unsupported", label: "IKEA" });
  });

  it("splits free text into a grocery list on commas and 'och'", () => {
    const intent = interpretHomeQuery("mjölk, ägg och bröd");
    expect(intent).toEqual({ kind: "grocery", items: ["mjölk", "ägg", "bröd"] });
  });

  it("falls back to the whole string as one item when there's no separator", () => {
    expect(interpretHomeQuery("mjölk")).toEqual({ kind: "grocery", items: ["mjölk"] });
  });
});
