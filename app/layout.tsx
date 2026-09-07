import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invariant Lab — You asked for 2 shares.",
  description:
    "You asked for 2 shares. Invariant checks for exact delivery or blocks the instruction. Try the developer guard with simulated splits and live read-only Base stock data.",
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
