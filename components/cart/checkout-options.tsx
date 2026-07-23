"use client";

import { memo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, ShoppingBag, Store } from "lucide-react";
import { celebrate } from "@/components/shared/confetti";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { STORES } from "@/lib/cart-engine";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CheckoutOption, CheckoutOptionId } from "@/lib/types";

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: CheckoutOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const storeNames = option.storeIds.map((id) => STORES[id].name).join(", ");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-1 flex-col gap-4 rounded-2xl border p-5 text-left transition-all duration-200",
        selected
          ? "border-primary/50 bg-primary/[0.06] shadow-glow-sm"
          : "border-border bg-surface-2/50 hover:border-white/20"
      )}
    >
      {option.recommended && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#02150b]">
          Bäst värde
        </span>
      )}
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {option.label}
      </span>
      <span className="font-mono text-3xl font-bold tracking-tight text-ink">
        {option.totalSEK} kr
      </span>
      <div className="flex flex-col gap-1.5 text-sm text-ink-secondary">
        <span className="flex items-center gap-2">
          <Clock className="size-3.5 text-ink-muted" />
          Leverans {option.deliveryEtaMin} min
        </span>
        <span className="flex items-center gap-2">
          <Store className="size-3.5 text-ink-muted" />
          {option.storeIds.length === 1 ? storeNames : `${option.storeIds.length} butiker`}
        </span>
      </div>
      <div
        className={cn(
          "mt-1 flex size-6 items-center justify-center self-end rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </div>
    </button>
  );
}

type CheckoutOptionsProps = {
  options: CheckoutOption[];
  ordered: boolean;
  orderedOptionId: CheckoutOptionId | null;
  savingsSEK: number;
  onOrder: (optionId: CheckoutOptionId) => void;
};

export const CheckoutOptions = memo(function CheckoutOptions({
  options,
  ordered,
  orderedOptionId,
  savingsSEK,
  onOrder,
}: CheckoutOptionsProps) {
  const recommended = options.find((o) => o.recommended) ?? options[0];
  const [selectedId, setSelectedId] = useState<CheckoutOptionId>(recommended?.id ?? "cheapest");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleOrder = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      celebrate({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      });
    } else {
      celebrate();
    }
    onOrder(selectedId);
  };

  return (
    <Card className="flex flex-col gap-6">
      <CardTitle>Smart Checkout</CardTitle>

      <div className="flex flex-col gap-4 sm:flex-row">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={!ordered && selectedId === option.id}
            onSelect={() => !ordered && setSelectedId(option.id)}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {ordered ? (
          <motion.div
            key="ordered"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-success/25 bg-success/[0.06] p-6 text-center"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="size-5" strokeWidth={3} />
            </div>
            <p className="text-lg font-semibold text-ink">Beställning skickad.</p>
            <p className="text-sm text-ink-secondary">
              Du sparade{" "}
              <span className="font-semibold text-success">{savingsSEK} kr</span>{" "}
              på den här matkassen jämfört med att handla utan SmartCart.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="order-button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <Button ref={buttonRef} size="xl" className="w-full" onClick={handleOrder}>
              <ShoppingBag />
              Beställ
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});
