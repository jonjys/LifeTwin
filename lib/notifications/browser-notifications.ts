import type { SmartNotification } from "@/lib/types";

const NOTIFIED_KEY_PREFIX = "smartcart.notified.";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/** "unsupported" when the browser has no Notification API at all —
 *  distinct from "denied", which means the user actively said no. */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/** Must be called from a real user gesture (a click) — most browsers
 *  ignore or auto-deny a permission prompt fired on page load. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  return Notification.requestPermission();
}

async function displayNotification(title: string, body: string, tag: string): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(title, { body, tag, icon: "/icon-512", badge: "/icon" });
      return;
    }
  }
  new Notification(title, { body, tag });
}

/**
 * Fires one real OS notification per not-yet-seen SmartNotification for
 * today, deduped in localStorage so reopening /cart repeatedly doesn't
 * re-fire the same day's notices. This is genuinely the browser
 * Notification API, not a fake in-app toast — but it's foreground/
 * loaded-tab only: there's no push backend here to wake a closed tab,
 * the same honest limit lib/cart-engine/notifications.ts already
 * documents for the in-app feed this sits behind.
 */
export function notifyNewSmartNotifications(notifications: SmartNotification[], dateKey: string): void {
  if (typeof window === "undefined" || getNotificationPermission() !== "granted") return;

  const key = `${NOTIFIED_KEY_PREFIX}${dateKey}`;
  let seen: string[] = [];
  try {
    seen = JSON.parse(window.localStorage.getItem(key) ?? "[]");
  } catch {
    seen = [];
  }

  const fresh = notifications.filter((n) => !seen.includes(n.id));
  if (fresh.length === 0) return;

  for (const notification of fresh) {
    displayNotification("Karma", notification.text, notification.id);
  }
  window.localStorage.setItem(key, JSON.stringify([...seen, ...fresh.map((n) => n.id)]));
}
