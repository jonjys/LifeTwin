import { NextResponse } from "next/server";
import { getOrCreateDefaultCompany, prisma } from "@/lib/db";

export const runtime = "nodejs";

type CustomerInput = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  ssn?: string;
  propertyId?: string;
};

export async function GET() {
  try {
    const company = await getOrCreateDefaultCompany();
    const customers = await prisma.customer.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ customers });
  } catch (err) {
    console.error("GET /api/customers error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  let body: CustomerInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Namn krävs." }, { status: 400 });
  }

  try {
    const company = await getOrCreateDefaultCompany();
    const customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        name,
        address: body.address?.trim() ?? "",
        phone: body.phone?.trim() ?? "",
        email: body.email?.trim() ?? "",
        ssn: body.ssn?.trim() ?? "",
        propertyId: body.propertyId?.trim() ?? "",
      },
    });
    return NextResponse.json({ customer }, { status: 201 });
  } catch (err) {
    console.error("POST /api/customers error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
}
