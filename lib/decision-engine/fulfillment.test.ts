import { describe, expect, it } from "vitest";
import { buildCart, CATALOG } from "@/lib/cart-engine";
import { generateDeckMaterialsCatalog } from "@/lib/cart-engine/materials-catalog";
import { generatePetCatalog } from "@/lib/cart-engine/pet-catalog";
import { generateElectronicsCatalog } from "@/lib/cart-engine/electronics-catalog";
import { generateApotekCatalog } from "@/lib/cart-engine/apotek-catalog";
import { computeFulfillmentOptions } from "@/lib/decision-engine";
import { DEFAULT_PROFILE, type UserProfile } from "@/lib/types";

const DAY = "2024-06-01";
const profile: UserProfile = { ...DEFAULT_PROFILE, homeAddress: "Stockholm", transportMode: "car" };

describe("computeFulfillmentOptions", () => {
  it("offers pickup, delivery, and walk for groceries", () => {
    const cart = buildCart(["mjölk"], DAY, [], CATALOG);
    const decision = computeFulfillmentOptions(cart, profile);
    expect(decision.options.map((o) => o.id).sort()).toEqual(["delivery", "pickup", "walk"]);
  });

  it("offers pickup, delivery, and walk for pharmacy — small enough to carry home", () => {
    const cart = buildCart(["smartstillande"], DAY, [], generateApotekCatalog());
    const decision = computeFulfillmentOptions(cart, profile);
    expect(decision.options.map((o) => o.id).sort()).toEqual(["delivery", "pickup", "walk"]);
  });

  it("excludes walk for bulky building materials", () => {
    const cart = buildCart(["trall"], DAY, [], generateDeckMaterialsCatalog(4, 3));
    const decision = computeFulfillmentOptions(cart, profile);
    expect(decision.options.map((o) => o.id).sort()).toEqual(["delivery", "pickup"]);
  });

  it("excludes walk for heavy pet foder", () => {
    const cart = buildCart(["hundfoder-torr"], DAY, [], generatePetCatalog(true, false));
    const decision = computeFulfillmentOptions(cart, profile);
    expect(decision.options.map((o) => o.id).sort()).toEqual(["delivery", "pickup"]);
  });

  it("excludes walk for a TV", () => {
    const cart = buildCart(["tv-65"], DAY, [], generateElectronicsCatalog());
    const decision = computeFulfillmentOptions(cart, profile);
    expect(decision.options.map((o) => o.id).sort()).toEqual(["delivery", "pickup"]);
  });

  it("charges a trailer rental only for building projects when the profile has no trailer", () => {
    const cart = buildCart(["trall"], DAY, [], generateDeckMaterialsCatalog(4, 3));
    const withoutTrailer = computeFulfillmentOptions(cart, { ...profile, hasTrailer: false });
    const withTrailer = computeFulfillmentOptions(cart, { ...profile, hasTrailer: true });
    const pickupWithout = withoutTrailer.options.find((o) => o.id === "pickup")!;
    const pickupWith = withTrailer.options.find((o) => o.id === "pickup")!;
    expect(pickupWithout.extraFeeSEK).toBeGreaterThan(0);
    expect(pickupWith.extraFeeSEK).toBeUndefined();
  });

  it("never charges a trailer rental for pet or electronics projects", () => {
    const petCart = buildCart(["hundfoder-torr"], DAY, [], generatePetCatalog(true, false));
    const petDecision = computeFulfillmentOptions(petCart, { ...profile, hasTrailer: false });
    expect(petDecision.options.find((o) => o.id === "pickup")!.extraFeeSEK).toBeUndefined();

    const tvCart = buildCart(["tv-65"], DAY, [], generateElectronicsCatalog());
    const tvDecision = computeFulfillmentOptions(tvCart, { ...profile, hasTrailer: false });
    expect(tvDecision.options.find((o) => o.id === "pickup")!.extraFeeSEK).toBeUndefined();
  });

  it("always marks exactly one option as recommended", () => {
    const cart = buildCart(["mjölk"], DAY, [], CATALOG);
    const decision = computeFulfillmentOptions(cart, profile);
    const recommended = decision.options.filter((o) => o.recommended);
    expect(recommended).toHaveLength(1);
    expect(decision.recommendedId).toBe(recommended[0].id);
  });

  it("harsh weather only produces a weatherNote when walk is actually an option", () => {
    const groceryCart = buildCart(["mjölk"], DAY, [], CATALOG);
    const groceryDecision = computeFulfillmentOptions(groceryCart, profile, {
      tempC: -5,
      precipitationMm: 0,
      harsh: true,
      reason: "kyla",
    });
    expect(groceryDecision.weatherNote).not.toBeNull();

    const deckCart = buildCart(["trall"], DAY, [], generateDeckMaterialsCatalog(4, 3));
    const deckDecision = computeFulfillmentOptions(deckCart, profile, {
      tempC: -5,
      precipitationMm: 0,
      harsh: true,
      reason: "kyla",
    });
    expect(deckDecision.weatherNote).toBeNull();
  });
});
