import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartCart AI — Vi fattar köpbeslut",
  description:
    "SmartCart AI väger pris mot tid, bensin och besvär över ICA, Willys, Coop, Lidl och fler, och säger exakt vad du ska göra — hämta själv, hemleverans eller vänta. Inte fler priser. Ett beslut.",
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
        {children}
      </body>
    </html>
  );
}
