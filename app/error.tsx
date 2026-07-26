"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
      <AmbientBackground />

      <motion.div {...fadeUp(0)} className="w-full max-w-md">
        <Card className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-danger">
            <TriangleAlert className="size-6" />
          </div>
          <div>
            <CardTitle>Något gick fel</CardTitle>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">Ett oväntat fel uppstod</h1>
          </div>
          <p className="text-sm text-ink-muted">
            Det gick inte att visa den här sidan just nu. Försök igen, eller gå tillbaka till startsidan.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={() => reset()}>
              <RotateCcw className="size-4" />
              Försök igen
            </Button>
            <Link href="/">
              <Button>
                <Home className="size-4" />
                Till startsidan
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
