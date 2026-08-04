// lib/ai-parse.ts
import { PROJECT_TYPES, type ProjectType } from "@/lib/quote-engine/estimate";

const PROJECT_TYPE_VALUES = PROJECT_TYPES.map((p) => p.value);

/** The raw shape Claude's "extract_quote" tool call returns — semantic
 *  booleans instead of the wizard's generic toggleA/toggleB, since which
 *  toggle means what depends on the chosen projectType. */
export type RawQuoteExtraction = {
  customerName: string | null;
  customerAddress: string | null;
  jobTitle: string | null;
  projectType: string;
  widthM: number | null;
  heightM: number | null;
  areaM2: number | null;
  tier: string | null;
  workHours: number | null;
  hourlyRateSEK: number | null;
  markupPct: number | null;
  includeRot: boolean | null;
  isolera: boolean | null;
  malas: boolean | null;
  golvvarme: boolean | null;
  troskel: boolean | null;
  rannor: boolean | null;
  malaTaket: boolean | null;
  inkluderaVerktyg: boolean | null;
  angspar: boolean | null;
  kantsten: boolean | null;
};

/** The mapped, wizard-ready shape — toggleA/toggleB already resolved to
 *  whatever they mean for this projectType. Every field is nullable except
 *  jobTitle/type: the wizard only overrides a field when it isn't null, so
 *  anything the AI didn't hear falls back to the wizard's own defaults. */
export type ExtractedQuoteDraft = {
  customerName: string | null;
  customerAddress: string | null;
  jobTitle: string;
  type: ProjectType;
  widthM: number | null;
  heightM: number | null;
  areaM2: number | null;
  toggleA: boolean | null;
  toggleB: boolean | null;
  tier: "budget" | "premium" | null;
  /** An explicitly spoken hour count (e.g. "45 timmar") — overrides the
   *  wizard's normally engine-computed laborHours when set. Stays null for
   *  the far more common case where hours aren't stated, so the dimension-
   *  based estimate remains authoritative. */
  workHoursOverride: number | null;
  hourlyRateSEK: number | null;
  markupPct: number | null;
  includeRot: boolean | null;
};

function clamp(value: number | null, min: number, max: number): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return Math.min(max, Math.max(min, value));
}

/** Which semantic booleans become toggleA/toggleB for each projectType —
 *  mirrors the toggle wiring in lib/quote-engine/estimate.ts exactly. */
function resolveToggles(type: ProjectType, raw: RawQuoteExtraction): { toggleA: boolean | null; toggleB: boolean | null } {
  switch (type) {
    case "innervagg":
    case "yttervagg":
      return { toggleA: raw.isolera, toggleB: raw.malas };
    case "golv":
      return { toggleA: raw.golvvarme, toggleB: raw.troskel };
    case "tak":
      return { toggleA: raw.rannor, toggleB: null };
    case "malning":
      return { toggleA: raw.malaTaket, toggleB: raw.inkluderaVerktyg };
    case "isolering":
      return { toggleA: raw.angspar, toggleB: null };
    case "parkering":
      return { toggleA: raw.kantsten, toggleB: null };
    case "altan":
      return { toggleA: null, toggleB: null };
  }
}

/** Pure mapping + validation — never trusts the model's numbers blindly:
 *  unknown projectType falls back to "innervagg", out-of-range numbers are
 *  clamped to sane bounds rather than rejected outright. */
export function mapRawExtractionToDraft(raw: RawQuoteExtraction, fallbackJobTitle: string): ExtractedQuoteDraft {
  const type: ProjectType = PROJECT_TYPE_VALUES.includes(raw.projectType as ProjectType)
    ? (raw.projectType as ProjectType)
    : "innervagg";

  const { toggleA, toggleB } = resolveToggles(type, raw);

  return {
    customerName: raw.customerName?.trim() || null,
    customerAddress: raw.customerAddress?.trim() || null,
    jobTitle: raw.jobTitle?.trim() || fallbackJobTitle,
    type,
    widthM: clamp(raw.widthM, 0.1, 50),
    heightM: clamp(raw.heightM, 0.1, 50),
    areaM2: clamp(raw.areaM2, 1, 5000),
    toggleA,
    toggleB,
    tier: raw.tier === "premium" ? "premium" : raw.tier === "budget" ? "budget" : null,
    workHoursOverride: clamp(raw.workHours, 0.25, 500),
    hourlyRateSEK: clamp(raw.hourlyRateSEK, 0, 3000),
    markupPct: clamp(raw.markupPct, 0, 200),
    includeRot: raw.includeRot,
  };
}

const DRAFT_STORAGE_KEY = "offertpro:draft-quote:v1";

/** Handoff from CommandBar to the Offert-wizard: sessionStorage rather than
 *  a URL param, since the draft carries several fields and should only ever
 *  be consumed once. Fails silently (private browsing, storage disabled) —
 *  the wizard just falls back to its normal blank form. */
export function saveDraftQuote(draft: ExtractedQuoteDraft) {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage unavailable — the wizard opens blank instead of prefilled.
  }
}

/** Reads and immediately clears the pending draft so a page refresh or a
 *  second visit to /offers/new doesn't silently reapply stale voice input. */
export function consumeDraftQuote(): ExtractedQuoteDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    return JSON.parse(raw) as ExtractedQuoteDraft;
  } catch {
    return null;
  }
}
