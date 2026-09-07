import type { Metadata } from "next";
import Link from "next/link";
import ManifestBuilder from "@/web/components/manifest-builder";

export const metadata: Metadata = {
  title: "Invariant Intent Manifest",
  description:
    "Turn an exact share instruction into a deterministic, machine-readable promise for stock apps on Base.",
};

export default function ManifestPage() {
  return (
    <main className="container" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 980 }}>
      <Link href="/" className="text-link">← Back to Invariant Lab</Link>
      <p className="eyebrow" style={{ marginTop: 48 }}>INVARIANT INTENT MANIFEST</p>
      <h1 style={{ fontSize: "clamp(44px, 7vw, 76px)", lineHeight: 0.98, letterSpacing: "-3px", marginTop: 16 }}>
        Make the promise machine-readable.
      </h1>
      <p style={{ fontSize: 20, maxWidth: 760, marginTop: 24, marginBottom: 40, color: "var(--muted)" }}>
        A user says “deliver exactly 2 shares.” Invariant turns that promise into a deterministic manifest tied to the Base asset, requested amount, spending ceiling, and exact-or-block policy. Later execution data is checked against the promise instead of replacing it.
      </p>
      <ManifestBuilder />
      <section style={{ marginTop: 40, padding: 24, border: "1px solid var(--line)", borderRadius: 12 }}>
        <p className="eyebrow">BOUNDARY</p>
        <p style={{ marginTop: 12 }}>
          The manifest is evidence of the fields the application intends to preserve. Its SHA-256 ID is not a signature, consent proof, trade authorization, or guarantee of execution. A production executor must authenticate the user and enforce the manifest together with replay protection, deadlines, transfer restrictions, allowances, and same-transaction multiplier checks.
        </p>
      </section>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 32 }}>
        <Link className="text-link" href="/sdk">Developer integration →</Link>
        <a className="text-link" href="https://github.com/Rolexcode/basehack/blob/main/web/lib/manifest.ts" target="_blank" rel="noreferrer">Manifest source ↗</a>
      </div>
    </main>
  );
}
