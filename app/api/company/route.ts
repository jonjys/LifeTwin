import { NextResponse } from "next/server";
import { getOrCreateDefaultCompany, prisma } from "@/lib/db";

export const runtime = "nodejs";

type CompanyInput = {
  name?: string;
  orgNumber?: string;
  vatNumber?: string;
  bankgiro?: string;
  email?: string;
  phone?: string;
  address?: string;
  defaultHourlyRateSEK?: number;
  defaultMarkupPct?: number;
};

export async function GET() {
  try {
    const company = await getOrCreateDefaultCompany();
    return NextResponse.json({ company });
  } catch (err) {
    console.error("GET /api/company error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  let body: CompanyInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const data: Record<string, string | number> = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Företagsnamn krävs." }, { status: 400 });
    data.name = name;
  }
  if (body.orgNumber !== undefined) data.orgNumber = body.orgNumber.trim();
  if (body.vatNumber !== undefined) data.vatNumber = body.vatNumber.trim();
  if (body.bankgiro !== undefined) data.bankgiro = body.bankgiro.trim();
  if (body.email !== undefined) data.email = body.email.trim();
  if (body.phone !== undefined) data.phone = body.phone.trim();
  if (body.address !== undefined) data.address = body.address.trim();
  if (body.defaultHourlyRateSEK !== undefined) data.defaultHourlyRateSEK = Math.max(0, Math.round(body.defaultHourlyRateSEK));
  if (body.defaultMarkupPct !== undefined) data.defaultMarkupPct = Math.max(0, Math.round(body.defaultMarkupPct));

  try {
    const company = await getOrCreateDefaultCompany();
    const updated = await prisma.company.update({ where: { id: company.id }, data });
    return NextResponse.json({ company: updated });
  } catch (err) {
    console.error("PATCH /api/company error", err);
    return NextResponse.json({ error: "Företagsprofilen kunde inte sparas." }, { status: 503 });
  }
}
