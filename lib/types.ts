/**
 * OffertPro's business domain — a hantverkare's customers, quotes, and
 * company profile. Replaces Karma's consumer shopping-cart state
 * entirely (see git history if that's ever needed again); nothing here
 * depends on a retail store or a shopping list.
 */

export type QuoteStatus = "Utkast" | "Skickad" | "Vunnen" | "Avslagen";

export type Customer = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  /** Personnummer — needed for ROT-avdrag reporting to Skatteverket. */
  ssn: string;
  /** Fastighetsbeteckning — also required for ROT-avdrag. */
  propertyId: string;
  createdAt: string;
};

export type QuoteLineItem = {
  id: string;
  description: string;
  qty: number;
  unitLabel: string;
  unitPriceSEK: number;
};

export type Quote = {
  id: string;
  number: string;
  customerId: string;
  jobTitle: string;
  createdAt: string;
  laborHours: number;
  hourlyRateSEK: number;
  materialMarkupPct: number;
  includeRot: boolean;
  lineItems: QuoteLineItem[];
  status: QuoteStatus;
};

export type CompanyProfile = {
  name: string;
  orgNumber: string;
  vatNumber: string;
  bankgiro: string;
  email: string;
  phone: string;
  address: string;
  defaultHourlyRateSEK: number;
  defaultMarkupPct: number;
};

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: "",
  orgNumber: "",
  vatNumber: "",
  bankgiro: "",
  email: "",
  phone: "",
  address: "",
  defaultHourlyRateSEK: 650,
  defaultMarkupPct: 15,
};

/** Standard Swedish ROT-avdrag: 30% of labor cost, deducted from the
 *  customer's invoice (the tradesperson claims it back from Skatteverket). */
export const ROT_DEDUCTION_RATE = 0.3;
/** Standard Swedish moms on construction services. */
export const VAT_RATE = 0.25;

/** A quote's full cost breakdown — material (with markup), labor, VAT,
 *  and ROT-avdrag — computed once, rendered everywhere (wizard preview,
 *  PDF, dashboard KPIs). Pure function of a Quote, no side effects. */
export type QuoteTotals = {
  materialCostSEK: number;
  materialWithMarkupSEK: number;
  laborCostSEK: number;
  subtotalExclVatSEK: number;
  vatSEK: number;
  rotDeductionSEK: number;
  totalInclVatSEK: number;
  totalAfterRotSEK: number;
};
