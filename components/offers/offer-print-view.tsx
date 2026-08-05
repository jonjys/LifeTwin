/**
 * Rendered off-screen (`hidden`) and only shown by app/globals.css's
 * `@media print { .print-offer { display: block !important } }` rule —
 * a printed offert should look like a real business document (light
 * background, black text), not a screenshot of the dark-theme app.
 */

import { SHARE_TAGLINE, SITE_URL } from "@/lib/site";

type PrintLineItem = { id: string; description: string; qty: number; unitLabel: string; unitPriceSEK: number };

type OfferPrintViewProps = {
  number: string;
  jobTitle: string;
  createdAt: string;
  customer: { name: string; address: string; phone: string; email: string };
  company: { name: string; orgNumber: string; vatNumber: string; bankgiro: string; email: string; phone: string; address: string };
  lineItems: PrintLineItem[];
  materialWithMarkupSEK: number;
  materialMarkupPct: number;
  laborHours: number;
  hourlyRateSEK: number;
  laborCostSEK: number;
  vatSEK: number;
  rotDeductionSEK: number;
  includeRot: boolean;
  totalAfterRotSEK: number;
  /** Free-tier offerter bär en diskret vattenstämpel — se lib/freemium.ts. */
  isPro: boolean;
};

function fmt(n: number): string {
  return `${Math.round(n).toLocaleString("sv-SE")} kr`;
}

export function OfferPrintView(props: OfferPrintViewProps) {
  const { number, jobTitle, createdAt, customer, company, lineItems } = props;

  return (
    <div className="print-offer hidden" style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#111", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #111", paddingBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>{company.name || "Företagsnamn saknas"}</h1>
          {company.orgNumber && <p style={{ fontSize: "12px", margin: "2px 0" }}>Org.nr: {company.orgNumber}</p>}
          {company.vatNumber && <p style={{ fontSize: "12px", margin: "2px 0" }}>Momsreg.nr: {company.vatNumber}</p>}
          {company.address && <p style={{ fontSize: "12px", margin: "2px 0" }}>{company.address}</p>}
          <p style={{ fontSize: "12px", margin: "2px 0" }}>
            {[company.phone, company.email].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>OFFERT {number}</h2>
          <p style={{ fontSize: "12px", margin: "2px 0" }}>{new Date(createdAt).toLocaleDateString("sv-SE")}</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
        <div>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555", margin: "0 0 4px" }}>
            Till
          </p>
          <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{customer.name}</p>
          {customer.address && <p style={{ fontSize: "12px", margin: "2px 0" }}>{customer.address}</p>}
          <p style={{ fontSize: "12px", margin: "2px 0" }}>{[customer.phone, customer.email].filter(Boolean).join(" · ")}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555", margin: "0 0 4px" }}>
            Jobb
          </p>
          <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{jobTitle}</p>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "24px", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #999" }}>
            <th style={{ textAlign: "left", padding: "6px 0" }}>Beskrivning</th>
            <th style={{ textAlign: "right", padding: "6px 0" }}>Antal</th>
            <th style={{ textAlign: "right", padding: "6px 0" }}>Á-pris</th>
            <th style={{ textAlign: "right", padding: "6px 0" }}>Summa</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((li) => (
            <tr key={li.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "6px 0" }}>{li.description}</td>
              <td style={{ textAlign: "right", padding: "6px 0" }}>
                {li.qty} {li.unitLabel}
              </td>
              <td style={{ textAlign: "right", padding: "6px 0" }}>{fmt(li.unitPriceSEK)}</td>
              <td style={{ textAlign: "right", padding: "6px 0" }}>{fmt(li.unitPriceSEK * li.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "16px", marginLeft: "auto", width: "260px", fontSize: "13px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>Material (inkl. {props.materialMarkupPct}% påslag)</span>
          <span>{fmt(props.materialWithMarkupSEK)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>
            Arbetstid ({props.laborHours.toFixed(1)} h × {props.hourlyRateSEK} kr)
          </span>
          <span>{fmt(props.laborCostSEK)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>Moms (25%)</span>
          <span>{fmt(props.vatSEK)}</span>
        </div>
        {props.includeRot && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span>ROT-avdrag (30% av arbetskostnad)</span>
            <span>-{fmt(props.rotDeductionSEK)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "2px solid #111", fontWeight: 700, fontSize: "15px" }}>
          <span>Att fakturera</span>
          <span>{fmt(props.totalAfterRotSEK)}</span>
        </div>
      </div>

      {company.bankgiro && (
        <p style={{ fontSize: "11px", color: "#555", marginTop: "32px" }}>Betalas till bankgiro {company.bankgiro}.</p>
      )}

      {!props.isPro && (
        <p style={{ fontSize: "10px", color: "#999", marginTop: "24px", textAlign: "center" }}>
          Skapad med{" "}
          <a href={SITE_URL} style={{ color: "#666", textDecoration: "underline" }}>
            OffertPro.se — {SHARE_TAGLINE}
          </a>
        </p>
      )}
    </div>
  );
}
