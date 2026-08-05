// lib/site.ts
/** The one canonical public URL — used for SEO metadata, the free-tier PDF
 *  watermark link, and the "Dela OffertPro" share button. Hardcoded rather
 *  than read from VERCEL_URL/VERCEL_PROJECT_PRODUCTION_URL: those aren't
 *  NEXT_PUBLIC_-prefixed so they're unavailable client-side (where the
 *  watermark and share button render), and shared links should always
 *  point at production, never at whichever preview deployment built them. */
export const SITE_URL = "https://life-twin-mu.vercel.app";
export const SITE_NAME = "OffertPro";
export const SHARE_TAGLINE = "Skapa dina offerter på 30 sek med röst";
