import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type CustomerInput = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  ssn?: string;
  propertyId?: string;
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: CustomerInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const data: Record<string, string> = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Namn krävs." }, { status: 400 });
    data.name = name;
  }
  if (body.address !== undefined) data.address = body.address.trim();
  if (body.phone !== undefined) data.phone = body.phone.trim();
  if (body.email !== undefined) data.email = body.email.trim();
  if (body.ssn !== undefined) data.ssn = body.ssn.trim();
  if (body.propertyId !== undefined) data.propertyId = body.propertyId.trim();

  try {
    const customer = await prisma.customer.update({ where: { id }, data });
    return NextResponse.json({ customer });
  } catch (err) {
    console.error("PATCH /api/customers/[id] error", err);
    return NextResponse.json({ error: "Kunden kunde inte uppdateras." }, { status: 503 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/customers/[id] error", err);
    return NextResponse.json({ error: "Kunden kunde inte tas bort." }, { status: 503 });
  }
}
