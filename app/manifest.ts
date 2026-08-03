import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OffertPro",
    short_name: "OffertPro",
    description: "AI Operating System för hantverkare — offert, kalkyl och kundregister på 30 sekunder.",
    start_url: "/",
    display: "standalone",
    background_color: "#050508",
    theme_color: "#050508",
    icons: [
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
