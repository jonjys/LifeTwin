import { generateDeckMaterialsCatalog } from "@/lib/cart-engine/materials-catalog";
import { estimateExteriorWallLaborHours, generateExteriorWallCatalog } from "@/lib/cart-engine/exterior-wall-catalog";
import { estimateFloorLaborHours, generateFloorCatalog } from "@/lib/cart-engine/floor-catalog";
import { estimateInsulationLaborHours, generateInsulationCatalog } from "@/lib/cart-engine/insulation-catalog";
import { estimatePaintLaborHours, generatePaintCatalog } from "@/lib/cart-engine/paint-catalog";
import { estimateParkingLaborHours, generateParkingCatalog } from "@/lib/cart-engine/parking-catalog";
import { estimateRoofLaborHours, generateRoofCatalog } from "@/lib/cart-engine/roof-catalog";
import { estimateWallLaborHours, generateWallCatalog } from "@/lib/cart-engine/wall-catalog";
import type { MaterialItem } from "@/lib/quote-engine/material";
import { ROT_DEDUCTION_RATE, VAT_RATE } from "@/lib/types";

export type ProjectType = "altan" | "innervagg" | "yttervagg" | "golv" | "tak" | "malning" | "isolering" | "parkering";

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "altan", label: "Altan" },
  { value: "innervagg", label: "Innervägg" },
  { value: "yttervagg", label: "Yttervägg" },
  { value: "golv", label: "Golv" },
  { value: "tak", label: "Tak" },
  { value: "malning", label: "Målning" },
  { value: "isolering", label: "Isolering" },
  { value: "parkering", label: "Parkering" },
];

export type ProjectInputs = {
  type: ProjectType;
  widthM: number;
  heightM: number;
  areaM2: number;
  toggleA: boolean;
  toggleB: boolean;
  tier: "budget" | "premium";
};

export type ProjectEstimate = {
  materials: MaterialItem[];
  laborHours: number;
  toggleALabel: string;
  toggleBLabel: string;
  usesArea: boolean;
  usesToggleB: boolean;
};

/**
 * The one place that dispatches a project type to its calculator engine —
 * shared by /calculator and the Offert-wizard so both always produce the
 * exact same material list and labor hours for the same inputs.
 */
export function estimateProject({ type, widthM, heightM, areaM2, toggleA, toggleB, tier }: ProjectInputs): ProjectEstimate {
  switch (type) {
    case "altan": {
      const items = generateDeckMaterialsCatalog(widthM, heightM);
      return { materials: items, laborHours: widthM * heightM * 0.5, toggleALabel: "", toggleBLabel: "", usesArea: false, usesToggleB: false };
    }
    case "innervagg": {
      const opts = { widthM, heightM, isolera: toggleA, dorr: false, malas: toggleB, verktyg: false, tier };
      return {
        materials: generateWallCatalog(opts),
        laborHours: estimateWallLaborHours(opts),
        toggleALabel: "Isolera väggen?",
        toggleBLabel: "Ska den målas?",
        usesArea: false,
        usesToggleB: true,
      };
    }
    case "yttervagg": {
      const opts = { widthM, heightM, isolera: toggleA, malas: toggleB, tier };
      return {
        materials: generateExteriorWallCatalog(opts),
        laborHours: estimateExteriorWallLaborHours(opts),
        toggleALabel: "Isolera väggen?",
        toggleBLabel: "Ska den målas?",
        usesArea: false,
        usesToggleB: true,
      };
    }
    case "golv": {
      const opts = { widthM, lengthM: heightM, golvvarme: toggleA, troskel: toggleB, tier };
      return {
        materials: generateFloorCatalog(opts),
        laborHours: estimateFloorLaborHours(opts),
        toggleALabel: "Golvvärme?",
        toggleBLabel: "Trösklar?",
        usesArea: false,
        usesToggleB: true,
      };
    }
    case "tak": {
      const opts = { areaM2, rannor: toggleA, tier };
      return {
        materials: generateRoofCatalog(opts),
        laborHours: estimateRoofLaborHours(opts),
        toggleALabel: "Hängrännor?",
        toggleBLabel: "",
        usesArea: true,
        usesToggleB: false,
      };
    }
    case "malning": {
      const opts = { areaM2, tak: toggleA, verktyg: toggleB, tier };
      return {
        materials: generatePaintCatalog(opts),
        laborHours: estimatePaintLaborHours(opts),
        toggleALabel: "Måla taket också?",
        toggleBLabel: "Inkludera verktyg?",
        usesArea: true,
        usesToggleB: true,
      };
    }
    case "isolering": {
      const opts = { areaM2, angsparr: toggleA, tier };
      return {
        materials: generateInsulationCatalog(opts),
        laborHours: estimateInsulationLaborHours(opts),
        toggleALabel: "Ångspärr?",
        toggleBLabel: "",
        usesArea: true,
        usesToggleB: false,
      };
    }
    case "parkering": {
      const opts = { areaM2, kantsten: toggleA, tier };
      return {
        materials: generateParkingCatalog(opts),
        laborHours: estimateParkingLaborHours(opts),
        toggleALabel: "Kantsten?",
        toggleBLabel: "",
        usesArea: true,
        usesToggleB: false,
      };
    }
  }
}

export type QuoteTotalsInput = {
  materials: MaterialItem[];
  laborHours: number;
  hourlyRateSEK: number;
  markupPct: number;
  includeRot: boolean;
};

/** Material (with markup) + labor + VAT + ROT-avdrag — the one prisbild
 *  computation shared by /calculator and every offert preview. */
export function computeQuoteTotals({ materials, laborHours, hourlyRateSEK, markupPct, includeRot }: QuoteTotalsInput) {
  const materialCostSEK = materials.reduce((sum, m) => sum + m.basePriceSEK, 0);
  const materialWithMarkupSEK = Math.round(materialCostSEK * (1 + markupPct / 100));
  const laborCostSEK = Math.round(laborHours * hourlyRateSEK);
  const subtotalExclVatSEK = materialWithMarkupSEK + laborCostSEK;
  const vatSEK = Math.round(subtotalExclVatSEK * VAT_RATE);
  const rotDeductionSEK = includeRot ? Math.round(laborCostSEK * ROT_DEDUCTION_RATE) : 0;
  const totalInclVatSEK = subtotalExclVatSEK + vatSEK;
  const totalAfterRotSEK = totalInclVatSEK - rotDeductionSEK;
  return {
    materialCostSEK,
    materialWithMarkupSEK,
    laborCostSEK,
    subtotalExclVatSEK,
    vatSEK,
    rotDeductionSEK,
    totalInclVatSEK,
    totalAfterRotSEK,
  };
}
