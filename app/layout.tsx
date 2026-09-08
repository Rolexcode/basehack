import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invariant — Keep stock orders on track",
  description:
    "Invariant checks tokenized-stock orders again before execution so the amount and spending limits do not quietly change while the order waits.",
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
