"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Github,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  PRESETS,
  formatDecimal as fmt,
  simulate,
  type Experiment,
  type Preset,
} from "../lib/intent";
import { STOCKS, type StockSnapshot } from "../lib/stocks";
import styles from "./playground.module.css";

const REPO = "https://github.com/Rolexcode/basehack";

type Result = ReturnType<typeof simulate>;

const friendlyPreset: Record<Preset, { title: string; note: string }> = {
  split: {
    title: "Stock split",
    note: "See what happens when the stock representation increases before execution.",
  },
  reverse: {
    title: "Reverse split",
    note: "See Invariant stop an order that now exceeds the user’s spending limit.",
  },
  rounding: {
    title: "Exact amount",
    note: "If the exact amount cannot be delivered, Invariant stops instead of rounding silently.",
  },
  control: {
    title: "No change",
    note: "When nothing changes, both paths should produce the same result.",
  },
};

export default function Playground() {
  const [preset, setPreset] = useState<Preset>("split");
  const [draft, setDraft] = useState<Experiment>(PRESETS.split);
  const [applied, setApplied] = useState<Experiment>(PRESETS.split);
  const [result, setResult] = useState<Result>(() => simulate(PRESETS.split));
  const [error, setError] = useState("");
  const [ticker, setTicker] = useState("NVDAc");
  const [snapshot, setSnapshot] = useState<StockSnapshot | null>(null);
  const [stockError, setStockError] = useState("");
  const [loadingStock, setLoadingStock] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);

  useEffect(() => {
    const key = window.location.hash.slice(1) as Preset;
    if (Object.hasOwn(PRESETS, key)) applyPreset(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyPreset(key: Preset) {
    const next = PRESETS[key];
    setPreset(key);
    setDraft(next);
    setApplied(next);
    setResult(simulate(next));
    setError("");
    window.history.replaceState(null, "", `#${key}`);
  }

  function checkOrder(event: React.FormEvent) {
    event.preventDefault();
    try {
      const next = simulate(draft);
      setApplied({ ...draft });
      setResult(next);
      setError("");
      window.history.replaceState(null, "", "#check");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check the order details and try again.");
    }
  }

  async function readStock() {
    setLoadingStock(true);
    setStockError("");
    setSnapshot(null);
    try {
      const res = await fetch(`/api/stocks?ticker=${encodeURIComponent(ticker)}`, {
        cache: "no-store",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not read this stock from Base.");
      setSnapshot(body);
    } catch (err) {
      setStockError(err instanceof Error ? err.message : "Could not read this stock from Base.");
    } finally {
      setLoadingStock(false);
    }
  }

  const blocked = Boolean(result.rejection);
  const safeValue = blocked ? "Stopped" : fmt(result.deliveredUI);
  const naiveValue = fmt(result.naiveUI);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span>≠</span> invariant
        </Link>
        <nav>
          <Link href="/manifest">Order record</Link>
          <Link href="/sdk">Developers</Link>
          <a href={REPO} target="_blank" rel="noreferrer">
            <Github size={15} /> GitHub
          </a>
        </nav>
      </header>

      <section className={styles.appIntro}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={15} /> Back home
        </Link>
        <div>
          <p className={styles.eyebrow}>ORDER CHECK</p>
          <h1>See what your stock order becomes before it goes through.</h1>
          <p>
            Choose a scenario, set the amount and limit, then compare an old cached conversion with Invariant’s execution-time check.
          </p>
        </div>
      </section>

      <section className={styles.scenarioSection}>
        <div className={styles.scenarioTabs}>
          {(Object.keys(PRESETS) as Preset[]).map((key) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              data-active={preset === key}
              type="button"
            >
              <span>{PRESETS[key].short}</span>
              {friendlyPreset[key].title}
            </button>
          ))}
        </div>
        <p className={styles.scenarioNote}>{friendlyPreset[preset].note}</p>
      </section>

      <section className={styles.checker} id="check">
        <form className={styles.formCard} onSubmit={checkOrder}>
          <div className={styles.cardTitle}>
            <div>
              <span>YOUR ORDER</span>
              <strong>Set the terms</strong>
            </div>
            <button type="button" onClick={() => applyPreset(preset)} aria-label="Reset order">
              <RotateCcw size={16} />
            </button>
          </div>

          <label htmlFor="amount">How many shares?</label>
          <input
            id="amount"
            value={draft.amount}
            inputMode="decimal"
            onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
          />

          <div className={styles.fieldGrid}>
            <div>
              <label htmlFor="before">When the order is set</label>
              <div className={styles.suffixField}>
                <input
                  id="before"
                  value={draft.before}
                  inputMode="decimal"
                  onChange={(e) => setDraft({ ...draft, before: e.target.value })}
                />
                <span>×</span>
              </div>
            </div>
            <div>
              <label htmlFor="after">When it goes through</label>
              <div className={styles.suffixField}>
                <input
                  id="after"
                  value={draft.after}
                  inputMode="decimal"
                  onChange={(e) => setDraft({ ...draft, after: e.target.value })}
                />
                <span>×</span>
              </div>
            </div>
          </div>

          <label htmlFor="cap">Your spending limit</label>
          <input
            id="cap"
            value={draft.cap}
            inputMode="decimal"
            onChange={(e) => setDraft({ ...draft, cap: e.target.value })}
          />
          <p className={styles.fieldHelp}>Invariant stops the order if keeping your requested amount would exceed this limit.</p>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.checkButton} type="submit">
            Check order <ArrowRight size={17} />
          </button>
          {dirty && !error && (
            <p className={styles.fieldHelp}>Order details changed. Check the order to update the result.</p>
          )}
        </form>

        <div className={styles.resultsCard} aria-live="polite">
          <div className={styles.resultHeader}>
            <div>
              <span>YOU ASKED FOR</span>
              <strong>{fmt(result.amount)} shares</strong>
            </div>
            <span className={styles.changeChip}>{applied.before}× → {applied.after}×</span>
          </div>

          <div className={styles.resultGrid}>
            <article className={styles.oldPath}>
              <p>WITHOUT THE CHECK</p>
              <strong data-testid="naive-amount">{naiveValue}</strong>
              <span>shares</span>
              <div className={result.naiveMatches ? styles.goodState : styles.badState}>
                {result.naiveMatches ? <Check size={15} /> : <X size={15} />}
                {result.naiveMatches ? "Order still matches" : "Order changed"}
              </div>
            </article>

            <article className={styles.safePath}>
              <p>WITH INVARIANT</p>
              <strong data-testid="safe-amount">{safeValue}</strong>
              {!blocked && <span>shares</span>}
              <div className={blocked ? styles.blockState : styles.goodState}>
                {blocked ? <LockKeyhole size={15} /> : <Check size={15} />}
                {blocked
                  ? result.rejection === "cap"
                    ? "Your limit was protected"
                    : "Exact amount could not be delivered"
                  : "Same order, still intact"}
              </div>
            </article>
          </div>

          <div className={styles.timeline}>
            <div><span>1</span><p>Order set<strong>{fmt(result.quotedRaw)} raw</strong></p></div>
            <ArrowRight size={15} />
            <div><span>2</span><p>Stock changes<strong>{applied.before}× → {applied.after}×</strong></p></div>
            <ArrowRight size={15} />
            <div><span>3</span><p>Invariant checks<strong>{blocked ? "Order stopped" : "Order kept"}</strong></p></div>
          </div>

          <details className={styles.details}>
            <summary>See the calculation</summary>
            <div className={styles.detailGrid}>
              <div><span>Cached raw amount</span><strong>{fmt(result.quotedRaw)}</strong></div>
              <div><span>Required raw amount now</span><strong>{fmt(result.requiredRaw)}</strong></div>
              <div><span>Your limit</span><strong>{fmt(result.cap)}</strong></div>
              <div><span>Raw amount Invariant would use</span><strong>{fmt(result.rawSpent)}</strong></div>
            </div>
          </details>
        </div>
      </section>

      <section className={styles.baseSection} id="live">
        <div className={styles.baseCopy}>
          <p className={styles.eyebrow}>LIVE BASE DATA</p>
          <h2>See the stock behind the order.</h2>
          <p>Read current tokenized-stock information directly from Base. No wallet connection is needed.</p>
        </div>
        <div className={styles.baseCard}>
          <div className={styles.stockPicker}>
            <select aria-label="Stock" value={ticker} onChange={(e) => setTicker(e.target.value)}>
              {STOCKS.map((stock) => (
                <option value={stock.ticker} key={stock.ticker}>{stock.company} · {stock.ticker}</option>
              ))}
            </select>
            <button type="button" onClick={readStock} disabled={loadingStock}>
              {loadingStock ? "Reading…" : "Read from Base"}
            </button>
          </div>

          {stockError && <p className={styles.error}>{stockError}</p>}
          {!snapshot && !stockError && <p className={styles.emptyState}>Choose a stock and read its current Base data.</p>}
          {snapshot && (
            <div className={styles.stockResult}>
              <div className={styles.stockTop}>
                <div className={styles.stockLogo}>{snapshot.company.slice(0, 1)}</div>
                <div><strong>{snapshot.symbol}</strong><span>{snapshot.company}</span></div>
                <span className={styles.verified}><Check size={13} /> Base mainnet</span>
              </div>
              <div className={styles.stockStats}>
                <div><span>Current multiplier</span><strong>{snapshot.multiplier}</strong></div>
                <div><span>Block</span><strong>{snapshot.blockNumber}</strong></div>
                <div><span>2 shares → raw</span><strong>{snapshot.rawForTwo}</strong></div>
              </div>
              <a href={`https://basescan.org/token/${snapshot.address}`} target="_blank" rel="noreferrer" className={styles.sourceLink}>
                View token on BaseScan <ArrowUpRight size={14} />
              </a>
            </div>
          )}
        </div>
      </section>

      <section className={styles.nextSection}>
        <div className={styles.nextCard}>
          <ShieldCheck size={22} />
          <div>
            <span>KEEP THE ORDER WITH IT</span>
            <h2>Turn these terms into an order record.</h2>
            <p>Carry the stock, amount, spending limit and exact-or-stop rule together.</p>
          </div>
          <Link href="/manifest">Create order record <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link href="/" className={styles.brand}><span>≠</span> invariant</Link>
        <p>Your order. Your terms.</p>
        <a href={REPO} target="_blank" rel="noreferrer">Source <ArrowUpRight size={14} /></a>
      </footer>
    </main>
  );
}
