import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { QuoteStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const quote = await prisma.quote.findUnique({ where: { id }, include: { customer: true, lineItems: true } });
    if (!quote) return NextResponse.json({ error: "Offerten hittades inte." }, { status: 404 });
    return NextResponse.json({ quote });
  } catch (err) {
    console.error("GET /api/quotes/[id] error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}

const STATUS_VALUES = Object.values(QuoteStatus);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  if (!body.status || !STATUS_VALUES.includes(body.status as QuoteStatus)) {
    return NextResponse.json({ error: "Ogiltig status." }, { status: 400 });
  }

  try {
    const quote = await prisma.quote.update({
      where: { id },
      data: { status: body.status as QuoteStatus },
      include: { customer: true, lineItems: true },
    });
    return NextResponse.json({ quote });
  } catch (err) {
    console.error("PATCH /api/quotes/[id] error", err);
    return NextResponse.json({ error: "Offerten kunde inte uppdateras." }, { status: 503 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.quote.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/quotes/[id] error", err);
    return NextResponse.json({ error: "Offerten kunde inte tas bort." }, { status: 503 });
  }
}
