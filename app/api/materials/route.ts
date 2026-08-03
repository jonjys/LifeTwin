import { NextResponse } from "next/server";
import { getOrCreateDefaultCompany, prisma } from "@/lib/db";

export const runtime = "nodejs";

type MaterialInput = {
  name?: string;
  category?: string;
  unit?: string;
  priceSEK?: number;
  supplier?: string;
};

export async function GET() {
  try {
    const company = await getOrCreateDefaultCompany();
    const materials = await prisma.materialBankItem.findMany({
      where: { companyId: company.id },
      include: { history: { orderBy: { recordedAt: "desc" }, take: 1 } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ materials });
  } catch (err) {
    console.error("GET /api/materials error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  let body: MaterialInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Namn krävs." }, { status: 400 });
  if (typeof body.priceSEK !== "number" || body.priceSEK < 0) {
    return NextResponse.json({ error: "Ange ett giltigt pris." }, { status: 400 });
  }

  try {
    const company = await getOrCreateDefaultCompany();
    const material = await prisma.materialBankItem.create({
      data: {
        companyId: company.id,
        name,
        category: body.category?.trim() ?? "",
        unit: body.unit?.trim() ?? "st",
        priceSEK: Math.round(body.priceSEK),
        supplier: body.supplier?.trim() ?? "",
      },
      include: { history: true },
    });
    return NextResponse.json({ material }, { status: 201 });
  } catch (err) {
    console.error("POST /api/materials error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}
