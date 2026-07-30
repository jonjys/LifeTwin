"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Brush, Car, Hammer, Layers, PawPrint, Pill, Receipt, ShoppingCart, Truck, Tv, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Card, CardTitle } from "@/components/ui/card";
import { fadeUp, EASE } from "@/lib/motion";
import { ensureState } from "@/lib/storage";
import type { FulfillmentId, OrderRecord, ProjectCategory } from "@/lib/types";
import { formatSEK } from "@/lib/utils";

const CATEGORY_META: Record<ProjectCategory, { label: string; icon: LucideIcon }> = {
  grocery: { label: "Storhandla", icon: ShoppingCart },
  deck: { label: "Bygga altan", icon: Hammer },
  pet: { label: "Husdjur", icon: PawPrint },
  electronics: { label: "Elektronik", icon: Tv },
  pharmacy: { label: "Apotek", icon: Pill },
  auto: { label: "Bilservice", icon: Car },
  wall: { label: "Innervägg", icon: Brush },
  floor: { label: "Golv", icon: Layers },
};

const FULFILLMENT_LABEL: Record<FulfillmentId, string> = {
  pickup: "Hämta själv",
  delivery: "Hemleverans",
  walk: "Promenera",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

function OrderRow({ order, index }: { order: OrderRecord; index: number }) {
  const meta = CATEGORY_META[order.category ?? "grocery"];
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04 * index, ease: EASE }}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-ink-secondary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">{meta.label}</span>
          <span className="text-xs text-ink-muted">{formatDate(order.date)}</span>
        </div>
        <p className="text-xs text-ink-muted">
          {order.fulfillmentId ? FULFILLMENT_LABEL[order.fulfillmentId] : "—"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-sm font-semibold text-ink">{formatSEK(order.totalSEK)}</p>
        {order.savingsSEK > 0 && (
          <p className="text-xs font-medium text-success">-{formatSEK(order.savingsSEK)}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);

  useEffect(() => {
    setOrders([...ensureState().orders].reverse());
  }, []);

  return (
    <main className="relative min-h-screen px-5 pb-16 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-2xl">
        <motion.header {...fadeUp(0)} className="mb-5 flex items-center justify-between">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Tillbaka
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Mina inköp</h1>
          <div className="w-16" />
        </motion.header>

        <motion.div {...fadeUp(0.05)}>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              <CardTitle>Historik</CardTitle>
            </div>

            {orders === null ? (
              <p className="text-sm text-ink-muted">Laddar…</p>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Truck className="size-6 text-ink-muted" />
                <p className="text-sm text-ink-muted">Inga inköp än — dina köp dyker upp här.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {orders.map((order, i) => (
                  <OrderRow key={`${order.date}-${i}`} order={order} index={i} />
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
