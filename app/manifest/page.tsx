import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ManifestBuilder from "@/web/components/manifest-builder";

export const metadata: Metadata = {
  title: "Invariant Order Record",
  description:
    "Keep a tokenized-stock order's asset, amount, spending limit and exact-or-stop rule together on Base.",
};

export default function ManifestPage() {
  return (
    <main style={{ background: "linear-gradient(180deg,#f8faff 0%,#fff 42%)", minHeight: "100vh" }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 96, maxWidth: 1080 }}>
        <Link href="/playground" className="text-link">
          <ArrowLeft size={15} /> Back to order check
        </Link>

        <section style={{ paddingTop: 58, paddingBottom: 38 }}>
          <p className="eyebrow">ORDER RECORD</p>
          <h1 style={{ fontFamily: "Sora, var(--sans)", fontSize: "clamp(48px, 7vw, 82px)", lineHeight: 0.96, letterSpacing: "-4.5px", marginTop: 16, maxWidth: 850 }}>
            Keep your order details together.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, maxWidth: 760, marginTop: 24, color: "var(--muted)" }}>
            Pick the stock, amount and spending limit. Invariant gives those exact terms one ID so an app can check the same order again when execution happens.
          </p>
        </section>

        <ManifestBuilder />

        <section style={{ marginTop: 28, padding: 22, background: "#f7f9fc", border: "1px solid var(--line)", borderRadius: 20 }}>
          <p className="eyebrow">FOR BUILDERS</p>
          <p style={{ marginTop: 10, color: "var(--muted)", maxWidth: 800 }}>
            The order ID identifies these exact fields. It is not a wallet signature or trade authorization. Apps still need their normal authentication and execution checks.
          </p>
          <Link href="/sdk" className="text-link" style={{ marginTop: 14 }}>
            See developer integration <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </main>
  );
}
