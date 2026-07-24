"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { fetchDrivingRoute } from "@/lib/geo/route";
import type { LatLng } from "@/lib/geo/types";
import { STORES } from "@/lib/cart-engine";
import type { FulfillmentId, StoreId } from "@/lib/types";

type LiveMapProps = {
  homeCoords: LatLng;
  /** `label` is the real storefront name when one was found nearby
   *  (OpenStreetMap), otherwise the generic chain name; `real` flags
   *  which one it is so the marker can say so honestly. */
  stores?: { id: StoreId; coords: LatLng; label?: string; real?: boolean }[];
  /** Which fulfillment method is selected right now — restyles the route
   *  live, without refetching it. */
  activeFulfillment?: FulfillmentId;
  className?: string;
};

const FULFILLMENT_STYLE: Record<FulfillmentId, { color: string; dashArray?: string }> = {
  pickup: { color: "#00E8FF" },
  delivery: { color: "#00FF88", dashArray: "10 8" },
  walk: { color: "#FFB020", dashArray: "2 10" },
};

function homeIconHtml(): string {
  return `<div style="width:16px;height:16px;border-radius:9999px;background:#00E8FF;box-shadow:0 0 0 6px rgba(0,232,255,0.22);border:2px solid #050508;"></div>`;
}

function storeIconHtml(tag: string, color: string, real: boolean): string {
  // A dashed outer ring marks an estimated (not confirmed) location, so
  // the map never quietly claims a fake position is a real address.
  const ring = real ? "" : `outline:2px dashed ${color};outline-offset:3px;`;
  return `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${color};color:#050508;font-size:10px;font-weight:700;border:2px solid #050508;box-shadow:0 2px 8px rgba(0,0,0,0.5);${ring}">${tag}</div>`;
}

/** Tags a Leaflet layer as ours (for cleanup) — all Leaflet interop here
 *  is intentionally untyped, since the library is dynamically imported
 *  client-side only and this file otherwise has no compile-time contract
 *  with it beyond "it works like Leaflet". */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function markOurs(layer: any): any {
  layer._smartcart = true;
  return layer;
}

/**
 * A real, live map: OpenStreetMap tiles (CartoDB dark), the user's
 * geocoded home, and every store in the current cart, connected by a
 * route that's fetched once (real roads via OSRM, or a straight line if
 * that fails) and then simply restyled — color and dash pattern — to
 * reflect whichever fulfillment method is selected.
 */
export function LiveMap({
  homeCoords,
  stores = [],
  activeFulfillment = "pickup",
  className,
}: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLayersRef = useRef<any[]>([]);

  // Build the map, markers, and routes whenever home or the store set changes.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView(
          [homeCoords.lat, homeCoords.lng],
          12
        );
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(mapRef.current);
        L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
      }

      const map = mapRef.current;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.eachLayer((layer: any) => {
        if (layer._smartcart) map.removeLayer(layer);
      });
      routeLayersRef.current = [];

      markOurs(
        L.marker([homeCoords.lat, homeCoords.lng], {
          icon: L.divIcon({ html: homeIconHtml(), className: "", iconSize: [16, 16] }),
        })
          .bindTooltip("Hem", { direction: "top", offset: [0, -10] })
          .addTo(map)
      );

      const style = FULFILLMENT_STYLE[activeFulfillment];
      const bounds = L.latLngBounds([[homeCoords.lat, homeCoords.lng]]);

      for (const store of stores) {
        const meta = STORES[store.id];
        const real = store.real ?? false;
        const label = store.label ?? meta.name;
        bounds.extend([store.coords.lat, store.coords.lng]);

        markOurs(
          L.marker([store.coords.lat, store.coords.lng], {
            icon: L.divIcon({
              html: storeIconHtml(meta.tag, meta.color, real),
              className: "",
              iconSize: [28, 28],
            }),
          })
            .bindTooltip(real ? label : `${label} (uppskattad plats)`, {
              direction: "top",
              offset: [0, -16],
            })
            .addTo(map)
        );

        const straightLine = markOurs(
          L.polyline(
            [
              [homeCoords.lat, homeCoords.lng],
              [store.coords.lat, store.coords.lng],
            ],
            { color: style.color, weight: 3, opacity: 0.7, dashArray: style.dashArray }
          ).addTo(map)
        );
        routeLayersRef.current.push(straightLine);

        fetchDrivingRoute(homeCoords, store.coords).then((points) => {
          if (cancelled || !points || !mapRef.current) return;
          map.removeLayer(straightLine);
          routeLayersRef.current = routeLayersRef.current.filter((l) => l !== straightLine);

          const currentStyle = FULFILLMENT_STYLE[activeFulfillment];
          const routeLine = markOurs(
            L.polyline(
              points.map((p) => [p.lat, p.lng] as [number, number]),
              { color: currentStyle.color, weight: 3, opacity: 0.85, dashArray: currentStyle.dashArray }
            ).addTo(map)
          );
          routeLayersRef.current.push(routeLine);
        });
      }

      map.fitBounds(bounds, { padding: [36, 36] });
    })();

    return () => {
      cancelled = true;
    };
    // activeFulfillment intentionally excluded — restyled in the effect below,
    // not rebuilt, so switching methods never re-triggers a route refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeCoords.lat, homeCoords.lng, stores.map((s) => s.id).join(",")]);

  // Restyle existing routes instantly when the selected method changes.
  useEffect(() => {
    const style = FULFILLMENT_STYLE[activeFulfillment];
    for (const layer of routeLayersRef.current) {
      layer.setStyle?.({ color: style.color, dashArray: style.dashArray ?? null });
    }
  }, [activeFulfillment]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}
