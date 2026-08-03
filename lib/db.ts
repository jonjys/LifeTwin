import { PrismaClient } from "@prisma/client";

/** The usual Next.js dev-mode singleton — without it, hot reload spawns a
 *  fresh PrismaClient (and a fresh connection pool) on every file save. */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
