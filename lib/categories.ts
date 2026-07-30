/**
 * The single source of truth for the home screen's category accordion.
 * Every top-level category (Mat, Bygg, Bil, Hem, Resor, Husdjur, Apotek)
 * lists every subcategory, whether it's actually built yet, and how to
 * act on it:
 *
 * - `query` — routes through the exact same AI scanning/result flow the
 *   old flat example chips already used (`submit(query)` in app/page.tsx
 *   → `interpretHomeQuery` → `runIntent`). Adding a subcategory here
 *   never requires touching the scanning UI.
 * - `href` — links straight to a dedicated intake page (used only where
 *   the flow needs its own follow-up questions beyond what the home
 *   scan's defaults can express, e.g. Innervägg's dimensions + options).
 * - `comingSoon: true` — honestly unbuilt; the accordion renders it
 *   disabled with a "Kommer snart" tag instead of silently mis-routing
 *   it, the same pattern already used on /projects and in
 *   lib/home-intent.ts's UNSUPPORTED_CATEGORIES.
 */

export type SubCategory = {
  id: string;
  label: string;
  emoji: string;
} & ({ query: string } | { href: string } | { comingSoon: true });

export type Category = {
  id: string;
  label: string;
  emoji: string;
  subcategories: SubCategory[];
};

export const CATEGORIES: Category[] = [
  {
    id: "mat",
    label: "Mat",
    emoji: "🍽️",
    subcategories: [
      { id: "frukost", label: "Frukost", emoji: "🥐", comingSoon: true },
      { id: "lunch", label: "Lunch", emoji: "🥪", comingSoon: true },
      { id: "middag", label: "Middag", emoji: "🍝", comingSoon: true },
      { id: "veckohandling", label: "Veckohandling", emoji: "🥛", query: "veckohandling" },
      { id: "tacokvall", label: "Tacokväll", emoji: "🌮", query: "tacos" },
      { id: "grill", label: "Grill", emoji: "🍖", comingSoon: true },
      { id: "bakning", label: "Bakning", emoji: "🧁", comingSoon: true },
      { id: "matlador", label: "Matlådor", emoji: "🍱", comingSoon: true },
      { id: "fest", label: "Fest", emoji: "🎉", comingSoon: true },
      { id: "barnmat", label: "Barnmat", emoji: "🍼", comingSoon: true },
    ],
  },
  {
    id: "bygg",
    label: "Bygg",
    emoji: "🏗️",
    subcategories: [
      { id: "altan", label: "Altan", emoji: "🏡", query: "bygg altan" },
      { id: "innervagg", label: "Innervägg", emoji: "🧱", href: "/projects/wall" },
      { id: "yttervagg", label: "Yttervägg", emoji: "🏠", comingSoon: true },
      { id: "parkering", label: "Parkering", emoji: "🅿️", comingSoon: true },
      { id: "tak", label: "Tak", emoji: "🏘️", comingSoon: true },
      { id: "golv", label: "Golv", emoji: "🪵", comingSoon: true },
      { id: "kok", label: "Kök", emoji: "🍳", comingSoon: true },
      { id: "badrum", label: "Badrum", emoji: "🛁", comingSoon: true },
      { id: "malning", label: "Målning", emoji: "🎨", comingSoon: true },
      { id: "tapet", label: "Tapet", emoji: "🖼️", comingSoon: true },
      { id: "forrad", label: "Förråd", emoji: "📦", comingSoon: true },
      { id: "trappa", label: "Trappa", emoji: "🪜", comingSoon: true },
      { id: "isolering", label: "Isolering", emoji: "🧊", comingSoon: true },
    ],
  },
  {
    id: "bil",
    label: "Bil",
    emoji: "🚗",
    subcategories: [
      { id: "service", label: "Service", emoji: "🔧", query: "bilservice" },
      { id: "dack", label: "Däck", emoji: "🛞", comingSoon: true },
      { id: "tvatt", label: "Tvätt", emoji: "🚿", comingSoon: true },
      { id: "besiktning", label: "Besiktning", emoji: "📋", comingSoon: true },
      { id: "reservdelar", label: "Reservdelar", emoji: "⚙️", query: "reservdelar bil" },
    ],
  },
  {
    id: "hem",
    label: "Hem",
    emoji: "🛋️",
    subcategories: [
      { id: "tv", label: "TV", emoji: "📺", query: "ny tv" },
      { id: "mobler", label: "Möbler", emoji: "🪑", comingSoon: true },
      { id: "vitvaror", label: "Vitvaror", emoji: "🧺", comingSoon: true },
      { id: "smart-home", label: "Smart Home", emoji: "💡", comingSoon: true },
      { id: "forvaring", label: "Förvaring", emoji: "🗄️", comingSoon: true },
    ],
  },
  {
    id: "resor",
    label: "Resor",
    emoji: "✈️",
    subcategories: [
      { id: "weekend", label: "Weekend", emoji: "🧳", comingSoon: true },
      { id: "camping", label: "Camping", emoji: "⛺", comingSoon: true },
      { id: "solsemester", label: "Solsemester", emoji: "🏖️", comingSoon: true },
      { id: "roadtrip", label: "Roadtrip", emoji: "🗺️", comingSoon: true },
      { id: "flyg", label: "Flyg", emoji: "🛫", comingSoon: true },
      { id: "hotell", label: "Hotell", emoji: "🏨", comingSoon: true },
    ],
  },
  {
    id: "husdjur",
    label: "Husdjur",
    emoji: "🐾",
    subcategories: [
      { id: "hund", label: "Hund", emoji: "🐶", query: "hund" },
      { id: "katt", label: "Katt", emoji: "🐱", query: "katt" },
      { id: "smadjur", label: "Smådjur", emoji: "🐹", comingSoon: true },
      { id: "fisk", label: "Fisk", emoji: "🐟", comingSoon: true },
    ],
  },
  {
    id: "apotek",
    label: "Apotek",
    emoji: "💊",
    subcategories: [
      { id: "allergi", label: "Allergi", emoji: "🤧", query: "allergi apotek" },
      { id: "forkylning", label: "Förkylning", emoji: "🤒", query: "förkylning apotek" },
      { id: "hud", label: "Hud", emoji: "🧴", query: "hudvård apotek" },
      { id: "barn", label: "Barn", emoji: "👶", query: "barnvård apotek" },
      { id: "forsta-hjalpen", label: "Första hjälpen", emoji: "🩹", query: "första hjälpen apotek" },
    ],
  },
];

/** Every built subcategory across every category — used to count how
 *  much of the vision is actually live, e.g. on a future "coverage"
 *  admin view. */
export const BUILT_SUBCATEGORY_COUNT = CATEGORIES.flatMap((c) => c.subcategories).filter(
  (s) => "query" in s || "href" in s
).length;
