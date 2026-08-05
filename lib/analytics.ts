// lib/analytics.ts
/**
 * A provider-agnostic event tracker, not an analytics SDK — the brief asks
 * to "prepare" for Google Analytics, Plausible, or PostHog without picking
 * one, and none of those accounts/keys exist yet. So track() never sends
 * data anywhere on its own: it forwards to whichever provider's script the
 * page owner has actually loaded (Plausible's `window.plausible`, GA's
 * `window.gtag`, or PostHog's `window.posthog`), detected at call time.
 * With none loaded — the default today — every call is a silent no-op.
 * Wiring up a real provider later is just adding its loader script (e.g.
 * via a NEXT_PUBLIC_PLAUSIBLE_DOMAIN-gated <Script> in app/layout.tsx);
 * every track() call site in the app already stays the same.
 */

type AnalyticsProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsProps }) => void;
    gtag?: (command: "event", event: string, params?: AnalyticsProps) => void;
    posthog?: { capture: (event: string, props?: AnalyticsProps) => void };
  }
}

export function track(event: string, props?: AnalyticsProps) {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
    window.gtag?.("event", event, props);
    window.posthog?.capture(event, props);
  } catch {
    // A misbehaving analytics script should never break the app it's measuring.
  }
}
