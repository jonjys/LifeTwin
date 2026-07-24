"use client";

import { memo } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

type PurchasePlanCardProps = {
  text: string;
};

/** Flik 4 — "Smartaste beslutet". Not billigast, not a list of twelve
 *  alternatives: one sentence naming exactly where to buy each thing and
 *  how to get it home, generated straight from the same engine output
 *  every project shares. */
export const PurchasePlanCard = memo(function PurchasePlanCard({ text }: PurchasePlanCardProps) {
  return (
    <Card className="flex items-start gap-4">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Sparkles className="size-4" />
      </div>
      <div>
        <CardTitle>Smartaste beslutet</CardTitle>
        <p className="mt-2 text-base font-medium leading-relaxed text-ink">{text}</p>
      </div>
    </Card>
  );
});
