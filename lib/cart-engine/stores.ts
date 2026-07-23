import type { Store, StoreId } from "@/lib/types";

/**
 * Seven Swedish grocery chains, each with a distinct price personality and
 * delivery profile — Lidl and Willys undercut on price, Mathem wins on
 * speed, and so on. Multipliers are applied on top of each catalog item's
 * base price; nothing here calls a real pricing API.
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
  },
  willys: {
    id: "willys",
    name: "Willys",
    tag: "W",
    color: "#00E8FF",
    priceMultiplier: 0.9,
    deliveryEtaMin: 65,
    deliveryFeeSEK: 29,
  },
  coop: {
    id: "coop",
    name: "Coop",
    tag: "COOP",
    color: "#00FF88",
    priceMultiplier: 1.0,
    deliveryEtaMin: 50,
    deliveryFeeSEK: 39,
  },
  hemkop: {
    id: "hemkop",
    name: "Hemköp",
    tag: "HK",
    color: "#FFB020",
    priceMultiplier: 1.08,
    deliveryEtaMin: 45,
    deliveryFeeSEK: 49,
  },
  lidl: {
    id: "lidl",
    name: "Lidl",
    tag: "LIDL",
    color: "#FFB020",
    priceMultiplier: 0.85,
    deliveryEtaMin: 70,
    deliveryFeeSEK: 25,
  },
  citygross: {
    id: "citygross",
    name: "City Gross",
    tag: "CG",
    color: "#00E8FF",
    priceMultiplier: 0.98,
    deliveryEtaMin: 60,
    deliveryFeeSEK: 39,
  },
  mathem: {
    id: "mathem",
    name: "Mathem",
    tag: "MH",
    color: "#00FF88",
    priceMultiplier: 1.15,
    deliveryEtaMin: 27,
    deliveryFeeSEK: 49,
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
  },
};

export const STORE_LIST = Object.values(STORES);
