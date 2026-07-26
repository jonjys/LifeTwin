import type { Store, StoreDomain, StoreId } from "@/lib/types";

/**
 * Seventeen retailers across three domains — seven Swedish grocery
 * chains plus one deals outlet, five building-materials chains for
 * "bygga altan", and four pet-supply chains for "husdjur". Each has a
 * distinct price personality and delivery profile; multipliers are
 * applied on top of each catalog item's base price, nothing here calls a
 * real pricing API. The same engine (lib/cart-engine, lib/decision-engine)
 * reads this one table for every project — it only ever filters by
 * `domain`, it never forks.
 */
export const STORES: Record<StoreId, Store & { priceMultiplier: number }> = {
  ica: {
    id: "ica",
    name: "ICA",
    tag: "ICA",
    color: "#FF4D5A",
    priceMultiplier: 1.05,
    deliveryEtaMin: 55,
    deliveryFeeSEK: 39,
    domain: "grocery",
  },
  willys: {
    id: "willys",
    name: "Willys",
    tag: "W",
    color: "#00E8FF",
    priceMultiplier: 0.9,
    deliveryEtaMin: 65,
    deliveryFeeSEK: 29,
    domain: "grocery",
  },
  coop: {
    id: "coop",
    name: "Coop",
    tag: "COOP",
    color: "#00FF88",
    priceMultiplier: 1.0,
    deliveryEtaMin: 50,
    deliveryFeeSEK: 39,
    domain: "grocery",
  },
  hemkop: {
    id: "hemkop",
    name: "Hemköp",
    tag: "HK",
    color: "#FFB020",
    priceMultiplier: 1.08,
    deliveryEtaMin: 45,
    deliveryFeeSEK: 49,
    domain: "grocery",
  },
  lidl: {
    id: "lidl",
    name: "Lidl",
    tag: "LIDL",
    color: "#FFB020",
    priceMultiplier: 0.85,
    deliveryEtaMin: 70,
    deliveryFeeSEK: 25,
    domain: "grocery",
  },
  citygross: {
    id: "citygross",
    name: "City Gross",
    tag: "CG",
    color: "#00E8FF",
    priceMultiplier: 0.98,
    deliveryEtaMin: 60,
    deliveryFeeSEK: 39,
    domain: "grocery",
  },
  mathem: {
    id: "mathem",
    name: "Mathem",
    tag: "MH",
    color: "#00FF88",
    priceMultiplier: 1.15,
    deliveryEtaMin: 27,
    deliveryFeeSEK: 49,
    domain: "grocery",
  },
  matsmart: {
    id: "matsmart",
    name: "Matsmart",
    tag: "MS",
    color: "#FFB020",
    // Not a general price leader — its edge is deep, rotating deals on
    // specific items (see matsmart.ts), not everyday low prices.
    priceMultiplier: 1.1,
    // Matsmart ships pallets every few days, not same-day.
    deliveryEtaMin: 2880,
    deliveryFeeSEK: 49,
    domain: "grocery",
  },
  byggmax: {
    id: "byggmax",
    name: "Byggmax",
    tag: "BM",
    color: "#FFB020",
    // The budget leader — cheapest virke, but a truck delivery costs real money.
    priceMultiplier: 0.88,
    deliveryEtaMin: 1440,
    deliveryFeeSEK: 199,
    domain: "building",
  },
  hornbach: {
    id: "hornbach",
    name: "Hornbach",
    tag: "HB",
    color: "#FF4D5A",
    priceMultiplier: 1.05,
    deliveryEtaMin: 2880,
    deliveryFeeSEK: 249,
    domain: "building",
  },
  bauhaus: {
    id: "bauhaus",
    name: "Bauhaus",
    tag: "BH",
    color: "#00E8FF",
    priceMultiplier: 1.0,
    deliveryEtaMin: 1440,
    deliveryFeeSEK: 179,
    domain: "building",
  },
  beijer: {
    id: "beijer",
    name: "Beijer Byggmaterial",
    tag: "BEI",
    color: "#00FF88",
    // Trade-oriented — best on bulk/heavy goods like betong and skruv,
    // but its own delivery truck is the priciest of the five.
    priceMultiplier: 0.94,
    deliveryEtaMin: 1440,
    deliveryFeeSEK: 299,
    domain: "building",
  },
  xlbygg: {
    id: "xlbygg",
    name: "XL-BYGG",
    tag: "XL",
    color: "#FFB020",
    priceMultiplier: 0.97,
    deliveryEtaMin: 2880,
    deliveryFeeSEK: 219,
    domain: "building",
  },
  arkenzoo: {
    id: "arkenzoo",
    name: "Arken Zoo",
    tag: "AZ",
    color: "#FF4D5A",
    priceMultiplier: 1.05,
    deliveryEtaMin: 1440,
    deliveryFeeSEK: 49,
    domain: "pet",
  },
  granngarden: {
    id: "granngarden",
    name: "Granngården",
    tag: "GG",
    color: "#00FF88",
    // Farm-supply roots — strong on bulk foder, weaker on delivery speed.
    priceMultiplier: 0.92,
    deliveryEtaMin: 2880,
    deliveryFeeSEK: 79,
    domain: "pet",
  },
  vetzoo: {
    id: "vetzoo",
    name: "Vetzoo",
    tag: "VZ",
    color: "#00E8FF",
    priceMultiplier: 0.88,
    deliveryEtaMin: 1440,
    deliveryFeeSEK: 39,
    domain: "pet",
  },
  zooplus: {
    id: "zooplus",
    name: "Zooplus",
    tag: "ZP",
    color: "#FFB020",
    // European-scale online retailer — the price leader, but ships from
    // further away.
    priceMultiplier: 0.85,
    deliveryEtaMin: 4320,
    deliveryFeeSEK: 29,
    domain: "pet",
  },
};

export const STORE_LIST = Object.values(STORES);

export function storesForDomain(domain: StoreDomain) {
  return STORE_LIST.filter((s) => s.domain === domain);
}

/** Which store a naive shopper defaults to, per domain, before ProjektOS optimizes. */
export const DEFAULT_STORE_BY_DOMAIN: Record<StoreDomain, StoreId> = {
  grocery: "ica",
  building: "byggmax",
  pet: "arkenzoo",
};
