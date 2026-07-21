"use client";

import { Sparkles } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

type InsightCardProps = {
  insight: string;
};

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <Card className="flex items-start gap-5 sm:items-center">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
        <Sparkles className="size-5 text-primary" />
      </div>
      <div>
        <CardTitle className="mb-1.5">AI Insight</CardTitle>
        <p className="text-balance text-lg font-medium leading-relaxed text-ink">
          {insight}
        </p>
      </div>
    </Card>
  );
}
