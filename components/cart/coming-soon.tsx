"use client";

import { memo } from "react";
import { Camera, ChefHat, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

function ComingSoonTile({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 items-start gap-4 rounded-2xl border border-dashed border-border bg-surface-2/30 p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-ink-muted">
        <Icon className="size-4" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-ink">{title}</h4>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Kommer snart
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p>
      </div>
    </div>
  );
}

/** AI Pantry and AI Meal Planner — real product bets, teased not built. */
export const ComingSoon = memo(function ComingSoon() {
  return (
    <Card className="flex flex-col gap-4 sm:flex-row">
      <ComingSoonTile
        icon={Camera}
        title="AI Pantry"
        description="Fotografera kylskåpet. SmartCart ser vad du saknar och lägger bara till det."
      />
      <ComingSoonTile
        icon={ChefHat}
        title="AI Meal Planner"
        description="Skriv vad du vill äta den här veckan — recept, portioner och billigaste inköpslista på en gång."
      />
    </Card>
  );
});
