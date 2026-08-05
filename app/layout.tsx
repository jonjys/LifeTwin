import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppShell } from "@/components/nav/app-shell";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Plausible: lightweight (~1KB), cookie-free — no GDPR consent banner
// needed, which matters for a Swedish B2B product. Unset by default; add
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN in Vercel's env vars to turn it on. Until
// then lib/analytics.ts's track() calls are silent no-ops, same honest-
// degradation pattern as ANTHROPIC_API_KEY/DATABASE_URL/Twilio.
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

const TITLE = "OffertPro | Sveriges snabbaste AI-offertkalkylator för hantverkare";
const DESCRIPTION =
  "Skapa professionella offerter med röst på 30 sekunder i skåpbilen. Automatisk material- & ROT-beräkning. Testa gratis!";
const KEYWORDS = [
  "offertkalkylator",
  "hantverkare",
  "offertmall snickare",
  "ROT-avdrag",
  "röstinmatning offert",
  "VVS kalkylator",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OffertPro",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "OffertPro",
    type: "website",
    locale: "sv_SE",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <AppShell>{children}</AppShell>
        <ServiceWorkerRegister />
        {PLAUSIBLE_DOMAIN && (
          <>
            {/* Queues track() calls made before the async script below has
                loaded, per Plausible's own custom-events setup guide —
                without this, an early click could silently no-op. */}
            <Script id="plausible-queue" strategy="beforeInteractive">
              {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
            </Script>
            <Script
              defer
              data-domain={PLAUSIBLE_DOMAIN}
              src="https://plausible.io/js/script.js"
              strategy="afterInteractive"
            />
          </>
        )}
      </body>
    </html>
  );
}
