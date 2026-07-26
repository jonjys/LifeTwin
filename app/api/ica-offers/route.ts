import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export const revalidate = 21600; // 6 hours — real users never trigger a live scrape

const SOURCE_URL = "https://www.ica.se/erbjudanden/";

export type RealOffer = {
  name: string;
  priceText: string;
};

/**
 * The one real, live grocery price source in the app: ICA's own public
 * "veckans erbjudanden" page. This is a single, respectful, cached fetch
 * of a page ICA publishes for shoppers to read — not their private API,
 * not a logged-in member-price page, not their full product catalog.
 * Server-rendered (Vue) markup, parsed with cheerio; no headless browser,
 * no bot-evasion. Cached for 6h by Next's Data Cache (see `revalidate`
 * above) and refreshed by a Vercel Cron hitting this route on the same
 * schedule (see vercel.json), so real visitors always get the cache, never
 * a live fetch. Every other store's "campaign" stays the existing honest
 * simulation — this endpoint does not pretend to cover them.
 */
export async function GET() {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ProjektOS/1.0; +https://github.com/jonjys/LifeTwin) offer-reader",
      },
      next: { revalidate },
    });
    if (!res.ok) return NextResponse.json({ items: [], fetchedAt: null });

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: RealOffer[] = [];

    $(".offer-card").each((_, el) => {
      // The image alt text reads "Illustration av <product>" — strip that
      // down to the actual product name.
      const rawName = $(el).find(".offer-card__image-inner").attr("alt")?.trim();
      const name = rawName?.replace(/^illustration\s+av\s+/i, "").trim();
      const priceText = $(el).find(".price-splash .sr-only").first().text().trim();
      if (name && priceText) items.push({ name, priceText });
    });

    return NextResponse.json({
      items: items.slice(0, 40),
      fetchedAt: new Date().toISOString(),
      source: SOURCE_URL,
    });
  } catch {
    return NextResponse.json({ items: [], fetchedAt: null });
  }
}
