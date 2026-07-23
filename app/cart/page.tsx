"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { OptimizedCart } from "@/components/cart/optimized-cart";
import { CheckoutOptions } from "@/components/cart/checkout-options";
import { SavingsDashboard } from "@/components/cart/savings-dashboard";
import { AiMemory } from "@/components/cart/ai-memory";
import { NotificationsFeed } from "@/components/cart/notifications-feed";
import { ComingSoon } from "@/components/cart/coming-soon";
import { useSmartCart } from "@/hooks/use-smart-cart";
import { fadeUp } from "@/lib/motion";

export default function CartPage() {
  const router = useRouter();
  const { state, cart, loading, savings, justOrdered, orderedOptionId, checkout } =
    useSmartCart();

  useEffect(() => {
    if (!loading && !cart) router.replace("/build");
  }, [loading, cart, router]);

  if (loading || !state || !cart) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <AmbientBackground />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-sm tracking-wide text-ink-muted"
        >
          Bygger din smarta matkasse…
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-5 pb-24 pt-8 sm:px-8">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-6xl">
        <motion.header
          {...fadeUp(0)}
          className="mb-10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
              <span className="font-mono text-sm font-bold text-primary">AI</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">SmartCart</span>
          </div>
          <Link
            href="/build"
            className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Ny lista
          </Link>
        </motion.header>

        <motion.section {...fadeUp(0.05)}>
          <OptimizedCart cart={cart} />
        </motion.section>

        <motion.section {...fadeUp(0.12)} className="mt-6">
          <CheckoutOptions
            options={cart.checkoutOptions}
            ordered={justOrdered}
            orderedOptionId={orderedOptionId}
            savingsSEK={cart.totalSavingsSEK}
            onOrder={checkout}
          />
        </motion.section>

        <motion.section {...fadeUp(0.19)} className="mt-6">
          <SavingsDashboard month={savings.month} year={savings.year} total={savings.total} />
        </motion.section>

        <motion.section
          {...fadeUp(0.26)}
          className={
            state.usualItems.length > 0
              ? "mt-6 grid gap-6 lg:grid-cols-2"
              : "mt-6"
          }
        >
          {state.usualItems.length > 0 && <AiMemory usualItems={state.usualItems} />}
          <NotificationsFeed notifications={cart.notifications} />
        </motion.section>

        <motion.section {...fadeUp(0.33)} className="mt-6">
          <ComingSoon />
        </motion.section>
      </div>
    </main>
  );
}
