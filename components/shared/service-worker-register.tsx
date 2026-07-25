"use client";

import { useEffect } from "react";

/** Registers the offline app-shell service worker (public/sw.js) —
 *  silently does nothing where service workers aren't supported, never
 *  blocks or errors the page. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
