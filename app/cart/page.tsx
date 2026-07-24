"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { OptimizedCart } from "@/components/cart/optimized-cart";
import { DecisionCard } from "@/components/cart/decision-card";
import { PurchasePlanCard } from "@/components/cart/purchase-plan-card";
import { LiveMapCard } from "@/components/cart/live-map-card";
import { ShoppingRouteCard } from "@/components/cart/shopping-route";
import { ImpactDashboard } from "@/components/cart/impact-dashboard";
import { AutoPurchase } from "@/components/cart/auto-purchase";
import { MatsmartDeals } from "@/components/cart/matsmart-deals";
import { NotificationsFeed } from "@/components/cart/notifications-feed";
import { ComingSoon } from "@/components/cart/coming-soon";
import { useSmartCart } from "@/hooks/use-smart-cart";
import { fadeUp } from "@/lib/motion";
import type { FulfillmentId } from "@/lib/types";

export default function CartPage() {
  const router = useRouter();
  const {
    state,
    cart,
    decision,
    route,
    purchasePlanText,
    matsmartDeals,
    loading,
    impact,
    justOrdered,
    checkout,
    quickBuyUsualItems,
    justQuickBought,
  } = useSmartCart();

  const [selectedFulfillmentId, setSelectedFulfillmentId] = useState<FulfillmentId | null>(null);

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
          Bygger din smarta plan…
        </motion.div>
      </main>
    );
  }

  const isGrocery = cart.domain === "grocery";

  const activeFulfillmentId = selectedFulfillmentId ?? decision.recommendedId;

  return (
    <main className="relative min-h-screen px-5 pb-16 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-6xl">
        <motion.header
          {...fadeUp(0)}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
              <span className="font-mono text-sm font-bold text-primary">AI</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">ProjektOS</span>
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
              href="/projects"
              className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-4" />
              Nytt projekt
            </Link>
          </div>
        </motion.header>

        <motion.section {...fadeUp(0.05)}>
          <OptimizedCart cart={cart} />
        </motion.section>

        {purchasePlanText && (
          <motion.section {...fadeUp(0.08)} className="mt-4 sm:mt-5">
            <PurchasePlanCard text={purchasePlanText} />
          </motion.section>
        )}

        <motion.section {...fadeUp(0.12)} className="mt-4 sm:mt-5">
          <DecisionCard
            decision={decision}
            ordered={justOrdered}
            savingsSEK={cart.totalSavingsSEK}
            onOrder={checkout}
            selectedId={activeFulfillmentId}
            onSelectedIdChange={setSelectedFulfillmentId}
          />
        </motion.section>

        <motion.section {...fadeUp(0.16)} className="mt-4 sm:mt-5">
          <LiveMapCard
            profile={state.profile}
            cart={cart}
            activeFulfillment={activeFulfillmentId}
          />
        </motion.section>

        {route && route.stops.length > 0 && (
          <motion.section {...fadeUp(0.2)} className="mt-4 sm:mt-5">
            <ShoppingRouteCard route={route} />
          </motion.section>
        )}

        <motion.section {...fadeUp(0.24)} className="mt-4 sm:mt-5">
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

        {isGrocery && (
          <>
            <motion.section {...fadeUp(0.28)} className="mt-4 grid gap-4 sm:mt-5 lg:grid-cols-2">
              <AutoPurchase
                usualItems={state.usualItems}
                onQuickBuy={quickBuyUsualItems}
                justBought={justQuickBought}
              />
              <MatsmartDeals deals={matsmartDeals} />
            </motion.section>

            <motion.section {...fadeUp(0.32)} className="mt-4 sm:mt-5">
              <NotificationsFeed notifications={cart.notifications} />
            </motion.section>

            <motion.section {...fadeUp(0.36)} className="mt-4 sm:mt-5">
              <ComingSoon />
            </motion.section>
          </>
        )}
      </div>
    </main>
  );
}
