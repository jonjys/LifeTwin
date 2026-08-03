"use client";

import { useEffect, useState } from "react";
import type { MaterialBankPriceSource } from "@/lib/quote-engine/materialbank-pricing";

/** Fetches the company's materialbank once per page load, reduced to
 *  just what price substitution needs. Silently empty (calculators keep
 *  their simulated prices) if the database isn't connected — same
 *  honest-degradation posture as every other AI/database feature. */
export function useMaterialBankPrices(): MaterialBankPriceSource[] {
  const [bank, setBank] = useState<MaterialBankPriceSource[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/materials");
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data.materials) ? data.materials : [];
        setBank(items.map((m: { name: string; priceSEK: number }) => ({ name: m.name, priceSEK: m.priceSEK })));
      } catch {
        // Keep the empty bank — applyMaterialBankPricing is a no-op then.
      }
    })();
  }, []);

  return bank;
}
