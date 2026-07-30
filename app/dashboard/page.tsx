"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Car,
  Hammer,
  Heart,
  History,
  Layers,
  ListChecks,
  PawPrint,
  Pill,
  Receipt,
  ShoppingCart,
  Sparkles,
  Tv,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { MatsmartDeals } from "@/components/cart/matsmart-deals";
import { Card, CardTitle } from "@/components/ui/card";
import { findMatsmartDeals } from "@/lib/cart-engine/matsmart";
import { generateNotifications } from "@/lib/cart-engine/notifications";
import { STORES } from "@/lib/cart-engine";
import { fadeUp } from "@/lib/motion";
import { ensureState, savingsSinceInstall, savingsThisMonth, savingsThisYear } from "@/lib/storage";
import type { OrderRecord, ProjectCategory, SmartCartState } from "@/lib/types";
import { formatSEK, todayKey } from "@/lib/utils";

const CATEGORY_META: Record<ProjectCategory, { label: string; icon: LucideIcon; href: string }> = {
  grocery: { label: "Storhandla", icon: ShoppingCart, href: "/build" },
  deck: { label: "Bygga altan", icon: Hammer, href: "/projects/deck" },
  wall: { label: "Innervägg", icon: Hammer, href: "/projects/wall" },
  floor: { label: "Golv", icon: Layers, href: "/projects/floor" },
  pet: { label: "Husdjur", icon: PawPrint, href: "/projects/pet" },
  electronics: { label: "Elektronik", icon: Tv, href: "/projects/electronics" },
  pharmacy: { label: "Apotek", icon: Pill, href: "/projects/pharmacy" },
  auto: { label: "Bilservice", icon: Car, href: "/projects/auto" },
};

type CategorySummary = {
  category: ProjectCategory;
  count: number;
  totalSavingsSEK: number;
  lastDate: string;
};

function summarizeByCategory(orders: OrderRecord[]): CategorySummary[] {
  const byCategory = new Map<ProjectCategory, CategorySummary>();
  for (const order of orders) {
    const category = order.category ?? "grocery";
    const existing = byCategory.get(category);
    if (existing) {
      existing.count += 1;
      existing.totalSavingsSEK += order.savingsSEK;
      if (order.date > existing.lastDate) existing.lastDate = order.date;
    } else {
      byCategory.set(category, { category, count: 1, totalSavingsSEK: order.savingsSEK, lastDate: order.date });
    }
  }
  return [...byCategory.values()].sort((a, b) => (a.lastDate < b.lastDate ? 1 : -1));
}

