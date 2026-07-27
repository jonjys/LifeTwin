"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bath,
  Car,
  Gift,
  Hammer,
  Heart,
  Palmtree,
  PawPrint,
  Pill,
  ShoppingCart,
  Sofa,
  Truck,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ProjectTile = {
  icon: LucideIcon;
  title: string;
  description: string;
} & ({ href: string } | { comingSoon: true });

const PROJECT_TILES: ProjectTile[] = [
  {
    icon: ShoppingCart,
    title: "Storhandla",
    description: "Skriv vad du behöver. AI bygger och optimerar matkassen över alla butiker.",
    href: "/build",
  },
  {
    icon: Hammer,
    title: "Bygga altan",
    description: "Ange mått. AI räknar ut virke, skruv och betong — och var du köper det billigast.",
    href: "/projects/deck",
  },
  {
    icon: Bath,
    title: "Renovera badrum",
    description: "Kakel, VVS, sanitetsporslin — jämfört och samordnat.",
    comingSoon: true,
  },
  {
    icon: Truck,
    title: "Flytta",
    description: "Kartonger, släp, flyttfirma och möbeltransport — allt optimerat tillsammans.",
    comingSoon: true,
  },
  {
    icon: Gift,
    title: "Jul",
    description: "Klappar, mat och dekorationer — planerat och köpt i god tid.",
    comingSoon: true,
  },
  {
    icon: Heart,
    title: "Bröllop",
    description: "Från lokal till blommor — ett projekt, en budget, ett beslut i taget.",
    comingSoon: true,
  },
  {
    icon: Palmtree,
    title: "Semester",
    description: "Boende, resa och packning — planerat som ett enda projekt.",
    comingSoon: true,
  },
  {
    icon: PawPrint,
    title: "Husdjur",
    description: "Billigaste hund- och kattmaten, jämfört över fyra djuraffärer.",
    href: "/projects/pet",
  },
  {
    icon: Tv,
    title: "Elektronik",
    description: "Välj TV-storlek. AI räknar ut väggfäste och HDMI-kabel — och var det är billigast.",
    href: "/projects/electronics",
  },
  {
    icon: Car,
    title: "Bilservice",
    description: "Olja, filter och bromsar jämfört över verkstäder.",
    comingSoon: true,
  },
  {
    icon: Pill,
    title: "Apotek",
    description: "Vardagens hälsobasics, jämförda över fyra apotek.",
    href: "/projects/pharmacy",
  },
  {
    icon: Sofa,
    title: "IKEA",
    description: "AI bygger hela kundvagnen från ett rum du beskriver.",
    comingSoon: true,
  },
];

export default function ProjectsPage() {
  return (
    <main className="relative min-h-screen px-5 pb-16 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-5xl">
        <motion.header {...fadeUp(0)} className="mb-6 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
            <span className="font-mono text-sm font-bold text-primary">AI</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">ProjektOS</span>
        </motion.header>

        <motion.div {...fadeUp(0.05)} className="mb-6">
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Flik 1 — Projekt
          </p>
          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">
            Vad ska du göra?
          </h1>
          <p className="mt-3 max-w-xl text-ink-secondary">
            Allt börjar med ett projekt. Samma AI bryter ner det, jämför butiker och
            fattar ett köpbeslut åt dig — oavsett om det är matkassen eller altanen.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2">
          {PROJECT_TILES.map((tile, i) => {
            const Icon = tile.icon;
            const clickable = "href" in tile;
            const card = (
              <Card
                className={cn(
                  "flex h-full flex-col gap-3 p-5 transition-all duration-200",
                  clickable
                    ? "cursor-pointer hover:border-primary/40 hover:shadow-glow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    : "border-dashed opacity-70"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-2 text-ink-secondary">
                    <Icon className="size-5" />
                  </div>
                  {!clickable && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                      Kommer snart
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold normal-case tracking-normal text-ink">
                    {tile.title}
                  </CardTitle>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                    {tile.description}
                  </p>
                </div>
                {clickable && (
                  <span className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
                    Starta
                    <ArrowRight className="size-3.5" />
                  </span>
                )}
              </Card>
            );
            return (
              <motion.div
                key={tile.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.06 * i, ease: EASE }}
              >
                {clickable ? <Link href={tile.href}>{card}</Link> : card}
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
