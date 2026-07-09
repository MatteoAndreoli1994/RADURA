import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { CookiebotBannerEnhancer } from "@/components/CookiebotBannerEnhancer";
import { GridOverlayRoot } from "@/components/GridOverlayRoot";
import {
  ebGaramond,
  inconsolata,
  inter,
  dmSans,
  sneakyTimes,
  unifrakturMaguntia,
} from "@/lib/fonts";
import { viewportHeightInitScript } from "@/lib/viewport-height";
import "./globals.css";

const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID;

export const metadata: Metadata = {
  title: "RADURA",
  description: "Official website of Radura",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${inter.variable} ${dmSans.variable} ${sneakyTimes.variable} ${inconsolata.variable} ${unifrakturMaguntia.variable}`}
      suppressHydrationWarning
    >
      <head>
        {cookiebotId ? (
          <Script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            strategy="beforeInteractive"
            data-cbid={cookiebotId}
            data-blockingmode="auto"
          />
        ) : null}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: viewportHeightInitScript(),
          }}
        />
      </head>
      <body className={`${sneakyTimes.className} antialiased`}>
        {cookiebotId ? <CookiebotBannerEnhancer /> : null}
        <GridOverlayRoot>{children}</GridOverlayRoot>
      </body>
    </html>
  );
}
