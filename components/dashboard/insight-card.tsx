"use client";

import { memo } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

type InsightCardProps = {
  insight: string;
};

export const InsightCard = memo(function InsightCard({
  insight,
}: InsightCardProps) {
  return (
    <Card className="flex flex-col items-center gap-5 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 shadow-glow-sm">
        <Sparkles className="size-5 text-primary" />
      </div>
      <CardTitle>AI Insight</CardTitle>
      <p className="max-w-2xl text-balance text-xl font-medium leading-relaxed text-ink sm:text-2xl">
        {insight}
      </p>
    </Card>
  );
});
