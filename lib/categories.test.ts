import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/lib/categories";
import { interpretHomeQuery } from "@/lib/home-intent";

describe("CATEGORIES", () => {
  it("has unique category ids", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique subcategory ids across the whole config", () => {
    const ids = CATEGORIES.flatMap((c) => c.subcategories).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every subcategory is exactly one of query, href, or comingSoon", () => {
    for (const category of CATEGORIES) {
      for (const sub of category.subcategories) {
        const flags = ["query" in sub, "href" in sub, "comingSoon" in sub].filter(Boolean);
        expect(flags).toHaveLength(1);
      }
    }
  });

  it("every 'query' subcategory resolves to a real intent, never 'unsupported' — and any grocery fallback is a deliberate multi-item list, not an accidental single word", () => {
    for (const category of CATEGORIES) {
      for (const sub of category.subcategories) {
        if (!("query" in sub)) continue;
        const intent = interpretHomeQuery(sub.query);
        expect(intent.kind).not.toBe("unsupported");
        if (intent.kind !== "grocery") continue;
        // "tacos" deliberately falls through as a single item —
        // MEAL_EXPANSIONS expands it into a full list downstream.
        if (sub.query === "tacos") {
          expect(intent.items).toHaveLength(1);
        } else {
          expect(intent.items.length).toBeGreaterThan(1);
        }
      }
    }
  });
});
