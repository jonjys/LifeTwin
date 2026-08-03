import { PrismaClient } from "@prisma/client";
import { DEFAULT_COMPANY_PROFILE } from "@/lib/types";

/** The usual Next.js dev-mode singleton — without it, hot reload spawns a
 *  fresh PrismaClient (and a fresh connection pool) on every file save. */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * There's no auth/multi-tenancy yet — every quote, customer, and material
 * bank item belongs to a single company row. This finds it (or creates it
 * on first use) so API routes never have to think about which company
 * they're writing to. Revisit once real accounts exist.
 */
export async function getOrCreateDefaultCompany() {
  const existing = await prisma.company.findFirst();
  if (existing) return existing;
  return prisma.company.create({ data: { name: DEFAULT_COMPANY_PROFILE.name || "Mitt företag" } });
}
