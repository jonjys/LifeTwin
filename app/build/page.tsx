"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarRange, ChevronDown, Plus, UserCog, X } from "lucide-react";
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

export default function BuildListPage() {
  const router = useRouter();
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [usualItems, setUsualItems] = useState<string[]>([]);
  const [category, setCategory] = useState<CategoryOption>("Snabbval");

  useEffect(() => {
    setUsualItems(loadState()?.usualItems ?? []);
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

  const availableQuickAdd = categoryItemNames.filter(
    (q) => !items.some((i) => i.toLowerCase() === q.toLowerCase())
  );
  const availableUsual = usualItems.filter(
    (u) => !items.some((i) => i.toLowerCase() === u) && !QUICK_ADD.includes(u as (typeof QUICK_ADD)[number])
  );

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-6 py-16">
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
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Jag ska storhandla
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            Vad behöver du?
          </h1>
          <p className="mt-4 text-ink-secondary">
            Skriv en vara i taget. ProjektOS bygger och optimerar listan åt dig.
          </p>
          <Link
            href="/build/week"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
          >
            <CalendarRange className="size-3.5" />
            Eller låt AI planera en billig vecka åt dig
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="mt-10 w-full"
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

          <div className="mt-6 min-h-[44px]">
            <AnimatePresence initial={false}>
              {items.length > 0 && (
                <motion.div
                  layout
                  className="flex flex-wrap gap-2.5"
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
                      className="group flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                    >
                      {item}
                      <X className="size-3.5 text-primary/60 group-hover:text-primary" />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                Bläddra i kategori
              </p>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryOption)}
                  className="appearance-none rounded-full border border-border bg-surface-2/60 py-1.5 pl-4 pr-8 text-xs font-medium text-ink-secondary focus:border-primary/40 focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
              </div>
            </div>
            {availableQuickAdd.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {availableQuickAdd.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addItem(suggestion)}
                    className={cn(
                      "rounded-full border border-border px-4 py-2 text-sm text-ink-secondary transition-colors duration-200 hover:border-white/20 hover:text-ink"
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
            <div className="mt-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                Dina vanliga varor
              </p>
              <div className="flex flex-wrap gap-2.5">
                {availableUsual.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addItem(suggestion)}
                    className="rounded-full border border-success/25 bg-success/[0.06] px-4 py-2 text-sm text-success transition-colors duration-200 hover:bg-success/10"
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
          className="mt-10"
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
