"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { UpgradeModal } from "@/components/freemium/upgrade-modal";
import { useFreemium } from "@/lib/use-freemium";

/** Small, unobtrusive usage pill for the Dashboard hero — the app/page.tsx
 *  Server Component can't read localStorage itself, so this is a thin
 *  client island just for the freemium status. */
export function FreemiumBadge() {
  const freemium = useFreemium();
  const [showModal, setShowModal] = useState(false);

  if (freemium.isPro) {
    return (
      <span className="flex items-center gap-1.5 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Sparkles className="size-3.5" />
        OffertPro Pro
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 self-start rounded-full border border-border bg-surface-2/50 px-3 py-1 text-xs font-medium text-ink-secondary transition-colors hover:border-primary/40 hover:text-ink"
      >
        {freemium.quotesThisMonth} av {freemium.quotesThisMonth + freemium.quotesRemaining} gratis offerter använda
        <span className="text-primary">· Uppgradera</span>
      </button>
      <UpgradeModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
