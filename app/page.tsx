"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Check,
  Sparkles,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { CategoryAccordion } from "@/components/home/category-accordion";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildCart, buildWeeklyPlan, CATALOG, STORES } from "@/lib/cart-engine";
import { APOTEK_ITEM_IDS, generateApotekCatalog } from "@/lib/cart-engine/apotek-catalog";
import { AUTO_ITEM_IDS, generateAutoCatalog } from "@/lib/cart-engine/auto-catalog";
import { generateElectronicsCatalog, tvItemId } from "@/lib/cart-engine/electronics-catalog";
import { DECK_ITEM_IDS, generateDeckMaterialsCatalog } from "@/lib/cart-engine/materials-catalog";
import { ALL_PET_ITEM_IDS, CAT_ITEM_IDS, DOG_ITEM_IDS, generatePetCatalog } from "@/lib/cart-engine/pet-catalog";
import type { CatalogItem } from "@/lib/cart-engine/catalog";
import {
  buildRecommendationSummary,
  buildShoppingRoute,
  computeFulfillmentOptions,
  type RecommendationSummary,
} from "@/lib/decision-engine";
import { interpretHomeQuery, type HomeIntent } from "@/lib/home-intent";
import { EASE } from "@/lib/motion";
import {
  ensureState,
  recordList,
  startApotekProject,
  startAutoProject,
  startDeckProject,
  startElectronicsProject,
  startPetProject,
} from "@/lib/storage";
import { DEFAULT_PROFILE, type CartResult, type ProjectCategory, type UserProfile } from "@/lib/types";
import { formatSEK, todayKey } from "@/lib/utils";

type Stage = "idle" | "scanning" | "result";

/** Free-text/chip defaults when the query doesn't say more than
 *  "ny tv", "apotek", or "bilservice" — /projects/electronics,
 *  /projects/pharmacy, and /projects/auto let you refine the selection
 *  before checkout. */
const DEFAULT_ELECTRONICS_SIZE = 55 as const;
const DEFAULT_APOTEK_ITEMS = APOTEK_ITEM_IDS.slice(0, 3);
const DEFAULT_AUTO_ITEMS = AUTO_ITEM_IDS.slice(0, 2);

const SCAN_STEPS = [
  "Läser vad du behöver…",
  "Jämför butiker…",
  "Väger tid mot pengar…",
  "Klart.",
];
const SCAN_STEP_MS = 380;

function buildGreeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 5 ? "God natt" : hour < 10 ? "God morgon" : hour < 17 ? "God eftermiddag" : "God kväll";
  return name ? `${timeGreeting}, ${name}` : `${timeGreeting}!`;
}

type PlanResult = {
  items: string[];
  category: ProjectCategory;
  cart: CartResult;
  summary: RecommendationSummary;
};

function runIntent(intent: HomeIntent, profile: UserProfile, usualItems: string[]): PlanResult | null {
  let items: string[];
  let category: ProjectCategory;
  let catalog: CatalogItem[] | undefined;

  if (intent.kind === "week") {
    items = buildWeeklyPlan(todayKey()).map((p) => p.displayName);
    category = "grocery";
  } else if (intent.kind === "deck") {
    items = DECK_ITEM_IDS;
    category = "deck";
    catalog = generateDeckMaterialsCatalog(4, 3);
  } else if (intent.kind === "pet") {
    items =
      intent.hasDog && !intent.hasCat
        ? DOG_ITEM_IDS
        : intent.hasCat && !intent.hasDog
          ? CAT_ITEM_IDS
          : ALL_PET_ITEM_IDS;
    category = "pet";
    catalog = generatePetCatalog(intent.hasDog, intent.hasCat);
  } else if (intent.kind === "electronics") {
    items = [tvItemId(DEFAULT_ELECTRONICS_SIZE), "hdmi-kabel"];
    category = "electronics";
    catalog = generateElectronicsCatalog();
  } else if (intent.kind === "pharmacy") {
    items = DEFAULT_APOTEK_ITEMS;
    category = "pharmacy";
    catalog = generateApotekCatalog();
  } else if (intent.kind === "auto") {
    items = DEFAULT_AUTO_ITEMS;
    category = "auto";
    catalog = generateAutoCatalog();
  } else if (intent.kind === "grocery") {
    if (intent.items.length === 0) return null;
    items = intent.items;
    category = "grocery";
  } else {
    return null;
  }

  const cart = buildCart(items, todayKey(), usualItems, catalog ?? CATALOG);
  const decision = computeFulfillmentOptions(cart, profile);
  const route = buildShoppingRoute(cart, profile);
  const summary = buildRecommendationSummary(cart, decision, route);
  return { items, category, cart, summary };
}

