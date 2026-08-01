import type { MetadataRoute } from "next";

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

/** Only the pages that make sense to a visitor with no prior state —
 *  /cart, /orders, /dashboard, and /build/week's live scan depend on a
 *  list or history that doesn't exist yet for a fresh crawler. */
const ROUTES = [
  "/",
  "/projects",
  "/build",
  "/build/meals",
  "/projects/deck",
  "/projects/wall",
  "/projects/floor",
  "/projects/paint",
  "/projects/roof",
  "/projects/exterior-wall",
  "/projects/pet",
  "/projects/electronics",
  "/projects/pharmacy",
  "/projects/auto",
  "/profile",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
