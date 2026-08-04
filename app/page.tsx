import { AlertTriangle, Briefcase, Percent, Send, TrendingUp, Wallet } from "lucide-react";
import { CommandBar } from "@/components/dashboard/command-bar";
import { FreemiumBadge } from "@/components/dashboard/freemium-badge";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Card, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { QuoteStatus } from "@prisma/client";

// KPIs are live Postgres queries — never statically cache this page.
export const dynamic = "force-dynamic";

type DashboardKpis = {
  connected: boolean;
  monthRevenueSEK: number;
  quotesCreatedThisMonth: number;
  quotesAwaitingReply: number;
  quotesAccepted: number;
  averageMarginPct: number;
  upcomingJobs: { id: string; jobTitle: string; customerName: string }[];
};

const EMPTY_KPIS: DashboardKpis = {
  connected: false,
  monthRevenueSEK: 0,
  quotesCreatedThisMonth: 0,
  quotesAwaitingReply: 0,
  quotesAccepted: 0,
  averageMarginPct: 0,
  upcomingJobs: [],
};

/** Every number here is a real Postgres query — there is no fake demo
 *  data. Until DATABASE_URL is set, this fails honestly instead of
 *  crashing the dashboard: connected=false, zeroed KPIs, a visible banner. */
async function loadDashboardKpis(): Promise<DashboardKpis> {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [accepted, createdThisMonth, awaitingReply, upcoming] = await Promise.all([
      prisma.quote.findMany({ where: { status: QuoteStatus.ACCEPTED }, include: { lineItems: true } }),
      prisma.quote.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.quote.count({ where: { status: QuoteStatus.SENT } }),
      prisma.quote.findMany({
        where: { status: QuoteStatus.ACCEPTED },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const acceptedThisMonth = accepted.filter((q) => q.createdAt >= monthStart);
    const monthRevenueSEK = acceptedThisMonth.reduce(
      (sum, q) => sum + q.lineItems.reduce((s, li) => s + li.qty * li.unitPriceSEK, 0),
      0
    );
    const margins = accepted.map((q) => q.materialMarkupPct);
    const averageMarginPct = margins.length > 0 ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length) : 0;

    return {
      connected: true,
      monthRevenueSEK,
      quotesCreatedThisMonth: createdThisMonth,
      quotesAwaitingReply: awaitingReply,
      quotesAccepted: accepted.length,
      averageMarginPct,
      upcomingJobs: upcoming.map((q) => ({ id: q.id, jobTitle: q.jobTitle, customerName: q.customer.name })),
    };
  } catch {
    return EMPTY_KPIS;
  }
}

function formatSEK(n: number): string {
  return `${n.toLocaleString("sv-SE")} kr`;
}

export default async function DashboardPage() {
  const kpis = await loadDashboardKpis();

  return (
    <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <div className="flex flex-col gap-3">
          <FreemiumBadge />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Skapa vinnande offerter på 30 sekunder — med röst
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted sm:text-base">
              Sluta lägga kvällarna på kalkylark. Samla materialpriser, kunder och offerter i ett blixtsnabbt
              arbetsflöde direkt i mobilen.
            </p>
          </div>
        </div>

        <CommandBar />

        {!kpis.connected && (
          <Card className="flex items-start gap-3 border-warning/30 bg-warning/[0.05]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-ink">Databasen är inte ansluten än</p>
              <p className="text-xs text-ink-muted">
                Lägg till <code className="rounded bg-white/5 px-1 py-0.5">DATABASE_URL</code> (Supabase, Neon eller
                Vercel Postgres) i projektets miljövariabler, kör sedan{" "}
                <code className="rounded bg-white/5 px-1 py-0.5">npx prisma migrate deploy</code>. Siffrorna nedan är
                riktiga frågor mot databasen — de visar 0 tills den finns.
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="flex flex-col gap-1.5 p-4">
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Wallet className="size-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Månadens omsättning</span>
            </div>
            <span className="font-mono text-xl font-bold text-ink">{formatSEK(kpis.monthRevenueSEK)}</span>
          </Card>
          <Card className="flex flex-col gap-1.5 p-4">
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Briefcase className="size-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Offerter denna månad</span>
            </div>
            <span className="font-mono text-xl font-bold text-ink">{kpis.quotesCreatedThisMonth}</span>
          </Card>
          <Card className="flex flex-col gap-1.5 p-4">
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Send className="size-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Väntar på svar</span>
            </div>
            <span className="font-mono text-xl font-bold text-ink">{kpis.quotesAwaitingReply}</span>
          </Card>
          <Card className="flex flex-col gap-1.5 p-4">
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Percent className="size-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Snittmarginal</span>
            </div>
            <span className="font-mono text-xl font-bold text-ink">{kpis.averageMarginPct}%</span>
          </Card>
        </div>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <CardTitle>Kommande jobb</CardTitle>
          </div>
          {kpis.upcomingJobs.length === 0 ? (
            <p className="text-sm text-ink-muted">
              {kpis.connected
                ? "Inga accepterade offerter än — de dyker upp här när en kund tackar ja."
                : "Ingen data att visa förrän databasen är ansluten."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {kpis.upcomingJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-2/40 px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-ink">{job.jobTitle}</span>
                  <span className="text-xs text-ink-muted">{job.customerName}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
