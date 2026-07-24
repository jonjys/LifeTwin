"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { LiveMap } from "@/components/map/live-map";
import { Card, CardTitle } from "@/components/ui/card";
import { STORES } from "@/lib/cart-engine";
import { DEFAULT_HOME_COORDS, geocodeAddress } from "@/lib/geo/geocode";
import { resolveStoreCoordinates, type ResolvedStorePosition } from "@/lib/geo/store-position";
import type { LatLng } from "@/lib/geo/types";
import type { CartResult, FulfillmentId, StoreId, UserProfile } from "@/lib/types";

const FULFILLMENT_LABEL: Record<FulfillmentId, string> = {
  pickup: "Hämta själv",
  delivery: "Hemleverans",
  walk: "Promenera",
};

const FULFILLMENT_COLOR: Record<FulfillmentId, string> = {
  pickup: "#00E8FF",
  delivery: "#00FF88",
  walk: "#FFB020",
};

type LiveMapCardProps = {
  profile: UserProfile;
  cart: CartResult;
  activeFulfillment: FulfillmentId;
};

/** The real map behind the Decision Engine — your actual geocoded home,
 *  every store the cart touches placed at its real, named storefront
 *  when one can be found nearby (OpenStreetMap, live), and a route that
 *  restyles the instant you switch between Hämta själv / Hemleverans /
 *  Promenera. */
export function LiveMapCard({ profile, cart, activeFulfillment }: LiveMapCardProps) {
  const [homeCoords, setHomeCoords] = useState<LatLng | null>(null);
  const [approximate, setApproximate] = useState(false);
  const [stores, setStores] = useState<(ResolvedStorePosition & { id: StoreId })[]>([]);
  const [resolvingStores, setResolvingStores] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHomeCoords(null);
    geocodeAddress(profile.homeAddress).then((coords) => {
      if (cancelled) return;
      if (coords) {
        setHomeCoords(coords);
        setApproximate(false);
      } else {
        setHomeCoords(DEFAULT_HOME_COORDS);
        setApproximate(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [profile.homeAddress]);

  const storeIds = [...new Set(cart.items.map((i) => i.chosen.store))];
  const storeIdsKey = storeIds.join(",");

  useEffect(() => {
    if (!homeCoords) return;
    let cancelled = false;
    setResolvingStores(true);
    Promise.all(
      storeIds.map(async (id) => ({
        id,
        ...(await resolveStoreCoordinates(homeCoords, profile.homeAddress, id, STORES[id].name)),
      }))
    ).then((resolved) => {
      if (cancelled) return;
      setStores(resolved);
      setResolvingStores(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeCoords?.lat, homeCoords?.lng, storeIdsKey, profile.homeAddress]);

  const anyRealStore = stores.some((s) => s.real);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <CardTitle>Live karta</CardTitle>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: `${FULFILLMENT_COLOR[activeFulfillment]}1A`,
            color: FULFILLMENT_COLOR[activeFulfillment],
          }}
        >
          {FULFILLMENT_LABEL[activeFulfillment]}
        </span>
      </div>

      {approximate && (
        <p className="text-xs text-ink-muted">
          Kunde inte hitta exakt adress — visar en ungefärlig plats. Ange en adress under
          Min Profil för en mer exakt karta.
        </p>
      )}

      {!resolvingStores && stores.length > 0 && (
        <p className="text-xs text-ink-muted">
          {anyRealStore
            ? "Riktiga butiksplatser (OpenStreetMap) där de kunde hittas nära dig, annars en uppskattad plats."
            : "Hittade inga bekräftade butiksadresser nära dig just nu — visar uppskattade platser."}
        </p>
      )}

      <div className="h-[380px] overflow-hidden rounded-2xl border border-border">
        {homeCoords && !resolvingStores ? (
          <LiveMap
            homeCoords={homeCoords}
            stores={stores}
            activeFulfillment={activeFulfillment}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-muted">
            {homeCoords ? "Letar upp riktiga butiksplatser…" : "Hittar din plats på kartan…"}
          </div>
        )}
      </div>
    </Card>
  );
}
