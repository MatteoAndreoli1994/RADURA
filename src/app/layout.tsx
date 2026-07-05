import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ebGaramond, inconsolata, inter, dmSans, sneakyTimes } from "@/lib/fonts";
import { viewportHeightInitScript } from "@/lib/viewport-height";
import "./globals.css";

const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID;

export const metadata: Metadata = {
  title: "RADURA",
  description: "Official website of Radura",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
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
      className={`${ebGaramond.variable} ${inter.variable} ${dmSans.variable} ${sneakyTimes.variable} ${inconsolata.variable}`}
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
      <body className={`${sneakyTimes.className} antialiased`}>{children}</body>
    </html>
  );
}
