"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  Beef,
  CalendarRange,
  ChefHat,
  ChevronDown,
  Croissant,
  CupSoda,
  Mic,
  Package,
  Plus,
  Refrigerator,
  Snowflake,
  Sparkles,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { GROCERY_CATEGORIES, groceryItemsByCategory } from "@/lib/cart-engine";
import { EASE } from "@/lib/motion";
import { loadState, recordList } from "@/lib/storage";
import { cn } from "@/lib/utils";

const QUICK_ADD = [
  "mjölk",
  "köttfärs",
  "tacos",
  "kaffe",
  "bananer",
  "vattenmelon",
  "chips",
] as const;

const CATEGORY_OPTIONS = ["Snabbval", ...GROCERY_CATEGORIES] as const;
type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

const CATEGORY_ICON: Record<CategoryOption, LucideIcon> = {
  Snabbval: Sparkles,
  Kylvaror: Refrigerator,
  Frys: Snowflake,
  Skafferi: Package,
  "Frukt & Grönt": Apple,
  "Kött & Fisk": Beef,
  "Bröd & Bageri": Croissant,
  "Dryck & Snacks": CupSoda,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionLike = any;

export default function BuildListPage() {
  const router = useRouter();
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [usualItems, setUsualItems] = useState<string[]>([]);
  const [category, setCategory] = useState<CategoryOption>("Snabbval");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike>(null);

  useEffect(() => {
    setUsualItems(loadState()?.usualItems ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setVoiceSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const byCategory = useMemo(() => groceryItemsByCategory(), []);
  const categoryItemNames = useMemo(
    () => (category === "Snabbval" ? [...QUICK_ADD] : byCategory[category].map((i) => i.displayName)),
    [category, byCategory]
  );

  const addItem = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setItems((prev) => (prev.some((i) => i.toLowerCase() === value.toLowerCase()) ? prev : [...prev, value]));
    setDraft("");
  };

  const removeItem = (value: string) => {
    setItems((prev) => prev.filter((i) => i !== value));
  };

  const handleSubmit = () => {
    recordList(items);
    router.push("/cart");
  };

  const toggleListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition: SpeechRecognitionLike = new SpeechRecognitionCtor();
    recognition.lang = "sv-SE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript;
      if (transcript) addItem(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const availableQuickAdd = categoryItemNames.filter(
    (q) => !items.some((i) => i.toLowerCase() === q.toLowerCase())
  );
  const availableUsual = usualItems.filter(
    (u) => !items.some((i) => i.toLowerCase() === u) && !QUICK_ADD.includes(u as (typeof QUICK_ADD)[number])
  );

  const CategoryIcon = CATEGORY_ICON[category];

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-6 py-10 sm:py-14">
      <AmbientBackground />

      <Link
        href="/projects"
        className="absolute left-6 top-6 z-10 flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Alla projekt
      </Link>

      <Link
        href="/profile"
        className="absolute right-6 top-6 z-10 flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <UserCog className="size-4" />
        Min profil
      </Link>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="w-full text-center"
        >
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Jag ska storhandla
          </p>
          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">
            Vad behöver du?
          </h1>
          <p className="mt-3 text-ink-secondary">
            Skriv en vara i taget. ProjektOS bygger och optimerar listan åt dig.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            <Link
              href="/build/week"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
            >
              <CalendarRange className="size-3.5" />
              Eller låt AI planera en billig vecka åt dig
            </Link>
            <Link
              href="/build/meals"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
            >
              <ChefHat className="size-3.5" />
              Eller planera veckans måltider
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="mt-6 w-full"
        >
          <div className="glass flex items-center gap-2 rounded-2xl p-2 pl-5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem(draft);
                }
              }}
              placeholder="t.ex. mjölk, köttfärs, tacos…"
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none"
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                aria-label="Lägg till med rösten"
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200",
                  listening
                    ? "border-danger/40 bg-danger/10 text-danger"
                    : "border-border text-ink-muted hover:border-white/20 hover:text-ink"
                )}
              >
                <motion.span
                  animate={listening ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 1, repeat: listening ? Infinity : 0, ease: EASE }}
                  className="flex"
                >
                  <Mic className="size-4" />
                </motion.span>
              </button>
            )}
            <Button
              size="default"
              variant={draft.trim() ? "primary" : "outline"}
              onClick={() => addItem(draft)}
              disabled={!draft.trim()}
            >
              <Plus />
              Lägg till
            </Button>
          </div>

          <div className="mt-4 min-h-[40px]">
            <AnimatePresence initial={false}>
              {items.length > 0 && (
                <motion.div
                  layout
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {items.map((item) => (
                    <motion.button
                      key={item}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      onClick={() => removeItem(item)}
                      className="group flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary"
                    >
                      {item}
                      <X className="size-3.5 text-primary/60 group-hover:text-primary" />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                Bläddra i kategori
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface-2/60 py-1.5 pl-3.5 pr-3 text-xs font-medium text-ink-secondary transition-colors hover:border-primary/30 hover:text-ink"
                >
                  <CategoryIcon className="size-3.5 text-primary" />
                  {category}
                  <ChevronDown
                    className={cn("size-3.5 transition-transform duration-200", categoryOpen && "rotate-180")}
                  />
                </button>

                <AnimatePresence>
                  {categoryOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setCategoryOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: EASE }}
                        className="glass-strong absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl p-1.5 shadow-card"
                      >
                        {CATEGORY_OPTIONS.map((c) => {
                          const Icon = CATEGORY_ICON[c];
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setCategory(c);
                                setCategoryOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150",
                                category === c
                                  ? "bg-primary/10 text-primary"
                                  : "text-ink-secondary hover:bg-white/5 hover:text-ink"
                              )}
                            >
                              <Icon className="size-4" />
                              {c}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {availableQuickAdd.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableQuickAdd.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addItem(suggestion)}
                    className={cn(
                      "rounded-full border border-border px-3.5 py-1.5 text-sm text-ink-secondary transition-colors duration-200 hover:border-white/20 hover:text-ink"
                    )}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Allt i den här kategorin är redan tillagt.</p>
            )}
          </div>

          {availableUsual.length > 0 && (
            <div className="mt-4">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                Dina vanliga varor
              </p>
              <div className="flex flex-wrap gap-2">
                {availableUsual.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addItem(suggestion)}
                    className="rounded-full border border-success/25 bg-success/[0.06] px-3.5 py-1.5 text-sm text-success transition-colors duration-200 hover:bg-success/10"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          className="mt-8"
        >
          <Button size="xl" disabled={items.length === 0} onClick={handleSubmit}>
            Bygg min smarta matkasse
            <ArrowRight />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
