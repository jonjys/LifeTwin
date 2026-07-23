"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { OptimizedCart } from "@/components/cart/optimized-cart";
import { DecisionCard } from "@/components/cart/decision-card";
import { ShoppingRouteCard } from "@/components/cart/shopping-route";
import { ImpactDashboard } from "@/components/cart/impact-dashboard";
import { AutoPurchase } from "@/components/cart/auto-purchase";
import { MatsmartDeals } from "@/components/cart/matsmart-deals";
import { NotificationsFeed } from "@/components/cart/notifications-feed";
import { ComingSoon } from "@/components/cart/coming-soon";
import { useSmartCart } from "@/hooks/use-smart-cart";
import { fadeUp } from "@/lib/motion";

export default function CartPage() {
  const router = useRouter();
  const {
    state,
    cart,
    decision,
    route,
    matsmartDeals,
    loading,
    impact,
    justOrdered,
    checkout,
    quickBuyUsualItems,
    justQuickBought,
  } = useSmartCart();

  useEffect(() => {
    if (!loading && !cart) router.replace("/build");
  }, [loading, cart, router]);

  if (loading || !state || !cart || !decision) {
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
          <div className="flex items-center gap-5">
            <Link
              href="/profile"
              className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <UserCog className="size-4" />
              Min profil
            </Link>
            <Link
              href="/build"
              className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-4" />
              Ny lista
            </Link>
          </div>
        </motion.header>

        <motion.section {...fadeUp(0.05)}>
          <OptimizedCart cart={cart} />
        </motion.section>

        <motion.section {...fadeUp(0.12)} className="mt-6">
          <DecisionCard
            decision={decision}
            ordered={justOrdered}
            savingsSEK={cart.totalSavingsSEK}
            onOrder={checkout}
          />
        </motion.section>

        {route && route.stops.length > 0 && (
          <motion.section {...fadeUp(0.17)} className="mt-6">
            <ShoppingRouteCard route={route} />
          </motion.section>
        )}

        <motion.section {...fadeUp(0.22)} className="mt-6">
          <ImpactDashboard
            savingsMonth={impact.savingsMonth}
            savingsYear={impact.savingsYear}
            savingsTotal={impact.savingsTotal}
            timeSavedMin={impact.timeSavedMin}
            carTripsAvoided={impact.carTripsAvoided}
            caloriesWalked={impact.caloriesWalked}
            co2SavedGrams={impact.co2SavedGrams}
          />
        </motion.section>

        <motion.section {...fadeUp(0.27)} className="mt-6 grid gap-6 lg:grid-cols-2">
          <AutoPurchase
            usualItems={state.usualItems}
            onQuickBuy={quickBuyUsualItems}
            justBought={justQuickBought}
          />
          <MatsmartDeals deals={matsmartDeals} />
        </motion.section>

        <motion.section {...fadeUp(0.32)} className="mt-6">
          <NotificationsFeed notifications={cart.notifications} />
        </motion.section>

        <motion.section {...fadeUp(0.37)} className="mt-6">
          <ComingSoon />
        </motion.section>
      </div>
    </main>
  );
}
