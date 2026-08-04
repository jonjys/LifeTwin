"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  Check,
  Clock,
  Quote,
  Receipt,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { fadeUp } from "@/lib/motion";

const TRUST_POINTS = ["ROT/RUT-stöd inbyggt", "Kopplad direkt mot din databas", "Inget kreditkort krävs"];

function AmbientGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/4 size-[600px] rounded-full bg-amber-500/[0.08] blur-[160px]" />
      <div className="absolute top-1/2 -right-40 size-[500px] rounded-full bg-amber-400/[0.06] blur-[160px]" />
      <div className="absolute bottom-0 left-1/3 size-[450px] rounded-full bg-orange-500/[0.05] blur-[160px]" />
    </div>
  );
}

function TopNav() {
  return (
    <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
          <Sparkles className="size-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">Karma</span>
      </div>
      <Link
        href="/"
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10"
      >
        Logga in
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 pb-16 pt-10 text-center sm:px-8 sm:pb-24 sm:pt-16">
      <motion.div
        {...fadeUp(0)}
        className="mb-6 flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-xs font-medium text-amber-200/90 sm:text-sm">
          AI-driven kalkylering för svenska hantverkare
        </span>
      </motion.div>

      <motion.h1
        {...fadeUp(0.08)}
        className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
      >
        Skapa vinnande offerter på <span className="text-amber-400">30 sekunder</span>
      </motion.h1>

      <motion.p {...fadeUp(0.16)} className="mt-6 max-w-2xl text-balance text-lg text-slate-400">
        Beskriv jobbet — text eller röst — och Karma räknar ut material, arbetstid, ROT-avdrag och pris. Spara
        timmarna du annars lägger på offerter i bilen efter jobbet, med alla materialpriser, kunder och offerter
        samlade på ett ställe.
      </motion.p>

      <motion.div {...fadeUp(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 text-base font-semibold text-slate-950 shadow-[0_0_40px_-8px_rgba(245,158,11,0.5)] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Testa Karma gratis
          <ArrowRight className="size-4" />
        </Link>
        <a
          href="mailto:hej@offertpro.se?subject=Boka%20demo%20av%20Karma"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 text-base font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/10"
        >
          Boka demo
        </a>
      </motion.div>

      <motion.div
        {...fadeUp(0.3)}
        className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500"
      >
        {TRUST_POINTS.map((point) => (
          <span key={point} className="flex items-center gap-1.5">
            <Check className="size-3.5 text-amber-500/80" />
            {point}
          </span>
        ))}
      </motion.div>
    </section>
  );
}

function AppPreview() {
  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 sm:px-8 sm:pb-28">
      <motion.div
        {...fadeUp(0.1)}
        className="overflow-hidden rounded-3xl border border-white/10 bg-[#101014] shadow-[0_40px_120px_-40px_rgba(245,158,11,0.25)]"
      >
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.02] px-4 py-3">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="ml-3 text-xs text-slate-500">karma.app/dashboard</span>
        </div>
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <div>
            <p className="text-sm font-semibold text-white">Dashboard</p>
            <p className="text-xs text-slate-500">Din digitala tvilling — allt om företaget, på ett ställe.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Receipt className="size-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wide">Aktiva offerter</span>
              </div>
              <span className="font-mono text-2xl font-bold text-white">12</span>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-1.5 text-slate-500">
                <TrendingUp className="size-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wide">Vinstprocent</span>
              </div>
              <span className="font-mono text-2xl font-bold text-emerald-400">68%</span>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="size-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wide">Sparad tid / vecka</span>
              </div>
              <span className="font-mono text-2xl font-bold text-amber-400">6h</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
            <Calculator className="size-4 shrink-0 text-amber-400" />
            <p className="text-xs text-slate-300 sm:text-sm">
              &quot;Måla villa 180 kvm åt Johan, inkl. ställning&quot; → material, arbetstid och pris klart.
            </p>
          </div>
        </div>
      </motion.div>
      <p className="mt-3 text-center text-xs text-slate-600">Illustrativ vy av produkten — inte live data.</p>
    </section>
  );
}

function QuoteBanner() {
  return (
    <section className="relative z-10 border-y border-white/10 bg-white/[0.02] px-6 py-16 sm:px-8 sm:py-20">
      <motion.div {...fadeUp(0)} className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Quote className="mb-6 size-8 text-amber-500/60" />
        {/* Placeholder testimonial — swap for a real customer quote once one exists. */}
        <p className="text-balance text-xl font-medium leading-relaxed text-white sm:text-2xl">
          &quot;Karma känns som en digital arbetsledare i fickan — den räknar ut offerten medan jag fortfarande
          står uppe på taket.&quot;
        </p>
        <p className="mt-6 text-sm text-slate-500">Hantverkare, bygg &amp; renovering</p>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 px-6 py-10 text-center text-xs text-slate-600 sm:px-8">
      © {new Date().getFullYear()} Karma — AI Operating System för hantverkare.
    </footer>
  );
}

export function LandingContent() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <AmbientGlow />
      <TopNav />
      <Hero />
      <AppPreview />
      <QuoteBanner />
      <Footer />
    </div>
  );
}
