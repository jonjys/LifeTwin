import { NextResponse } from "next/server";
import { getOrCreateDefaultCompany, prisma } from "@/lib/db";
import { ROT_DEDUCTION_RATE, VAT_RATE } from "@/lib/types";

export const runtime = "nodejs";

/** Same prisbild formula as everywhere else (lib/quote-engine/estimate.ts's
 *  computeQuoteTotals) — reimplemented against already-saved line items
 *  since this runs server-side over a Prisma result, not a live MaterialItem[]. */
function quoteTotal(q: {
  lineItems: { unitPriceSEK: number; qty: number }[];
  materialMarkupPct: number;
  laborHours: number;
  hourlyRateSEK: number;
  includeRot: boolean;
}): number {
  const materialCostSEK = q.lineItems.reduce((sum, li) => sum + li.unitPriceSEK * li.qty, 0);
  const materialWithMarkupSEK = materialCostSEK * (1 + q.materialMarkupPct / 100);
  const laborCostSEK = q.laborHours * q.hourlyRateSEK;
  const subtotalExclVatSEK = materialWithMarkupSEK + laborCostSEK;
  const vatSEK = subtotalExclVatSEK * VAT_RATE;
  const rotDeductionSEK = q.includeRot ? laborCostSEK * ROT_DEDUCTION_RATE : 0;
  return subtotalExclVatSEK + vatSEK - rotDeductionSEK;
}

/**
 * Every number here is a real aggregation over saved Quote rows — no
 * invented margin math, no simulated pipeline. Empty/zero until there's
 * real quote history to summarize.
 */
export async function GET() {
  try {
    const company = await getOrCreateDefaultCompany();
    const quotes = await prisma.quote.findMany({
      where: { companyId: company.id },
      include: { lineItems: true },
    });

    const countByStatus = { DRAFT: 0, SENT: 0, ACCEPTED: 0, DECLINED: 0 };
    for (const q of quotes) countByStatus[q.status]++;

    const decided = countByStatus.ACCEPTED + countByStatus.DECLINED;
    const winRatePct = decided > 0 ? Math.round((countByStatus.ACCEPTED / decided) * 100) : null;

    const accepted = quotes.filter((q) => q.status === "ACCEPTED");
    const avgMarkupPct =
      accepted.length > 0 ? Math.round(accepted.reduce((s, q) => s + q.materialMarkupPct, 0) / accepted.length) : null;
    const avgQuoteValueSEK =
      accepted.length > 0 ? Math.round(accepted.reduce((s, q) => s + quoteTotal(q), 0) / accepted.length) : null;

    const pipelineValueSEK = quotes
      .filter((q) => q.status === "SENT")
      .reduce((sum, q) => sum + quoteTotal(q), 0);

    return NextResponse.json({
      summary: {
        totalQuotes: quotes.length,
        countByStatus,
        winRatePct,
        avgMarkupPct,
        avgQuoteValueSEK,
        pipelineValueSEK: Math.round(pipelineValueSEK),
      },
    });
  } catch (err) {
    console.error("GET /api/ai-studio/margin-summary error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}
