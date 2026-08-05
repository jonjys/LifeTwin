// lib/analytics.ts
/**
 * A provider-agnostic event tracker, not an analytics SDK — the brief left
 * the choice among Google Analytics, Plausible, or PostHog open. Picked
 * Plausible: ~1KB, cookie-free, so it ships with no GDPR consent banner —
 * one less thing to build for a Swedish B2B product. app/layout.tsx loads
 * its script behind NEXT_PUBLIC_PLAUSIBLE_DOMAIN; unset that env var (the
 * state today, since no account exists yet) and every track() call below
 * is a silent no-op. track() still checks for GA's `window.gtag` and
 * PostHog's `window.posthog` too — costs nothing, and if either gets added
 * later every call site here keeps working unchanged.
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
