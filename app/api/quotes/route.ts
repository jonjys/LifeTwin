import { NextResponse } from "next/server";
import { getOrCreateDefaultCompany, prisma } from "@/lib/db";

export const runtime = "nodejs";

type LineItemInput = {
  description: string;
  qty: number;
  unitLabel: string;
  unitPriceSEK: number;
};

type QuoteInput = {
  customerId?: string;
  jobTitle?: string;
  laborHours?: number;
  hourlyRateSEK?: number;
  materialMarkupPct?: number;
  includeRot?: boolean;
  lineItems?: LineItemInput[];
};

export async function GET() {
  try {
    const company = await getOrCreateDefaultCompany();
    const quotes = await prisma.quote.findMany({
      where: { companyId: company.id },
      include: { customer: true, lineItems: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ quotes });
  } catch (err) {
    console.error("GET /api/quotes error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  let body: QuoteInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const jobTitle = body.jobTitle?.trim();
  if (!body.customerId) return NextResponse.json({ error: "Kund krävs." }, { status: 400 });
  if (!jobTitle) return NextResponse.json({ error: "Jobbtitel krävs." }, { status: 400 });
  const lineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  if (lineItems.length === 0) return NextResponse.json({ error: "Offerten saknar materialrader." }, { status: 400 });

  try {
    const company = await getOrCreateDefaultCompany();

    const customer = await prisma.customer.findFirst({ where: { id: body.customerId, companyId: company.id } });
    if (!customer) return NextResponse.json({ error: "Kunden hittades inte." }, { status: 404 });

    const quoteCount = await prisma.quote.count({ where: { companyId: company.id } });
    const number = `OF-${String(quoteCount + 1).padStart(4, "0")}`;

    const quote = await prisma.quote.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        number,
        jobTitle,
        laborHours: body.laborHours ?? 0,
        hourlyRateSEK: body.hourlyRateSEK ?? company.defaultHourlyRateSEK,
        materialMarkupPct: body.materialMarkupPct ?? company.defaultMarkupPct,
        includeRot: body.includeRot ?? true,
        lineItems: {
          create: lineItems.map((li) => ({
            description: li.description,
            qty: li.qty,
            unitLabel: li.unitLabel,
            unitPriceSEK: Math.round(li.unitPriceSEK),
          })),
        },
      },
      include: { customer: true, lineItems: true },
    });

    return NextResponse.json({ quote }, { status: 201 });
  } catch (err) {
    console.error("POST /api/quotes error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}
