import type { Metadata } from "next";
import "../styles/win95.css";

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
    apple: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
