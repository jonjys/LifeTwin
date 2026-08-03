import { tvItemId, type TvSizeInch } from "@/lib/cart-engine/electronics-catalog";
import type { ExteriorWallOptions } from "@/lib/cart-engine/exterior-wall-catalog";
import type { FloorOptions } from "@/lib/cart-engine/floor-catalog";
import type { InsulationOptions } from "@/lib/cart-engine/insulation-catalog";
import { DECK_ITEM_IDS } from "@/lib/cart-engine/materials-catalog";
import type { PaintOptions } from "@/lib/cart-engine/paint-catalog";
import type { ParkingOptions } from "@/lib/cart-engine/parking-catalog";
import {
  ALL_PET_ITEM_IDS,
  CAT_ITEM_IDS,
  DOG_ITEM_IDS,
  FISK_ITEM_IDS,
  SMADJUR_ITEM_IDS,
} from "@/lib/cart-engine/pet-catalog";
import type { RoofOptions } from "@/lib/cart-engine/roof-catalog";
import type { WallOptions } from "@/lib/cart-engine/wall-catalog";
import { DEFAULT_PROFILE } from "@/lib/types";
import type { OrderRecord, SmartCartState, UserProfile } from "@/lib/types";

const STORAGE_KEY = "smartcart.state.v1";
const USUAL_ITEM_THRESHOLD = 2;

