// components/shared/share-button.tsx
"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { track } from "@/lib/analytics";
import { SHARE_TAGLINE, SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * "Dela OffertPro" — Web Share API where it's supported (opens the native
 * share sheet, e.g. straight to SMS/WhatsApp on mobile), falling back to
 * copying the link where it isn't (desktop Safari/Firefox, HTTP contexts).
 * Never a dead button: one of the two always does something.
 */
export function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    track("share_click");
    const payload = { title: SITE_NAME, text: SHARE_TAGLINE, url: SITE_URL };
    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch {
        // User cancelled the native share sheet — not an error to surface.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied too — nothing left to fall back to silently.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "flex items-center gap-1.5 rounded-xl border border-border bg-surface-2/50 px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-primary/40 hover:text-primary",
        className
      )}
    >
      {copied ? <Check className="size-4 shrink-0 text-success" /> : <Share2 className="size-4 shrink-0" />}
      {copied ? "Länk kopierad!" : "Dela OffertPro"}
    </button>
  );
}