export default function DashboardPage() {
  const [state, setState] = useState<SmartCartState | null>(null);

  useEffect(() => {
    setState(ensureState());
  }, []);

  if (!state) {
    return (
      <main className="relative min-h-screen px-5 pb-16 pt-6 sm:px-8 sm:pt-8">
        <AmbientBackground />
        <p className="mx-auto max-w-2xl text-sm text-ink-muted">Laddar…</p>
      </main>
    );
  }

  const categorySummaries = summarizeByCategory(state.orders);
  const hasActiveProject = state.currentItems.length > 0;
  const activeMeta = CATEGORY_META[state.currentCategory];
  const notifications = generateNotifications(state.usualItems, todayKey());
  const matsmartDeals = findMatsmartDeals(state.usualItems, todayKey());
  const recentOrders = [...state.orders].reverse().slice(0, 3);

  return (
    <main className="relative min-h-screen px-5 pb-16 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-5xl">
        <motion.header {...fadeUp(0)} className="mb-6 flex items-center justify-between">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowRight className="size-4 rotate-180" />
            Min profil
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Nytt projekt
            <ArrowRight className="size-4" />
          </Link>
        </motion.header>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Pågående projekt */}
          <motion.div {...fadeUp(0.02)}>
            <Card className="flex h-full flex-col gap-3">
              <CardTitle>Pågående projekt</CardTitle>
              {hasActiveProject ? (
                <Link
                  href="/cart"
                  className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/[0.06] p-3.5 transition-colors hover:border-primary/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <activeMeta.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{activeMeta.label}</p>
                    <p className="text-xs text-ink-muted">{state.currentItems.length} varor redo för inköp</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-primary" />
                </Link>
              ) : (
                <p className="text-sm text-ink-muted">Inget projekt igång just nu.</p>
              )}
            </Card>
          </motion.div>

          {/* Sparade pengar */}
          <motion.div {...fadeUp(0.04)}>
            <Card className="flex h-full flex-col gap-3">
              <CardTitle>Sparade pengar</CardTitle>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-mono text-lg font-bold text-success">
                    {formatSEK(savingsThisMonth(state))}
                  </p>
                  <p className="text-[10px] text-ink-muted">Denna månad</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-success">
                    {formatSEK(savingsThisYear(state))}
                  </p>
                  <p className="text-[10px] text-ink-muted">I år</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-success">
                    {formatSEK(savingsSinceInstall(state))}
                  </p>
                  <p className="text-[10px] text-ink-muted">Totalt</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Mina projekt */}
          <motion.div {...fadeUp(0.06)}>
            <Card className="flex h-full flex-col gap-3">
              <div className="flex items-center gap-2">
                <ListChecks className="size-4 text-primary" />
                <CardTitle>Mina projekt</CardTitle>
              </div>
              {categorySummaries.length === 0 ? (
                <p className="text-sm text-ink-muted">Inga slutförda inköp än.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {categorySummaries.map((summary) => {
                    const meta = CATEGORY_META[summary.category];
                    return (
                      <Link
                        key={summary.category}
                        href={meta.href}
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-3.5 py-2.5 transition-colors hover:border-primary/40"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-ink-secondary">
                          <meta.icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">{meta.label}</p>
                          <p className="text-xs text-ink-muted">{summary.count} inköp</p>
                        </div>
                        <span className="shrink-0 font-mono text-xs font-semibold text-success">
                          -{formatSEK(summary.totalSavingsSEK)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Historik */}
          <motion.div {...fadeUp(0.08)}>
            <Card className="flex h-full flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  <CardTitle>Historik</CardTitle>
                </div>
                <Link href="/orders" className="text-xs font-medium text-primary hover:text-primary/80">
                  Visa alla
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-ink-muted">Inga inköp än.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentOrders.map((order, i) => {
                    const meta = CATEGORY_META[order.category ?? "grocery"];
                    return (
                      <div
                        key={`${order.date}-${i}`}
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-3.5 py-2.5"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-ink-secondary">
                          <meta.icon className="size-4" />
                        </div>
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{meta.label}</p>
                        <span className="shrink-0 font-mono text-sm text-ink-secondary">
                          {formatSEK(order.totalSEK)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Mina inköpslistor (AI Memory) */}
          <motion.div {...fadeUp(0.1)}>
            <Card className="flex h-full flex-col gap-3">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <CardTitle>Mina inköpslistor</CardTitle>
              </div>
              {state.usualItems.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  Handla samma vara två gånger så dyker den upp här som en vanlig vara.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {state.usualItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-surface-2/50 px-3 py-1 text-xs text-ink-secondary capitalize"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Favoriter (favoritbutiker) */}
          <motion.div {...fadeUp(0.12)}>
            <Card className="flex h-full flex-col gap-3">
              <div className="flex items-center gap-2">
                <Heart className="size-4 text-primary" />
                <CardTitle>Favoriter</CardTitle>
              </div>
              {state.profile.favoriteStores.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  Ingen favoritbutik vald än —{" "}
                  <Link href="/profile" className="underline">
                    välj dina favoriter
                  </Link>
                  .
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {state.profile.favoriteStores.map((storeId, i) => (
                    <span
                      key={storeId}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2/50 px-3 py-1 text-xs text-ink-secondary"
                    >
                      <Sparkles className="size-3 text-primary" />
                      #{i + 1} {STORES[storeId].name}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Prisbevakningar */}
          <motion.div {...fadeUp(0.14)} className="sm:col-span-2">
            <Card className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <CardTitle>Prisbevakningar</CardTitle>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-xl border border-border bg-surface-2/40 px-3.5 py-2.5 text-sm text-ink-secondary"
                  >
                    {notification.text}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Rekommendationer (Matsmart) */}
          {matsmartDeals.length > 0 && (
            <motion.div {...fadeUp(0.16)} className="sm:col-span-2">
              <MatsmartDeals deals={matsmartDeals} />
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
