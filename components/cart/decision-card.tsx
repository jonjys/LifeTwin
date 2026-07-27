"use client";

import { memo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Car,
  Check,
  CloudRain,
  Flame,
  Footprints,
  Fuel,
  ShoppingBag,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { celebrate } from "@/components/shared/confetti";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DecisionResult, FulfillmentId, FulfillmentOption } from "@/lib/types";

const OPTION_ICON: Record<FulfillmentId, LucideIcon> = {
  pickup: Car,
  delivery: Truck,
  walk: Footprints,
};

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} tim` : `${h} tim ${m} min`;
}

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: FulfillmentOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = OPTION_ICON[option.id];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-1 flex-col gap-3 rounded-2xl border p-5 text-left transition-all duration-200",
        selected
          ? "border-primary/50 bg-primary/[0.06] shadow-glow-sm"
          : "border-border bg-surface-2/50 hover:border-white/20"
      )}
    >
      {option.recommended && (
        <span className="absolute -top-2.5 left-5 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
          <Brain className="size-2.5" />
          AI rekommenderar
        </span>
      )}

      <div className="flex items-center gap-2 text-ink-secondary">
        <Icon className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.12em]">
          {option.label}
        </span>
      </div>

      <span className="font-mono text-2xl font-bold tracking-tight text-ink">
        {option.totalSEK} kr
      </span>

      <div className="flex flex-col gap-1.5 text-sm text-ink-secondary">
        <span>{formatMinutes(option.timeMin)}</span>
        {option.id === "pickup" && (
          <>
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Fuel className="size-3" /> Bensin {option.gasSEK} kr
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Wrench className="size-3" /> Slitage {option.wearCostSEK} kr
            </span>
            {option.extraFeeSEK && (
              <span className="flex items-center gap-1.5 text-xs text-warning">
                <Truck className="size-3" /> {option.extraFeeLabel} {option.extraFeeSEK} kr
              </span>
            )}
          </>
        )}
        {option.id === "delivery" && (
          <span className="text-xs text-ink-muted">
            Leveransavgift {option.deliveryFeeSEK} kr
          </span>
        )}
        {option.id === "walk" && (
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Flame className="size-3" /> {option.calories} kcal · {option.steps.toLocaleString("sv-SE")} steg
          </span>
        )}
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

type DecisionCardProps = {
  decision: DecisionResult;
  ordered: boolean;
  savingsSEK: number;
  onOrder: (fulfillmentId: FulfillmentId) => void;
  /** Controlled so other UI (the live map) can react to the same selection. */
  selectedId: FulfillmentId;
  onSelectedIdChange: (id: FulfillmentId) => void;
};

/** Not a price table — a decision. The AI picks a winner and says why. */
export const DecisionCard = memo(function DecisionCard({
  decision,
  ordered,
  savingsSEK,
  onOrder,
  selectedId,
  onSelectedIdChange,
}: DecisionCardProps) {
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
      <CardTitle>AI Beslutsmotor</CardTitle>

      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.05] p-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Brain className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium leading-relaxed text-ink">
            {decision.recommendationText}
          </p>
          {decision.weatherNote && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
              <CloudRain className="size-3" />
              {decision.weatherNote}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        {decision.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={!ordered && selectedId === option.id}
            onSelect={() => !ordered && onSelectedIdChange(option.id)}
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
              <span className="font-semibold text-success">{savingsSEK} kr</span> på
              varorna, och AI valde det smartaste sättet att få hem dem.
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
              Köp
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});
