export type HomeIntent =
  | { kind: "week" }
  | { kind: "grocery"; items: string[] }
  | { kind: "deck" }
  | { kind: "pet"; hasDog: boolean; hasCat: boolean }
  | { kind: "unsupported"; label: string };

const DECK_KEYWORDS = ["altan", "deck", "trall", "uterum"];
const WEEK_KEYWORDS = ["veckohandling", "veckans", "hela veckan", "storhandla", "storhandling"];
const DOG_KEYWORDS = ["hundmat", "hund"];
const CAT_KEYWORDS = ["kattmat", "katt"];

/** Categories the app doesn't actually run yet (see /projects "Kommer
 *  snart" tiles) — matched so the home screen can say so honestly
 *  instead of silently mis-parsing them as grocery items. */
const UNSUPPORTED_CATEGORIES: { keywords: string[]; label: string }[] = [
  { keywords: ["ny tv", "elektronik", "hdmi", "tv "], label: "Elektronik" },
  { keywords: ["semester", "resa", "vacation", "flyg"], label: "Semester" },
  { keywords: ["apotek", "medicin", "pharmacy", "recept"], label: "Apotek" },
  { keywords: ["bröllop"], label: "Bröllop" },
  { keywords: [" jul", "julklapp"], label: "Jul" },
  { keywords: ["flytt", "flytta"], label: "Flytt" },
  { keywords: ["badrum", "renovera"], label: "Renovera badrum" },
  { keywords: ["bilservice", "bilverkstad", "olja", "bromsar"], label: "Bilservice" },
  { keywords: ["ikea"], label: "IKEA" },
];

/**
 * Turns whatever the user typed (or an example chip) into an intent the
 * home screen can act on — deliberately narrow: only "week" and "deck"
 * and free-text "grocery" are things the app can actually plan today.
 * Everything else maps to "unsupported" with an honest label rather than
 * silently mis-parsing "hundmat" as a grocery item.
 */
export function interpretHomeQuery(raw: string): HomeIntent {
  const text = ` ${raw.trim().toLowerCase()} `;
  if (text.trim() === "") return { kind: "grocery", items: [] };

  for (const category of UNSUPPORTED_CATEGORIES) {
    if (category.keywords.some((k) => text.includes(k))) {
      return { kind: "unsupported", label: category.label };
    }
  }
  if (DECK_KEYWORDS.some((k) => text.includes(k))) return { kind: "deck" };
  if (WEEK_KEYWORDS.some((k) => text.includes(k))) return { kind: "week" };

  const hasDog = DOG_KEYWORDS.some((k) => text.includes(k));
  const hasCat = CAT_KEYWORDS.some((k) => text.includes(k));
  if (hasDog || hasCat) return { kind: "pet", hasDog, hasCat };

  const items = raw
    .split(/,| och |\n|;/i)
    .map((s) => s.trim())
    .filter(Boolean);
  return { kind: "grocery", items: items.length > 0 ? items : [raw.trim()] };
}
