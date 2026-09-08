"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Copy, Download, ShieldCheck } from "lucide-react";
import { createIntentManifest, type IntentManifestEnvelope } from "../lib/manifest";
import { formatDecimal } from "../lib/intent";
import { STOCKS, type StockSnapshot } from "../lib/stocks";
import styles from "./manifest-builder.module.css";

export default function ManifestBuilder() {
  const [ticker, setTicker] = useState("NVDAc");
  const [shares, setShares] = useState("2");
  const [cap, setCap] = useState("3");
  const [snapshot, setSnapshot] = useState<StockSnapshot | null>(null);
  const [manifest, setManifest] = useState<IntentManifestEnvelope | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const stock = useMemo(() => STOCKS.find((item) => item.ticker === ticker)!, [ticker]);

  function updateAmount(setter: (value: string) => void, value: string) {
    setter(value);
    setManifest(null);
    setStatus("");
  }

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
          setStatus("Base data is unavailable right now. Try again in a moment.");
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
      setStatus("Order record created.");
    } catch (error) {
      setManifest(null);
      setStatus(error instanceof Error ? error.message : "Could not create the order record.");
    }
  }

  async function copyManifest() {
    if (!manifest) return;
    await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setStatus("Order record copied.");
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
    setStatus("Order record downloaded.");
  }

  return (
    <div className={styles.builder}>
      <section className={styles.card}>
        <div className={styles.stepHead}>
          <span>01 / CHOOSE THE STOCK</span>
          <b>BASE MAINNET</b>
        </div>

        <div className={styles.stockGrid}>
          {STOCKS.map((item) => (
            <button
              key={item.ticker}
              onClick={() => setTicker(item.ticker)}
              data-active={ticker === item.ticker}
              className={styles.stockButton}
              type="button"
            >
              <strong>{item.ticker}</strong>
              <small>{item.company}</small>
            </button>
          ))}
        </div>

        <div className={styles.stockMeta}>
          {loading ? (
            <p className={styles.loading}>Reading {ticker} from Base…</p>
          ) : snapshot ? (
            <>
              <div className={styles.stockMetaTop}>
                <div className={styles.stockLogo}>{snapshot.company.slice(0, 1)}</div>
                <div className={styles.stockMetaText}>
                  <strong>{snapshot.symbol}</strong>
                  <span>{snapshot.company}</span>
                </div>
                <span className={styles.verified}><Check size={13} /> Verified on Base</span>
              </div>
              <p className={styles.address}>{snapshot.address}</p>
            </>
          ) : (
            <p className={styles.error}>{status || `Could not read ${stock.ticker}.`}</p>
          )}
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>How many shares?</span>
            <input value={shares} onChange={(event) => updateAmount(setShares, event.target.value)} inputMode="decimal" maxLength={80} />
          </label>
          <label className={styles.field}>
            <span>Your spending limit</span>
            <input value={cap} onChange={(event) => updateAmount(setCap, event.target.value)} inputMode="decimal" maxLength={80} />
          </label>
        </div>

        <div className={styles.policy}>
          <span className={styles.policyIcon}><ShieldCheck size={18} /></span>
          <div>
            <strong>Exact amount — or stop</strong>
            <p>Invariant keeps your stock, amount and spending limit together so the order cannot quietly become something else later.</p>
          </div>
        </div>

        <button className={styles.createButton} onClick={generate} disabled={!snapshot || loading}>
          Create order record <ArrowRight size={17} />
        </button>
        {status && !manifest && <p role="status" className={styles.status}>{status}</p>}
      </section>

      {manifest && (
        <section className={styles.result}>
          <div className={styles.resultHead}>
            <span>INVARIANT ORDER RECORD</span>
            <span className={styles.ready}><Check size={12} /> READY</span>
          </div>
          <h2>Your order now has an ID.</h2>
          <p className={styles.resultSub}>These exact terms can now travel together instead of being rebuilt later from memory or stale data.</p>

          <div className={styles.summary}>
            <div><span>STOCK</span><strong>{manifest.manifest.asset.ticker}</strong></div>
            <div><span>SHARES</span><strong>{formatDecimal(BigInt(manifest.manifest.intent.requestedShareBaseUnits), manifest.manifest.asset.decimals)}</strong></div>
            <div><span>SPENDING LIMIT</span><strong>{formatDecimal(BigInt(manifest.manifest.intent.maxRawSpendBaseUnits), manifest.manifest.asset.decimals)} raw</strong></div>
            <div><span>RULE</span><strong>Exact / stop</strong></div>
          </div>

          <div className={styles.idBox}>
            <span>ORDER ID</span>
            <code>{manifest.id}</code>
          </div>

          <p className={styles.resultNote}>The ID is a deterministic hash of these fields. It is not a wallet signature or trade authorization.</p>

          <div className={styles.actions}>
            <button onClick={copyManifest}><Copy size={15} /> Copy record</button>
            <button onClick={downloadManifest}><Download size={15} /> Download JSON</button>
          </div>
          {status && <p role="status" className={styles.status}>{status}</p>}
        </section>
      )}
    </div>
  );
}
