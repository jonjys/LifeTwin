import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppShell } from "@/components/nav/app-shell";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

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
      </body>
    </html>
  );
}
