import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type MaterialInput = {
  name?: string;
  category?: string;
  unit?: string;
  priceSEK?: number;
  supplier?: string;
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const material = await prisma.materialBankItem.findUnique({
      where: { id },
      include: { history: { orderBy: { recordedAt: "desc" } } },
    });
    if (!material) return NextResponse.json({ error: "Materialet hittades inte." }, { status: 404 });
    return NextResponse.json({ material });
  } catch (err) {
    console.error("GET /api/materials/[id] error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}

/**
 * Updating price/supplier archives the item's current values into
 * MaterialPriceHistory first — this is what lets a future receipt scan
 * say "priset har ökat 8% sedan sist" instead of only ever knowing today's
 * number.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: MaterialInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  try {
    const existing = await prisma.materialBankItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Materialet hittades inte." }, { status: 404 });

    const data: Record<string, string | number> = {};
    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) return NextResponse.json({ error: "Namn krävs." }, { status: 400 });
      data.name = name;
    }
    if (body.category !== undefined) data.category = body.category.trim();
    if (body.unit !== undefined) data.unit = body.unit.trim();
    if (body.supplier !== undefined) data.supplier = body.supplier.trim();
    if (body.priceSEK !== undefined) {
      if (typeof body.priceSEK !== "number" || body.priceSEK < 0) {
        return NextResponse.json({ error: "Ange ett giltigt pris." }, { status: 400 });
      }
      data.priceSEK = Math.round(body.priceSEK);
    }

    const priceChanged = data.priceSEK !== undefined && data.priceSEK !== existing.priceSEK;
    const supplierChanged = data.supplier !== undefined && data.supplier !== existing.supplier;

    const material = await prisma.materialBankItem.update({
      where: { id },
      data: {
        ...data,
        ...((priceChanged || supplierChanged) && {
          history: { create: { priceSEK: existing.priceSEK, supplier: existing.supplier } },
        }),
      },
      include: { history: { orderBy: { recordedAt: "desc" } } },
    });

    return NextResponse.json({ material });
  } catch (err) {
    console.error("PATCH /api/materials/[id] error", err);
    return NextResponse.json({ error: "Materialet kunde inte uppdateras." }, { status: 503 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.materialBankItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/materials/[id] error", err);
    return NextResponse.json({ error: "Materialet kunde inte tas bort." }, { status: 503 });
  }
}