export default function HomePage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [usualItems, setUsualItems] = useState<string[]>([]);
  const [scanIndex, setScanIndex] = useState(0);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [unsupportedLabel, setUnsupportedLabel] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const pendingIntent = useRef<HomeIntent | null>(null);

  useEffect(() => {
    const state = ensureState();
    setProfile(state.profile);
    setUsualItems(state.usualItems);
  }, []);

  const greeting = useMemo(() => buildGreeting(profile.name ?? ""), [profile.name]);

  useEffect(() => {
    if (stage !== "scanning") return;
    if (scanIndex >= SCAN_STEPS.length - 1) {
      const timeout = setTimeout(() => {
        const intent = pendingIntent.current;
        const computed = intent ? runIntent(intent, profile, usualItems) : null;
        if (!computed) {
          setStage("idle");
          return;
        }
        setResult(computed);
        setStage("result");
      }, SCAN_STEP_MS);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setScanIndex((i) => i + 1), SCAN_STEP_MS);
    return () => clearTimeout(timeout);
  }, [stage, scanIndex, profile, usualItems]);

  const submit = (raw: string) => {
    const intent = interpretHomeQuery(raw);
    if (intent.kind === "unsupported") {
      setUnsupportedLabel(intent.label);
      return;
    }
    if (intent.kind === "grocery" && intent.items.length === 0) return;
    setUnsupportedLabel(null);
    pendingIntent.current = intent;
    setShowAlternatives(false);
    setScanIndex(0);
    setStage("scanning");
  };

  const handleViewFullPlan = () => {
    if (!result) return;
    if (result.category === "deck") {
      startDeckProject(4, 3);
    } else if (result.category === "pet") {
      const intent = pendingIntent.current;
      const hasDog = intent?.kind === "pet" ? intent.hasDog : true;
      const hasCat = intent?.kind === "pet" ? intent.hasCat : false;
      startPetProject(hasDog, hasCat);
    } else if (result.category === "electronics") {
      startElectronicsProject(DEFAULT_ELECTRONICS_SIZE, false, false);
    } else if (result.category === "pharmacy") {
      startApotekProject(DEFAULT_APOTEK_ITEMS);
    } else if (result.category === "auto") {
      startAutoProject(DEFAULT_AUTO_ITEMS);
    } else {
      recordList(result.items);
    }
    router.push("/cart");
  };

  const reset = () => {
    setStage("idle");
    setResult(null);
    setQuery("");
    setUnsupportedLabel(null);
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-5 py-5 sm:px-8 sm:py-7">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-lg font-semibold tracking-tight sm:text-xl">{greeting}</p>
            <p className="text-sm text-ink-muted">Redo att göra det smartaste köpet idag?</p>
          </div>
          <Link
            href="/profile"
            aria-label="Min profil"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2/50 text-ink-muted transition-colors hover:text-ink"
          >
            <UserCog className="size-4" aria-hidden="true" />
          </Link>
        </motion.div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="glass rounded-2xl p-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit(query);
                    }}
                    placeholder="Vad behöver du idag?"
                    autoFocus
                    className="w-full bg-transparent px-3 py-3 text-lg text-ink placeholder:text-ink-muted focus:outline-none sm:text-xl"
                  />
                </div>

                {unsupportedLabel && (
                  <p className="mt-2 text-sm text-warning">
                    {unsupportedLabel} är inte byggt ännu — "Kommer snart" på{" "}
                    <Link href="/projects" className="underline">
                      Alla projekt
                    </Link>
                    .
                  </p>
                )}

                <Button
                  size="lg"
                  className="mt-3 w-full"
                  onClick={() => submit(query)}
                  disabled={!query.trim()}
                >
                  <Brain />
                  Planera åt mig
                </Button>

                <CategoryAccordion onQuery={submit} />
              </motion.div>
            )}

            {stage === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-10 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: EASE }}
                  className="flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-glow-sm"
                >
                  <Brain className="size-6" />
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={scanIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="text-sm font-medium text-ink-secondary"
                  >
                    {SCAN_STEPS[scanIndex]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            )}

            {stage === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <Card className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Brain className="size-3.5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      AI-rekommendation
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">Jag analyserade alla alternativ.</p>

                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
                        Rekommenderat
                      </p>
                      <p className="truncate text-lg font-bold text-ink sm:text-xl">
                        {result.summary.storeLabel}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
                        Totalt
                      </p>
                      <p className="font-mono text-xl font-bold text-ink sm:text-2xl">
                        {formatSEK(result.summary.totalSEK)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-border bg-surface-2/40 p-2.5 text-center">
                    <div>
                      <p className="font-mono text-sm font-bold text-success">
                        {result.summary.savingsSEK} kr
                      </p>
                      <p className="text-[10px] text-ink-muted">Spara</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold text-ink">{result.summary.timeMin} min</p>
                      <p className="text-[10px] text-ink-muted">Tid</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold text-ink">{result.summary.stopCount}</p>
                      <p className="text-[10px] text-ink-muted">Butiker</p>
                    </div>
                    <div>
                      <p className="truncate font-mono text-sm font-bold text-ink">
                        {result.summary.fulfillmentLabel}
                      </p>
                      <p className="text-[10px] text-ink-muted">Metod</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {result.summary.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-ink-secondary">
                        <Check className="mt-0.5 size-3 shrink-0 text-success" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  <Button size="lg" className="w-full" onClick={handleViewFullPlan}>
                    Visa fullständig plan
                    <ArrowRight />
                  </Button>

                  <button
                    type="button"
                    onClick={() => setShowAlternatives((v) => !v)}
                    className="text-xs font-medium text-ink-muted underline hover:text-ink"
                  >
                    {showAlternatives ? "Dölj alternativ" : "Visa alternativ"}
                  </button>

                  {showAlternatives && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex flex-col gap-1.5 overflow-hidden border-t border-border pt-2"
                    >
                      {result.cart.checkoutOptions.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between text-xs text-ink-secondary"
                        >
                          <span>
                            {option.label} ·{" "}
                            {option.storeIds.map((id) => STORES[id].name).join(", ")}
                          </span>
                          <span className="font-mono">{option.totalSEK} kr</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </Card>

                <button
                  type="button"
                  onClick={reset}
                  className="mx-auto mt-3 flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
                >
                  <Sparkles className="size-3" />
                  Ny sökning
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
