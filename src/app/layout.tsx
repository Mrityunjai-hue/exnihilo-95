import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ServiceWorkerRegistration } from "../components/PWA/ServiceWorkerRegistration";
import "../styles/win95.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#008080",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://exnihilo-95.vercel.app"),
  title:
    "ExNihilo 95 | Run SQL Queries Instantly Without Creating Tables or Schemas",
  description:
    "An intuitive, zero-backend, in-browser SQL IDE that eliminates 'Table not found' errors. Instantly parse queries, infer data types on the fly, and run relational execution loops completely in memory.",
  keywords: [
    "sql ide",
    "mock data generator",
    "zero config database",
    "schema inference",
    "in browser database",
    "sql parser",
  ],
  openGraph: {
    title:
      "ExNihilo 95 | Run SQL Queries Instantly Without Creating Tables or Schemas",
    description:
      "An intuitive, zero-backend, in-browser SQL IDE that eliminates 'Table not found' errors. Instantly parse queries, infer data types on the fly, and run relational execution loops completely in memory.",
    url: "https://exnihilo-95.vercel.app",
    siteName: "ExNihilo 95",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/icon.svg"],
    apple: ["/apple-touch-icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="win95-classic" data-typography="hybrid" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ExNihilo 95",
              operatingSystem: "Any / WebBrowser",
              applicationCategory: "DeveloperApplication",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                "An intuitive, zero-backend, in-browser SQL IDE that eliminates 'Table not found' errors. Instantly parse queries, infer data types on the fly, and run relational execution loops completely in memory.",
              browserRequirements: "Requires WebAssembly support",
              softwareVersion: "2.1.0",
            }),
          }}
        />
      </head>
      <body>
        <ServiceWorkerRegistration />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

