import type { LucideIcon } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Card, CardTitle } from "@/components/ui/card";

/**
 * Honest placeholder for a nav tab that exists in the information
 * architecture but isn't built yet — never a 404, never fake data.
 */
export function ComingSoonPage({ title, icon: Icon, note }: { title: string; icon: LucideIcon; note: string }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
      <AmbientBackground />
      <Card className="flex max-w-md flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-ink-secondary">
          <Icon className="size-6" />
        </div>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-ink-muted">{note}</p>
      </Card>
    </main>
  );
}
