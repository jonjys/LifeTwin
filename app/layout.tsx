import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjektOS — Vi fattar köpbeslut",
  description:
    "ProjektOS bryter ner projektet du startar — matkasse, altan, eller vad som helst härnäst — jämför rätt butiker och säger exakt vad du ska göra. Inte fler priser. Ett beslut.",
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
