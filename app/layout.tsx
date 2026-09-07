import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invariant Lab — Execute what the user meant.",
  description:
    "An interactive B20 intent lab. Reproduce stale share conversions, spending limits and exactness guards, with read-only Coinbase stock data on Base.",
  other: {
    "base:app_id": "6a9ebc7825fe83ce38216f75",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
