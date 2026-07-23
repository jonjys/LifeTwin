import { between, chance } from "@/lib/seeded";
import { CATALOG } from "@/lib/cart-engine/catalog";
import type { MatsmartDeal } from "@/lib/types";

const DEAL_CHANCE = 0.55;

/**
 * Matsmart sells surplus/near-date stock at steep, rotating discounts —
 * not an everyday price leader, but worth checking against what the user
 * actually buys regularly (their AI Memory), never their whole catalog.
 */
export function findMatsmartDeals(usualItems: string[], dateKey: string): MatsmartDeal[] {
  const deals: MatsmartDeal[] = [];

  for (const item of CATALOG) {
    const isUsual = usualItems.some((usual) =>
      item.keywords.some((keyword) => usual.includes(keyword))
    );
    if (!isUsual) continue;
    if (!chance(`${item.id}:${dateKey}:matsmart`, DEAL_CHANCE)) continue;

    const discountPct = Math.round(between(`${item.id}:${dateKey}:matsmart-disc`, 30, 65));
    const priceSEK = Math.round(item.basePriceSEK * (1 - discountPct / 100));
    deals.push({ catalogId: item.id, displayName: item.displayName, discountPct, priceSEK });
  }

  return deals.slice(0, 4);
}
