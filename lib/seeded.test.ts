import { describe, expect, it } from "vitest";
import { between, chance, hash, pick, unit } from "@/lib/seeded";

describe("seeded", () => {
  it("hash is deterministic for the same input", () => {
    expect(hash("ketchup:2024-01-01:jitter")).toBe(hash("ketchup:2024-01-01:jitter"));
  });

  it("hash differs for different inputs", () => {
    expect(hash("a")).not.toBe(hash("b"));
  });

  it("unit stays within [0, 1)", () => {
    for (const seed of ["a", "b", "hundfoder-torr", "2024-01-01"]) {
      const v = unit(seed);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("between stays within [min, max] and is deterministic", () => {
    const a = between("seed-1", 10, 20);
    const b = between("seed-1", 10, 20);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(10);
    expect(a).toBeLessThanOrEqual(20);
  });

  it("chance is deterministic and respects the [0, 1] extremes", () => {
    expect(chance("any-seed", 0)).toBe(false);
    expect(chance("any-seed", 1)).toBe(true);
    expect(chance("repeat", 0.5)).toBe(chance("repeat", 0.5));
  });

  it("pick always returns an element from the pool, deterministically", () => {
    const pool = ["a", "b", "c"] as const;
    const first = pick("seed", pool);
    expect(pool).toContain(first);
    expect(pick("seed", pool)).toBe(first);
  });
});
