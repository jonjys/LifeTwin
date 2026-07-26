"use client";

import { motion } from "framer-motion";
import { Compass, Home } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
      <AmbientBackground />

      <motion.div {...fadeUp(0)} className="w-full max-w-md">
        <Card className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-ink-secondary">
            <Compass className="size-6" />
          </div>
          <div>
            <CardTitle>404</CardTitle>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">Sidan finns inte</h1>
          </div>
          <p className="text-sm text-ink-muted">
            Vi hittade ingen sida på den här adressen. Kanske flyttades den, eller så skrevs länken fel.
          </p>
          <Link href="/">
            <Button className="mt-2">
              <Home className="size-4" />
              Till startsidan
            </Button>
          </Link>
        </Card>
      </motion.div>
    </main>
  );
}
