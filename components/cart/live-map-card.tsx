"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { LiveMap } from "@/components/map/live-map";
import { Card, CardTitle } from "@/components/ui/card";
import { DEFAULT_HOME_COORDS, geocodeAddress } from "@/lib/geo/geocode";
import { storeCoordinates } from "@/lib/geo/store-position";
import type { LatLng } from "@/lib/geo/types";
import type { CartResult, FulfillmentId, UserProfile } from "@/lib/types";

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
 *  every store the cart touches, and a route that restyles the instant
 *  you switch between Hämta själv / Hemleverans / Promenera. */
export function LiveMapCard({ profile, cart, activeFulfillment }: LiveMapCardProps) {
  const [homeCoords, setHomeCoords] = useState<LatLng | null>(null);
  const [approximate, setApproximate] = useState(false);

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

      <div className="h-[380px] overflow-hidden rounded-2xl border border-border">
        {homeCoords ? (
          <LiveMap
            homeCoords={homeCoords}
            stores={storeIds.map((id) => ({
              id,
              coords: storeCoordinates(homeCoords, profile.homeAddress, id),
            }))}
            activeFulfillment={activeFulfillment}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-muted">
            Hittar din plats på kartan…
          </div>
        )}
      </div>
    </Card>
  );
}
