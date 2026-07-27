import { describe, expect, it } from "vitest";
import { buildCart, CATALOG } from "@/lib/cart-engine";
import { generatePetCatalog } from "@/lib/cart-engine/pet-catalog";

const DAY = "2024-06-01";

describe("buildCart", () => {
  it("defaults to the grocery domain and catalog", () => {
    const cart = buildCart(["mjölk"], DAY, []);
    expect(cart.domain).toBe("grocery");
    expect(cart.items).toHaveLength(1);
  });

  it("uses the domain of whatever catalog is passed in", () => {
    const petCatalog = generatePetCatalog(true, false);
    const cart = buildCart(["hundfoder-torr"], DAY, [], petCatalog);
    expect(cart.domain).toBe("pet");
  });

  it("produces the flagship ketchup swap exactly as the product pitch describes", () => {
    const cart = buildCart(["ketchup"], DAY, [], CATALOG);
    const item = cart.items[0];
    expect(item.naive.priceSEK).toBe(32);
    expect(item.chosen.priceSEK).toBe(14);
    expect(item.savingsSEK).toBe(18);
    expect(item.swapReason).toBe("brand");
  });

  it("totals are internally consistent", () => {
    const cart = buildCart(["mjölk", "ketchup", "avokado"], DAY, [], CATALOG);
    const naiveSum = cart.items.reduce((sum, i) => sum + i.naive.priceSEK, 0);
    const chosenSum = cart.items.reduce((sum, i) => sum + i.chosen.priceSEK, 0);
    expect(cart.totalNaiveSEK).toBe(naiveSum);
    expect(cart.totalOptimizedSEK).toBe(chosenSum);
    expect(cart.totalSavingsSEK).toBe(Math.max(0, naiveSum - chosenSum));
  });

  it("never returns negative savings even if chosen happened to cost more", () => {
    const cart = buildCart(["något helt okänt och unikt"], DAY, [], CATALOG);
    expect(cart.totalSavingsSEK).toBeGreaterThanOrEqual(0);
  });

  it("only attaches grocery notifications for the grocery domain", () => {
    const groceryCart = buildCart(["mjölk"], DAY, ["mjölk", "mjölk"], CATALOG);
    const petCart = buildCart(["hundfoder-torr"], DAY, [], generatePetCatalog(true, false));
    expect(petCart.notifications).toEqual([]);
    expect(Array.isArray(groceryCart.notifications)).toBe(true);
  });

  it("is deterministic for the same inputs", () => {
    const a = buildCart(["mjölk", "ketchup"], DAY, [], CATALOG);
    const b = buildCart(["mjölk", "ketchup"], DAY, [], CATALOG);
    expect(a).toEqual(b);
  });

  it("expands a known meal into its ingredients", () => {
    const cart = buildCart(["tacos"], DAY, [], CATALOG);
    expect(cart.items.length).toBeGreaterThan(1);
  });
});
