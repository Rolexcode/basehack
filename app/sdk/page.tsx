import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invariant Guard — Developer Integration",
  description:
    "A reusable intent guard for delayed share-denominated B20 instructions.",
};

const example = `// Read current stock metadata from Base.
import { readStock } from "@/web/lib/base-reader";
import { guardIntent, WAD } from "@/web/lib/invariant";

const stock = await readStock("NVDAc");
if (BigInt(stock.precision) !== WAD) {
  throw new Error("Unsupported multiplier precision");
}

// Token amounts use the asset's decimals. Multipliers use WAD precision.
const tokenUnit = 10n ** BigInt(stock.decimals);
const quoteMultiplier = BigInt(stock.multiplier);

const decision = guardIntent({
  unit: "execution",
  amount: 2n * tokenUnit,
  quoteMultiplier,
  executionMultiplier: quoteMultiplier * 4n, // illustrative change
  maxRawSpend: 3n * tokenUnit,
});

if (!decision.ok) {
  throw new Error(decision.reason ?? "Instruction blocked");
}

// decision.rawToTransfer is in the asset's raw base units.`;

export default function SdkPage() {
  return (
    <main className="container" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 980 }}>
      <Link href="/" className="text-link">← Back to Invariant</Link>

      <p className="eyebrow" style={{ marginTop: 48 }}>INVARIANT GUARD</p>
      <h1 style={{ fontSize: "clamp(44px, 7vw, 76px)", lineHeight: 0.98, letterSpacing: "-3px", marginTop: 16 }}>
        Keep the user&apos;s instruction intact.
      </h1>
      <p style={{ fontSize: 20, maxWidth: 760, marginTop: 24, color: "var(--muted)" }}>
        Invariant Guard is the reusable decision layer behind the Order Check. An app provides the user&apos;s intended unit, the multiplier seen when the instruction was created, the multiplier visible at execution and the maximum raw-token spend. The guard returns an exact amount to use or blocks the instruction.
      </p>

      <section style={{ marginTop: 56, padding: 28, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20 }}>
        <p className="eyebrow">INTEGRATION CONTRACT</p>
        <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
          <p><strong>1. Preserve the unit.</strong> “2 shares at execution” is not the same instruction as “the raw position worth 2 shares when authorized.”</p>
          <p><strong>2. Re-evaluate at execution.</strong> For execution-time share instructions, calculate the raw amount from the current multiplier when execution happens.</p>
          <p><strong>3. Fail closed.</strong> If the raw spend exceeds the user&apos;s cap or exact delivery is impossible because of rounding, transfer nothing.</p>
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 34, letterSpacing: "-1.5px" }}>Use the stock&apos;s actual precision.</h2>
        <p style={{ marginTop: 16, color: "var(--muted)" }}>
          The repository&apos;s Base reader returns the token decimals, multiplier and WAD precision from one block. The example below starts from a real read and then applies an illustrative 4× multiplier change so the guard path can be inspected without implying that the change occurred on the live asset.
        </p>
        <p style={{ marginTop: 16, color: "var(--muted)" }}>
          Token decimals and multiplier precision are separate. Read decimals for every asset; do not assume 8 or 18. Amounts passed to the guard are native token base units, while B20 multipliers use WAD precision.
        </p>
        <pre style={{ marginTop: 18, padding: 24, overflowX: "auto", background: "#0b1020", color: "#f4f7ff", borderRadius: 18, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.65 }}>
          <code>{example}</code>
        </pre>
      </section>

      <section style={{ marginTop: 40, padding: 24, background: "#f8faff", border: "1px solid var(--line)", borderRadius: 20 }}>
        <p className="eyebrow">SECURITY BOUNDARY</p>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>
          The guard is pure logic. It does not sign orders, hold keys, approve tokens or submit transactions. A production execution layer must separately handle authentication, nonces, deadlines, cancellation, allowances, asset allowlists, transfer restrictions, replay protection and same-transaction multiplier enforcement.
        </p>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>
          A cached HTTP snapshot is useful for previews and read-only checks, not as authorization to move funds. A real executor must re-check the effective multiplier, spending cap and exactness in the same transaction as the transfer.
        </p>
      </section>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 36 }}>
        <Link className="text-link" href="/playground">Open Order Check →</Link>
        <Link className="text-link" href="/manifest">Create an Order Record →</Link>
        <a className="text-link" href="https://github.com/Rolexcode/basehack/blob/main/web/lib/invariant.ts" target="_blank" rel="noreferrer">Guard source ↗</a>
        <a className="text-link" href="https://github.com/Rolexcode/basehack/blob/main/web/tests/invariant.test.ts" target="_blank" rel="noreferrer">Guard tests ↗</a>
      </div>
    </main>
  );
}
