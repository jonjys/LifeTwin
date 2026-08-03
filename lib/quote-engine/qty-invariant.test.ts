import { describe, expect, it } from "vitest";
import { generateDeckMaterialsCatalog } from "@/lib/cart-engine/materials-catalog";
import { generateExteriorWallCatalog } from "@/lib/cart-engine/exterior-wall-catalog";
import { generateFloorCatalog } from "@/lib/cart-engine/floor-catalog";
import { generateInsulationCatalog } from "@/lib/cart-engine/insulation-catalog";
import { generatePaintCatalog } from "@/lib/cart-engine/paint-catalog";
import { generateParkingCatalog } from "@/lib/cart-engine/parking-catalog";
import { generateRoofCatalog } from "@/lib/cart-engine/roof-catalog";
import { generateWallCatalog } from "@/lib/cart-engine/wall-catalog";
import type { MaterialItem } from "@/lib/quote-engine/material";

/**
 * The one invariant materialbank price substitution depends on: every
 * item's basePriceSEK must equal qty × unitPriceSEK. If this ever drifts
 * (a catalog changes basePriceSEK's formula without updating qty/
 * unitPriceSEK to match), a materialbank override would silently produce
 * a wrong total — so this is checked across every project type and
 * several dimension/tier/toggle combinations, not just the defaults.
 */
function assertQtyInvariant(items: MaterialItem[]) {
  for (const item of items) {
    const recomputed = Math.round(item.qty * item.unitPriceSEK);
    expect(recomputed, `${item.id}: qty(${item.qty}) × unitPriceSEK(${item.unitPriceSEK}) should equal basePriceSEK`).toBe(
      item.basePriceSEK
    );
  }
}

describe("qty × unitPriceSEK === basePriceSEK", () => {
  it("holds for generateWallCatalog across tiers/toggles/dimensions", () => {
    for (const tier of ["budget", "premium"] as const) {
      for (const dorr of [false, true]) {
        for (const malas of [false, true]) {
          for (const isolera of [false, true]) {
            for (const [widthM, heightM] of [
              [3.6, 2.3],
              [1.2, 2.7],
              [5.5, 2.4],
            ]) {
              assertQtyInvariant(generateWallCatalog({ widthM, heightM, isolera, dorr, malas, verktyg: true, tier }));
            }
          }
        }
      }
    }
  });

  it("holds for generateExteriorWallCatalog across tiers/toggles/dimensions", () => {
    for (const tier of ["budget", "premium"] as const) {
      for (const isolera of [false, true]) {
        for (const malas of [false, true]) {
          for (const [widthM, heightM] of [
            [4.0, 2.5],
            [1.5, 3.0],
          ]) {
            assertQtyInvariant(generateExteriorWallCatalog({ widthM, heightM, isolera, malas, tier }));
          }
        }
      }
    }
  });

  it("holds for generateFloorCatalog across tiers/toggles/dimensions", () => {
    for (const tier of ["budget", "premium"] as const) {
      for (const golvvarme of [false, true]) {
        for (const troskel of [false, true]) {
          for (const [widthM, lengthM] of [
            [4, 5],
            [2, 2],
          ]) {
            assertQtyInvariant(generateFloorCatalog({ widthM, lengthM, golvvarme, troskel, tier }));
          }
        }
      }
    }
  });

  it("holds for generatePaintCatalog across tiers/toggles/areas", () => {
    for (const tier of ["budget", "premium"] as const) {
      for (const tak of [false, true]) {
        for (const verktyg of [false, true]) {
          for (const areaM2 of [15, 60]) {
            assertQtyInvariant(generatePaintCatalog({ areaM2, tak, verktyg, tier }));
          }
        }
      }
    }
  });

  it("holds for generateRoofCatalog across tiers/toggles/areas", () => {
    for (const tier of ["budget", "premium"] as const) {
      for (const rannor of [false, true]) {
        for (const areaM2 of [40, 120]) {
          assertQtyInvariant(generateRoofCatalog({ areaM2, rannor, tier }));
        }
      }
    }
  });

  it("holds for generateInsulationCatalog across tiers/toggles/areas", () => {
    for (const tier of ["budget", "premium"] as const) {
      for (const angsparr of [false, true]) {
        for (const areaM2 of [20, 80]) {
          assertQtyInvariant(generateInsulationCatalog({ areaM2, angsparr, tier }));
        }
      }
    }
  });

  it("holds for generateParkingCatalog across tiers/toggles/areas", () => {
    for (const tier of ["budget", "premium"] as const) {
      for (const kantsten of [false, true]) {
        for (const areaM2 of [15, 40]) {
          assertQtyInvariant(generateParkingCatalog({ areaM2, kantsten, tier }));
        }
      }
    }
  });

  it("holds for generateDeckMaterialsCatalog across dimensions", () => {
    for (const [widthM, depthM] of [
      [3, 4],
      [6, 5],
    ]) {
      assertQtyInvariant(generateDeckMaterialsCatalog(widthM, depthM));
    }
  });
});
