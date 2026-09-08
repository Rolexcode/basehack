import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invariant — Execute what the user meant.",
  description:
    "Invariant preserves tokenized-stock instructions through execution with exact-or-block intent guards, deterministic manifests, and read-only Base stock context.",
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
