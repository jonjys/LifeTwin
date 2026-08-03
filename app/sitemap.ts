import type { MetadataRoute } from "next";

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

const ROUTES = ["/", "/offers", "/customers", "/calculator", "/materials", "/ai-studio", "/settings"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
