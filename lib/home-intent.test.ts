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
    expect(interpretHomeQuery("hundmat")).toEqual({ kind: "pet", hasDog: true, hasCat: false });
  });

  it("recognizes a cat-only pet request", () => {
    expect(interpretHomeQuery("kattmat")).toEqual({ kind: "pet", hasDog: false, hasCat: true });
  });

  it("recognizes both dog and cat when both are mentioned", () => {
    expect(interpretHomeQuery("hund och katt")).toEqual({ kind: "pet", hasDog: true, hasCat: true });
  });

  it("recognizes an electronics request", () => {
    expect(interpretHomeQuery("ny tv")).toEqual({ kind: "electronics" });
  });

  it("recognizes a pharmacy request", () => {
    expect(interpretHomeQuery("apotek")).toEqual({ kind: "pharmacy" });
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
