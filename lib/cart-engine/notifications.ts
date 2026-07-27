import { between, pick } from "@/lib/seeded";
import type { SmartNotification } from "@/lib/types";

const PRICE_DROP_ITEMS = ["vattenmelon", "avokado", "köttfärs", "lax"] as const;
const WAIT_ITEMS = ["kaffe", "chips", "pasta"] as const;
const STORE_NAMES = ["Willys", "ICA", "Coop", "Lidl", "Hemköp"] as const;

/**
 * A small feed of "real money" push-style notices — deterministic per
 * day, not spam. `NotificationsFeed` (components/cart/notifications-feed.tsx)
 * can mirror these as real OS notifications via the browser Notification
 * API, but only while the tab is loaded — there's no push backend here
 * to wake a closed one.
 */
export function generateNotifications(usualItems: string[], dateKey: string): SmartNotification[] {
  const notifications: SmartNotification[] = [];

  const dropItem = pick(`${dateKey}:drop-item`, PRICE_DROP_ITEMS);
  const dropPct = Math.round(between(`${dateKey}:drop-pct`, 25, 45));
  const dropStore = pick(`${dateKey}:drop-store`, STORE_NAMES);
  notifications.push({
    id: "price-drop",
    kind: "price-drop",
    text: `${dropStore} sänkte precis priset på ${dropItem} med ${dropPct}%.`,
  });

  const waitItem = pick(`${dateKey}:wait-item`, WAIT_ITEMS);
  const waitStore = pick(`${dateKey}:wait-store`, STORE_NAMES);
  notifications.push({
    id: "wait",
    kind: "wait-recommendation",
    text: `Köp inte ${waitItem} idag. ${waitStore} börjar kampanj imorgon.`,
  });

  const waitSavings = Math.round(between(`${dateKey}:wait-savings`, 90, 220));
  notifications.push({
    id: "wait-savings",
    kind: "wait-recommendation",
    text: `Du kan spara ${waitSavings} kr om du väntar till fredag.`,
  });

  if (usualItems.length > 0) {
    const cartSavings = Math.round(between(`${dateKey}:usual-cart`, 120, 420));
    notifications.push({
      id: "usual-cart",
      kind: "usual-cart-cheaper",
      text: `Din vanliga matkasse är ${cartSavings} kr billigare idag.`,
    });
  }

  return notifications;
}
