"use client";

import { memo } from "react";
import { Brain } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

type AiMemoryProps = {
  usualItems: string[];
};

/** What SmartCart has learned you always buy — never asked twice. */
export const AiMemory = memo(function AiMemory({ usualItems }: AiMemoryProps) {
  if (usualItems.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
          <Brain className="size-4" />
        </div>
        <div>
          <CardTitle>AI Memory</CardTitle>
          <p className="text-xs text-ink-muted">Den frågar aldrig igen.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {usualItems.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border bg-surface-2/60 px-3.5 py-1.5 text-sm capitalize text-ink-secondary"
          >
            {item}
          </span>
        ))}
      </div>
    </Card>
  );
});
