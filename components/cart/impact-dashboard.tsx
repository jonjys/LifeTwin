"use client";

import { memo } from "react";
import { Car, Clock, Flame, Leaf, TrendingUp, type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardTitle } from "@/components/ui/card";

type ImpactDashboardProps = {
  savingsMonth: number;
  savingsYear: number;
  savingsTotal: number;
  timeSavedMin: number;
  carTripsAvoided: number;
  caloriesWalked: number;
  co2SavedGrams: number;
};

function MoneyStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      <span className="font-mono text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        <AnimatedNumber value={value} suffix=" kr" />
      </span>
    </div>
  );
}

function ImpactStat({
  icon: Icon,
  label,
  value,
  format,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  format: (n: number) => string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="font-mono text-lg font-bold text-ink">
          <AnimatedNumber value={value} format={format} />
        </p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} tim` : `${h} tim ${m} min`;
}

function formatCo2(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams} g`;
}

/** Not just money — the whole point of an AI Commerce OS is fewer trips,
 *  less time spent deciding, and a smaller footprint along the way. */
export const ImpactDashboard = memo(function ImpactDashboard({
  savingsMonth,
  savingsYear,
  savingsTotal,
  timeSavedMin,
  carTripsAvoided,
  caloriesWalked,
  co2SavedGrams,
}: ImpactDashboardProps) {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <CardTitle>Pengar sparade</CardTitle>
        <TrendingUp className="size-4 text-success" />
      </div>
      <div className="flex flex-col gap-6 sm:flex-row">
        <MoneyStat label="Denna månad" value={savingsMonth} />
        <MoneyStat label="I år" value={savingsYear} />
        <MoneyStat label="Sedan appen installerades" value={savingsTotal} />
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-6 sm:grid-cols-4">
        <ImpactStat icon={Clock} label="Sparad tid" value={timeSavedMin} format={formatMinutes} />
        <ImpactStat
          icon={Car}
          label="Undvikna bilresor"
          value={carTripsAvoided}
          format={(n) => `${n}`}
        />
        <ImpactStat
          icon={Flame}
          label="Kalorier promenerade"
          value={caloriesWalked}
          format={(n) => `${n} kcal`}
        />
        <ImpactStat icon={Leaf} label="CO₂ sparad" value={co2SavedGrams} format={formatCo2} />
      </div>
    </Card>
  );
});