export function loadState(): SmartCartState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SmartCartState;
    if (!parsed?.createdAt) return null;
    // Older sessions won't have these fields yet — backfill defaults.
    if (!parsed.profile) parsed.profile = { ...DEFAULT_PROFILE };
    if (parsed.profile.name === undefined) parsed.profile.name = "";
    if (!parsed.currentCategory) parsed.currentCategory = "grocery";
    if (parsed.deckDimensions === undefined) parsed.deckDimensions = null;
    if (parsed.wallOptions === undefined) parsed.wallOptions = null;
    if (parsed.floorOptions === undefined) parsed.floorOptions = null;
    if (parsed.paintOptions === undefined) parsed.paintOptions = null;
    if (parsed.roofOptions === undefined) parsed.roofOptions = null;
    if (parsed.extWallOptions === undefined) parsed.extWallOptions = null;
    if (parsed.insulationOptions === undefined) parsed.insulationOptions = null;
    if (parsed.parkingOptions === undefined) parsed.parkingOptions = null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: SmartCartState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function ensureState(): SmartCartState {
  const existing = loadState();
  if (existing) return existing;
  const fresh: SmartCartState = {
    createdAt: new Date().toISOString(),
    profile: { ...DEFAULT_PROFILE },
    usualItems: [],
    itemHistory: [],
    orders: [],
    currentItems: [],
    currentCategory: "grocery",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(fresh);
  return fresh;
}

export function saveProfile(profile: UserProfile): SmartCartState {
  const state = ensureState();
  const next: SmartCartState = { ...state, profile };
  saveState(next);
  return next;
}

/** Records a new shopping list, growing AI Memory as items repeat. */
export function recordList(items: string[]): SmartCartState {
  const state = ensureState();
  const normalized = items.map((i) => i.trim().toLowerCase()).filter(Boolean);

  const history = [...state.itemHistory, ...normalized];
  const counts = new Map<string, number>();
  for (const item of history) counts.set(item, (counts.get(item) ?? 0) + 1);

  const usualItems = [...counts.entries()]
    .filter(([, count]) => count >= USUAL_ITEM_THRESHOLD)
    .sort((a, b) => b[1] - a[1])
    .map(([item]) => item)
    .slice(0, 8);

  const next: SmartCartState = {
    ...state,
    itemHistory: history.slice(-200),
    usualItems,
    currentItems: items,
    currentCategory: "grocery",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts a "Bygga altan" project — the AI Plan's fixed material list,
 *  scaled by the confirmed deck dimensions. Doesn't touch grocery AI
 *  Memory; that's a separate project's history. */
export function startDeckProject(widthM: number, depthM: number): SmartCartState {
  const state = ensureState();
  const next: SmartCartState = {
    ...state,
    currentItems: DECK_ITEM_IDS,
    currentCategory: "deck",
    deckDimensions: { widthM, depthM },
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts an "Innervägg" project — the flagship AI calculator: dimensions
 *  plus every follow-up answer are persisted so a reload can regenerate
 *  the exact same wall catalog (see lib/cart-engine/wall-catalog.ts). */
export function startWallProject(opts: WallOptions): SmartCartState {
  const state = ensureState();
  const items = [
    "regel-innervagg",
    "gipsskiva-innervagg",
    "skruv-innervagg",
    ...(opts.isolera ? ["isolering-innervagg"] : []),
    ...(opts.malas ? ["spackel-innervagg", "farg-innervagg"] : []),
    "list-innervagg",
    ...(opts.dorr ? ["dorrsats-innervagg"] : []),
    ...(opts.verktyg ? ["verktygssats-innervagg"] : []),
  ];
  const next: SmartCartState = {
    ...state,
    currentItems: items,
    currentCategory: "wall",
    deckDimensions: null,
    wallOptions: opts,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts a "Golv" project — same shape as Innervägg: dimensions plus
 *  follow-up answers are persisted so a reload can regenerate the exact
 *  same floor catalog (see lib/cart-engine/floor-catalog.ts). */
export function startFloorProject(opts: FloorOptions): SmartCartState {
  const state = ensureState();
  const items = [
    "golv-golv",
    "underlag-golv",
    "list-golv",
    ...(opts.golvvarme ? ["golvvarme-golv"] : []),
    ...(opts.troskel ? ["troskel-golv"] : []),
  ];
  const next: SmartCartState = {
    ...state,
    currentItems: items,
    currentCategory: "floor",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: opts,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts a "Målning" project — one dimension (yta) plus follow-up
 *  answers are persisted so a reload can regenerate the exact same paint
 *  catalog (see lib/cart-engine/paint-catalog.ts). */
export function startPaintProject(opts: PaintOptions): SmartCartState {
  const state = ensureState();
  const items = [
    "farg-malning",
    "spackel-malning",
    "skydd-malning",
    ...(opts.verktyg ? ["verktygssats-malning"] : []),
  ];
  const next: SmartCartState = {
    ...state,
    currentItems: items,
    currentCategory: "paint",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: opts,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts a "Tak" project — one dimension (yta) plus follow-up answers
 *  are persisted so a reload can regenerate the exact same roof catalog
 *  (see lib/cart-engine/roof-catalog.ts). */
export function startRoofProject(opts: RoofOptions): SmartCartState {
  const state = ensureState();
  const items = ["takmaterial-tak", "underlag-tak", "spik-tak", ...(opts.rannor ? ["hangranna-tak"] : [])];
  const next: SmartCartState = {
    ...state,
    currentItems: items,
    currentCategory: "roof",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: opts,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts a "Yttervägg" project — same shape as Innervägg: dimensions
 *  plus follow-up answers are persisted so a reload can regenerate the
 *  exact same catalog (see lib/cart-engine/exterior-wall-catalog.ts). */
export function startExteriorWallProject(opts: ExteriorWallOptions): SmartCartState {
  const state = ensureState();
  const items = [
    "regel-yttervagg",
    "vindskyddsskiva-yttervagg",
    "fasadpanel-yttervagg",
    "skruv-yttervagg",
    ...(opts.isolera ? ["isolering-yttervagg"] : []),
    ...(opts.malas ? ["farg-yttervagg"] : []),
  ];
  const next: SmartCartState = {
    ...state,
    currentItems: items,
    currentCategory: "extwall",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: opts,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts an "Isolering" project — one dimension (yta) plus follow-up
 *  answers are persisted so a reload can regenerate the exact same
 *  insulation catalog (see lib/cart-engine/insulation-catalog.ts). */
export function startInsulationProject(opts: InsulationOptions): SmartCartState {
  const state = ensureState();
  const items = [
    "isolering-isolering",
    ...(opts.angsparr ? ["angsparr-isolering", "tejp-isolering"] : []),
  ];
  const next: SmartCartState = {
    ...state,
    currentItems: items,
    currentCategory: "insulation",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: opts,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts a "Parkering" project — one dimension (yta) plus follow-up
 *  answers are persisted so a reload can regenerate the exact same
 *  parking catalog (see lib/cart-engine/parking-catalog.ts). */
export function startParkingProject(opts: ParkingOptions): SmartCartState {
  const state = ensureState();
  const items = ["underlag-parkering", "markduk-parkering", ...(opts.kantsten ? ["kantsten-parkering"] : [])];
  const next: SmartCartState = {
    ...state,
    currentItems: items,
    currentCategory: "parking",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: opts,
  };
  saveState(next);
  return next;
}

/** Starts a "Husdjur" project — whichever species the user has, no
 *  dimensions to set (unlike the deck project), so no extra params to
 *  persist beyond which item ids land in currentItems. */
export function startPetProject(
  hasDog: boolean,
  hasCat: boolean,
  hasSmadjur = false,
  hasFisk = false
): SmartCartState {
  const state = ensureState();
  const items =
    hasDog || hasCat || hasSmadjur || hasFisk
      ? [
          ...(hasDog ? DOG_ITEM_IDS : []),
          ...(hasCat ? CAT_ITEM_IDS : []),
          ...(hasSmadjur ? SMADJUR_ITEM_IDS : []),
          ...(hasFisk ? FISK_ITEM_IDS : []),
        ]
      : ALL_PET_ITEM_IDS;
  const next: SmartCartState = {
    ...state,
    currentItems: items,
    currentCategory: "pet",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts an "Elektronik" project — one TV at the chosen size, HDMI-kabel
 *  always included, väggfäste/soundbar only if asked for. No dimensions
 *  to persist (unlike deck): the size is baked into which TV item id
 *  lands in currentItems, so a reload can rebuild the exact same cart
 *  from the fixed electronics catalog alone. */
export function startElectronicsProject(
  sizeInch: TvSizeInch,
  wantsSoundbar: boolean,
  wantsWallMount: boolean
): SmartCartState {
  const state = ensureState();
  const items = [
    tvItemId(sizeInch),
    "hdmi-kabel",
    ...(wantsWallMount ? ["vaggfaste"] : []),
    ...(wantsSoundbar ? ["soundbar"] : []),
  ];
  const next: SmartCartState = {
    ...state,
    currentItems: items,
    currentCategory: "electronics",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts an "Apotek" project — whichever health basics the user picked
 *  on the intake page, from the fixed pharmacy catalog. */
export function startApotekProject(selectedIds: string[]): SmartCartState {
  const state = ensureState();
  const next: SmartCartState = {
    ...state,
    currentItems: selectedIds,
    currentCategory: "pharmacy",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Starts a "Bilservice" project — whichever car-service parts the user
 *  picked on the intake page, from the fixed auto catalog. */
export function startAutoProject(selectedIds: string[]): SmartCartState {
  const state = ensureState();
  const next: SmartCartState = {
    ...state,
    currentItems: selectedIds,
    currentCategory: "auto",
    deckDimensions: null,
    wallOptions: null,
    floorOptions: null,
    paintOptions: null,
    roofOptions: null,
    extWallOptions: null,
    insulationOptions: null,
    parkingOptions: null,
  };
  saveState(next);
  return next;
}

/** Records a completed checkout, growing the savings + impact dashboard. */
export function recordOrder(order: OrderRecord): SmartCartState {
  const state = ensureState();
  const next: SmartCartState = {
    ...state,
    orders: [...state.orders, order].slice(-200),
  };
  saveState(next);
  return next;
}

function ordersInPeriod(state: SmartCartState, matches: (d: Date) => boolean): OrderRecord[] {
  return state.orders.filter((o) => matches(new Date(o.date)));
}

export function savingsThisMonth(state: SmartCartState): number {
  const now = new Date();
  return ordersInPeriod(
    state,
    (d) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  ).reduce((sum, o) => sum + o.savingsSEK, 0);
}

export function savingsThisYear(state: SmartCartState): number {
  const now = new Date();
  return ordersInPeriod(state, (d) => d.getFullYear() === now.getFullYear()).reduce(
    (sum, o) => sum + o.savingsSEK,
    0
  );
}

export function savingsSinceInstall(state: SmartCartState): number {
  return state.orders.reduce((sum, o) => sum + o.savingsSEK, 0);
}

export function timeSavedSinceInstallMin(state: SmartCartState): number {
  return state.orders.reduce((sum, o) => sum + (o.timeSavedMin ?? 0), 0);
}

export function carTripsAvoidedSinceInstall(state: SmartCartState): number {
  return state.orders.filter((o) => o.carTripAvoided).length;
}

export function caloriesWalkedSinceInstall(state: SmartCartState): number {
  return state.orders.reduce((sum, o) => sum + (o.caloriesWalked ?? 0), 0);
}

export function co2SavedSinceInstallGrams(state: SmartCartState): number {
  return state.orders.reduce((sum, o) => sum + (o.co2SavedGrams ?? 0), 0);
}
