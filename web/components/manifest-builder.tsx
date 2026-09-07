"use client";

import { useEffect, useMemo, useState } from "react";
import { createIntentManifest, type IntentManifestEnvelope } from "../lib/manifest";
import { STOCKS, type StockSnapshot } from "../lib/stocks";

export default function ManifestBuilder() {
  const [ticker, setTicker] = useState("NVDAc");
  const [shares, setShares] = useState("2");
  const [cap, setCap] = useState("3");
  const [snapshot, setSnapshot] = useState<StockSnapshot | null>(null);
  const [manifest, setManifest] = useState<IntentManifestEnvelope | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const stock = useMemo(() => STOCKS.find((item) => item.ticker === ticker)!, [ticker]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setStatus("");
    setManifest(null);
    fetch(`/api/stocks?ticker=${encodeURIComponent(ticker)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not read Base.");
        return body as StockSnapshot;
      })
      .then(setSnapshot)
      .catch(() => {
        if (!controller.signal.aborted) {
          setSnapshot(null);
          setStatus("Live Base read unavailable. Retry in a moment.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [ticker]);

  async function generate() {
    if (!snapshot) return;
    try {
      const next = await createIntentManifest({
        chainId: snapshot.chainId,
        ticker: snapshot.ticker,
        address: snapshot.address,
        decimals: snapshot.decimals,
        requestedShares: shares,
        maxRawSpend: cap,
      });
      setManifest(next);
      setStatus("Intent manifest created from the verified Base asset snapshot.");
    } catch (error) {
      setManifest(null);
      setStatus(error instanceof Error ? error.message : "Could not create manifest.");
    }
  }

  async function copyManifest() {
    if (!manifest) return;
    await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setStatus("Manifest copied.");
  }

  function downloadManifest() {
    if (!manifest) return;
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${manifest.id.slice(0, 24)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Manifest downloaded.");
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ display: "grid", gap: 18, padding: 28, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }}>
        <div>
          <p className="eyebrow">1 / CHOOSE THE STOCK</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            {STOCKS.map((item) => (
              <button key={item.ticker} onClick={() => setTicker(item.ticker)} aria-pressed={ticker === item.ticker} style={{ padding: "10px 14px", border: "1px solid var(--line)", background: ticker === item.ticker ? "var(--blue-soft)" : "var(--surface)" }}>
                <strong>{item.ticker}</strong> · {item.company}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: 16, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 8 }}>
          {loading ? (
            <p>Reading {ticker} from Base…</p>
          ) : snapshot ? (
            <div style={{ display: "grid", gap: 6 }}>
              <strong>{snapshot.symbol} verified on Base mainnet</strong>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, overflowWrap: "anywhere" }}>{snapshot.address}</span>
              <span style={{ color: "var(--muted)" }}>Decimals {snapshot.decimals} · Block {snapshot.blockNumber}</span>
            </div>
          ) : (
            <p>{status || `Could not read ${stock.ticker}.`}</p>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span>Requested shares</span>
            <input value={shares} onChange={(event) => setShares(event.target.value)} inputMode="decimal" maxLength={80} />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <span>Maximum raw-token spend</span>
            <input value={cap} onChange={(event) => setCap(event.target.value)} inputMode="decimal" maxLength={80} />
          </label>
        </div>

        <div style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 8 }}>
          <strong>Policy: exact delivery or block</strong>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>The manifest records the user’s promise. It does not contain or predict a future multiplier.</p>
        </div>

        <button className="primary" onClick={generate} disabled={!snapshot || loading} style={{ padding: "14px 18px", border: 0 }}>
          Create intent manifest
        </button>
        {status && <p role="status" style={{ color: "var(--muted)" }}>{status}</p>}
      </section>

      {manifest && (
        <section style={{ padding: 28, background: "#111915", color: "#f4f7f5", borderRadius: 12 }}>
          <p className="eyebrow" style={{ color: "#aeb8b2" }}>INVARIANT INTENT MANIFEST</p>
          <h2 style={{ marginTop: 12, color: "#fff" }}>The promise now has an ID.</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
            <p><strong>Stock:</strong> {manifest.manifest.asset.ticker}</p>
            <p><strong>Instruction:</strong> exactly {shares} shares at execution</p>
            <p><strong>Maximum spend:</strong> {cap} raw tokens</p>
            <p><strong>Policy:</strong> exact-or-block</p>
            <p style={{ overflowWrap: "anywhere" }}><strong>Intent ID:</strong> <code>{manifest.id}</code></p>
          </div>
          <p style={{ marginTop: 18, color: "#aeb8b2" }}>
            SHA-256 identifies these exact fields. This is a deterministic hash, not a wallet signature or authorization.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
            <button onClick={copyManifest} style={{ padding: "10px 14px" }}>Copy manifest</button>
            <button onClick={downloadManifest} style={{ padding: "10px 14px" }}>Download JSON</button>
          </div>
        </section>
      )}
    </div>
  );
}
