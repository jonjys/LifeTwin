"use client";

import { useEffect, useState } from "react";
import { LiveMap } from "@/components/map/live-map";
import { DEFAULT_HOME_COORDS, geocodeAddress } from "@/lib/geo/geocode";
import type { LatLng } from "@/lib/geo/types";

const DEBOUNCE_MS = 800;

/** A small live preview so the user can confirm their address resolved
 *  to the right spot — debounced so we don't hammer Nominatim per keypress. */
export function AddressMapPreview({ address }: { address: string }) {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address.trim()) {
      setCoords(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timeout = window.setTimeout(() => {
      geocodeAddress(address).then((result) => {
        if (cancelled) return;
        setCoords(result ?? DEFAULT_HOME_COORDS);
        setLoading(false);
      });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [address]);

  if (!address.trim()) return null;

  return (
    <div className="h-48 overflow-hidden rounded-2xl border border-border">
      {coords ? (
        <LiveMap homeCoords={coords} />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-ink-muted">
          {loading ? "Hittar adressen på kartan…" : ""}
        </div>
      )}
    </div>
  );
}
