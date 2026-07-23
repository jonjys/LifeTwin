"use client";

import { memo } from "react";
import { TrendingUp } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardTitle } from "@/components/ui/card";

type SavingsDashboardProps = {
  month: number;
  year: number;
  total: number;
};

function Stat({ label, value }: { label: string; value: number }) {
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

/** The number that makes people open the app: money saved, always visible. */
export const SavingsDashboard = memo(function SavingsDashboard({
  month,
  year,
  total,
}: SavingsDashboardProps) {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <CardTitle>Pengar sparade</CardTitle>
        <TrendingUp className="size-4 text-success" />
      </div>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Stat label="Denna månad" value={month} />
        <Stat label="I år" value={year} />
        <Stat label="Sedan appen installerades" value={total} />
      </div>
    </Card>
  );
});
