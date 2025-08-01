import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import SessionBasedLayout from "@/components/SessionBasedLayout";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NAMLA - Zukunft bauen. Wohnraum gestalten.",
  description: "Familiengeführtes Bauträgerunternehmen für hochwertige Architektur und nachhaltigen Wohnraum.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <SessionBasedLayout>
            {children}
          </SessionBasedLayout>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
