import type { Metadata } from "next";
import { LandingContent } from "@/components/landing/landing-content";

const TITLE = "Karma — Skapa vinnande offerter på 30 sekunder";
const DESCRIPTION =
  "AI-driven kalkylering för svenska hantverkare. Beskriv jobbet — Karma räknar ut material, arbetstid, ROT-avdrag och pris. Inget kreditkort krävs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "sv_SE" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function LandingPage() {
  return <LandingContent />;
}
