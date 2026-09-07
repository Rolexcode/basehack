import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invariant Guard — Developer Integration",
  description:
    "A reusable intent guard for delayed share-denominated B20 instructions.",
};

const example = `// Server-side, read-only example inside this repository.
import { readStock } from "@/web/lib/base-reader";
import { guardIntent, WAD } from "@/web/lib/invariant";

// Metadata and multiplier are read at the same Base block.
// Change the ticker to another stock supported by readStock.
const stock = await readStock("NVDAc");
if (BigInt(stock.precision) !== WAD) {
  throw new Error("Unsupported multiplier precision");
}

// Amounts use the token's decimals. WAD scales multipliers only.
const tokenUnit = 10n ** BigInt(stock.decimals);
const quoteMultiplier = BigInt(stock.multiplier);

const decision = guardIntent({
  unit: "execution",
  amount: 2n * tokenUnit,        // exactly 2 share-equivalents
  quoteMultiplier,
  executionMultiplier: quoteMultiplier * 4n, // HYPOTHETICAL 4x change
  maxRawSpend: 3n * tokenUnit,    // at most 3 raw tokens
});

if (!decision.ok) {
  // cap exceeded or exact amount cannot be represented: do not transfer
  throw new Error(decision.reason ?? "Instruction blocked");
}

// rawToTransfer is already in raw token base units: do not rescale.
// This example calculates a decision. It submits no transaction.`;

export default function SdkPage() {
  return (
    <main className="container" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 980 }}>
      <Link href="/" className="text-link">← Back to the live lab</Link>
      <p className="eyebrow" style={{ marginTop: 48 }}>INVARIANT GUARD</p>
      <h1 style={{ fontSize: "clamp(44px, 7vw, 76px)", lineHeight: 0.98, letterSpacing: "-3px", marginTop: 16 }}>
        Keep the user&apos;s instruction intact.
      </h1>
      <p style={{ fontSize: 20, maxWidth: 720, marginTop: 24, color: "var(--muted)" }}>
        Invariant Guard is the reusable logic underneath the lab. An app tells it what the user authorized, the multiplier seen when the instruction was created, the multiplier seen at execution, and the user&apos;s maximum raw-token spend. The guard either returns an exact amount to use or blocks the instruction.
      </p>

      <section style={{ marginTop: 56, padding: 28, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }}>
        <p className="eyebrow">THE CONTRACT</p>
        <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
          <p><strong>1. Preserve the unit.</strong> “2 shares at execution” is not the same promise as “the raw position worth 2 shares when signed.”</p>
          <p><strong>2. Re-evaluate at execution.</strong> For execution-time share instructions, calculate the raw amount from the current multiplier when execution happens.</p>
          <p><strong>3. Fail closed.</strong> If the raw spend exceeds the user&apos;s cap or exact delivery is impossible because of rounding, transfer nothing.</p>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Start with the stock’s actual precision.</h2>
        <p style={{ marginTop: 16 }}>
          Run this server-side example within the repository. The reader supports
          the stocks listed in the lab and rejects unavailable or unsupported
          data. It uses a real snapshot, then simulates a 4× change; that change
          is not a live stock event or an execution quote.
        </p>
        <p style={{ marginTop: 16 }}>
          Token decimals and multiplier precision are separate. With 8 token
          decimals, 2 shares means 200,000,000 share base units. A 1× multiplier
          still means 1,000,000,000,000,000,000. In the simulated 1× → 4× case,
          the guard returns 50,000,000 raw base units: 0.5 raw tokens delivering
          exactly 2 share-equivalents. Read decimals for every asset; do not
          assume 8 or 18.
        </p>
        <pre style={{ marginTop: 16, padding: 24, overflowX: "auto", background: "#111915", color: "#f4f7f5", borderRadius: 12, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.65 }}>
          <code>{example}</code>
        </pre>
      </section>

      <section style={{ marginTop: 40, padding: 24, border: "1px solid var(--line)", borderRadius: 12 }}>
        <p className="eyebrow">SECURITY BOUNDARY</p>
        <p style={{ marginTop: 12 }}>
          This guard is intentionally pure logic. It does not sign orders, hold keys, approve tokens, submit transactions, or make a delayed action atomic by itself. A production execution layer must separately handle authentication, nonces, deadlines, cancellation, allowances, asset allowlists, transfer restrictions, replay protection, and same-transaction multiplier reads.
        </p>
        <p style={{ marginTop: 12 }}>
          For another app, provide amounts in that asset’s native base units and
          verified multipliers scaled by WAD. A cached HTTP snapshot is suitable
          for this demonstration, not authorization to transfer funds. The real
          executor must recheck the effective multiplier, cap, and exactness in
          the same transaction as the transfer.
        </p>
      </section>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 40 }}>
        <a className="text-link" href="https://github.com/Rolexcode/basehack/blob/main/web/lib/invariant.ts" target="_blank" rel="noreferrer">Read the guard source ↗</a>
        <a className="text-link" href="https://github.com/Rolexcode/basehack/blob/main/web/tests/invariant.test.ts" target="_blank" rel="noreferrer">Read the stress tests ↗</a>
      </div>
    </main>
  );
}
