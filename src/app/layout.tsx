import type { Metadata } from "next";
import "../styles/win95.css";

export const metadata: Metadata = {
  title: "ExNihilo 95 — Zero-Config SQL IDE",
  description: "The SQL database environment with zero 'table not found' errors. Automatic schema inference and synthetic data generation inside your browser.",
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
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
