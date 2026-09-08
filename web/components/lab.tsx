"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  Code2,
  Download,
  FlaskConical,
  Github,
  LockKeyhole,
  Play,
  RotateCcw,
  ShieldCheck,
  X,
  CircleHelp,
} from "lucide-react";
import {
  PRESETS,
  simulate,
  formatDecimal as fmt,
  type Experiment,
  type IntentUnit,
  type Preset,
} from "../lib/intent";
import { STOCKS, STOCK_SOURCE, type StockSnapshot } from "../lib/stocks";

const REPO = "https://github.com/Rolexcode/basehack";
const unitNames: Record<IntentUnit, string> = {
  execution: "Shares at execution",
  position: "Position at authorization",
  raw: "Fixed raw tokens",
};
const unitNotes: Record<IntentUnit, string> = {
  execution:
    "Deliver this exact number of share-equivalents when the instruction executes.",
  position:
    "Preserve the raw position represented by these shares when authorized. Its later share-equivalent value can change.",
  raw: "Transfer this exact number of raw tokens. The instruction makes no promise about share-equivalents.",
};
type Result = ReturnType<typeof simulate>;

export default function Lab() {
  const [preset, setPreset] = useState<Preset>("split");
  const [draft, setDraft] = useState<Experiment>(PRESETS.split);
  const [applied, setApplied] = useState<Experiment>(PRESETS.split);
  const [result, setResult] = useState<Result>(() => simulate(PRESETS.split));
  const [error, setError] = useState("");
  const [stage, setStage] = useState(3);
  const [liveSeed, setLiveSeed] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [snapshot, setSnapshot] = useState<StockSnapshot | null>(null);
  const [downloadMessage, setDownloadMessage] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  const running = stage < 3;
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  function cancelRun() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  function choosePreset(key: Preset) {
    cancelRun();
    setPreset(key);
    setDraft(PRESETS[key]);
    setApplied(PRESETS[key]);
    setResult(simulate(PRESETS[key]));
    setStage(3);
    setError("");
    setLiveSeed("");
    window.history.replaceState(null, "", `#${key}`);
  }
  useEffect(() => {
    const key = window.location.hash.slice(1);
    if (Object.hasOwn(PRESETS, key)) {
      const p = PRESETS[key as Preset];
      setPreset(key as Preset);
      setDraft(p);
      setApplied(p);
      setResult(simulate(p));
    }
  }, []);
  function run(event: React.FormEvent) {
    event.preventDefault();
    try {
      const next = simulate(draft);
      cancelRun();
      setError("");
      setApplied({ ...draft });
      setResult(next);
      if (dirty) window.history.replaceState(null, "", "#experiment");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setStage(3);
        return;
      }
      setStage(0);
      timers.current = [
        setTimeout(() => setStage(1), 350),
        setTimeout(() => setStage(2), 950),
        setTimeout(() => setStage(3), 1650),
      ];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Check the entered amounts.",
      );
    }
  }
  function seedFromLive(data: StockSnapshot) {
    const next: Experiment = {
      amount: "2",
      before: fmt(BigInt(data.multiplier)),
      after: fmt(BigInt(data.multiplier) * 4n),
      cap: "3",
      unit: "execution",
    };
    cancelRun();
    setDraft(next);
    setApplied(next);
    setResult(simulate(next));
    setStage(3);
    setError("");
    setPreset("split");
    setLiveSeed(
      `${data.symbol} · block ${data.blockNumber}. The subsequent 4× change is hypothetical; lab uses 18-decimal amounts.`,
    );
    window.history.replaceState(null, "", "#experiment");
    document
      .getElementById("experiment")
      ?.scrollIntoView({ behavior: "smooth" });
  }
  function download() {
    const report = {
      project: "Invariant Lab",
      generatedAt: new Date().toISOString(),
      evidence:
        "Browser integer simulation, not a transaction or EVM execution",
      input: applied,
      result,
      liveSeed: liveSeed || null,
      independentLiveReference: snapshot,
      source: REPO,
      limitations:
        "Reference research fixtures. No production vulnerability claim. No order authorization or execution supplied by this report.",
    };
    const blob = new Blob(
      [
        JSON.stringify(
          report,
          (_, value) => (typeof value === "bigint" ? value.toString() : value),
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invariant-experiment.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadMessage("Experiment report downloaded.");
  }
  const requestedUnit =
    applied.unit === "raw" ? "raw tokens" : "share-equivalents";
  return (
    <>
      <a className="skip" href="#experiment">
        Skip to experiment
      </a>
      <header className="container header">
        <a href="#" className="wordmark" aria-label="Invariant Lab home">
          <span className="mark" aria-hidden="true">
            ≠
          </span>{" "}
          invariant<span className="lab-tag">LAB</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#experiment">Experiment</a>
          <a href="#live">Onchain reads</a>
          <a href="/manifest">Manifest</a>
          <a
            className="github-link"
            href={REPO}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={16} aria-hidden="true" /> Source{" "}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </header>
      <main>
        <section className="container hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="base-square" /> FOR STOCK APPS ON BASE
            </p>
            <h1>
              You asked for
              <br />
              <span>2 shares.</span>
            </h1>
            <p className="hero-description">
              Invariant checks that you receive exactly 2—or blocks the
              instruction. See how apps can preserve what you asked for when
              a stock split happens before execution.
            </p>
            <a href="#experiment" className="text-link">
              Try the experiment <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>
          <div
            className="hero-proof"
            aria-label="Example: 2 share-equivalents intended. Cached conversion delivers 8; Invariant delivers 2."
          >
            <div className="proof-heading">
              <span className="eyebrow">THE SAME INSTRUCTION.</span>
              <span className="tiny">SIMULATED 1× → 4×</span>
            </div>
            <div className="proof-intent">
              <span>“Deliver 2 shares.”</span>
              <LockKeyhole size={18} aria-hidden="true" />
            </div>
            <div className="proof-paths">
              <div>
                <span className="tiny">CACHED CONVERSION</span>
                <strong className="bad-text">
                  8<span>shares</span>
                </strong>
                <span className="proof-caption">
                  <X size={14} aria-hidden="true" /> Intent changed
                </span>
              </div>
              <div>
                <span className="tiny">INVARIANT</span>
                <strong className="good-text">
                  2<span>shares</span>
                </strong>
                <span className="proof-caption">
                  <Check size={14} aria-hidden="true" /> Intent preserved
                </span>
              </div>
            </div>
            <p className="proof-foot">
              Shares = displayed share-equivalents. Raw token balances stay
              unchanged by the multiplier update.
            </p>
          </div>
        </section>

        <section id="experiment" className="container experiment-section">
          <div className="section-top">
            <div>
              <span className="eyebrow">01 / THE EXPERIMENT</span>
              <h2>One intent. Two outcomes.</h2>
            </div>
            <span className="mode-label">
              <FlaskConical size={15} aria-hidden="true" /> Interactive
              simulation
            </span>
          </div>
          <div className="preset-bar" aria-label="Example scenarios">
            {Object.entries(PRESETS).map(([key, item]) => (
              <button
                key={key}
                aria-pressed={preset === key}
                onClick={() => choosePreset(key as Preset)}
              >
                <span>{item.short}</span>
                {item.name}
                {preset === key && <ArrowDown size={14} aria-hidden="true" />}
              </button>
            ))}
          </div>
          <div className="experiment-grid">
            <form className="control-panel" onSubmit={run}>
              <div className="panel-caption">
                <span className="eyebrow">DEFINE THE PROMISE</span>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Reset current scenario"
                  onClick={() => choosePreset(preset)}
                >
                  <RotateCcw size={15} aria-hidden="true" />
                </button>
              </div>
              <label htmlFor="intent">The user means</label>
              <select
                id="intent"
                value={draft.unit}
                onChange={(e) =>
                  setDraft({ ...draft, unit: e.target.value as IntentUnit })
                }
              >
                {Object.entries(unitNames).map(([unit, name]) => (
                  <option key={unit} value={unit}>
                    {name}
                  </option>
                ))}
              </select>
              <p className="field-note">{unitNotes[draft.unit]}</p>
              <label htmlFor="amount">
                Requested{" "}
                {draft.unit === "raw" ? "raw tokens" : "share-equivalents"}
              </label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                maxLength={80}
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                aria-describedby={error ? "input-error" : undefined}
                aria-invalid={!!error}
              />
              <div className="input-pair">
                <div>
                  <label htmlFor="before">Multiplier at quote</label>
                  <div className="suffix-input">
                    <input
                      id="before"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      maxLength={80}
                      value={draft.before}
                      onChange={(e) =>
                        setDraft({ ...draft, before: e.target.value })
                      }
                    />
                    <span>×</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="after">At execution</label>
                  <div className="suffix-input">
                    <input
                      id="after"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      maxLength={80}
                      value={draft.after}
                      onChange={(e) =>
                        setDraft({ ...draft, after: e.target.value })
                      }
                    />
                    <span>×</span>
                  </div>
                </div>
              </div>
              <label htmlFor="cap">Maximum raw-token spend</label>
              <input
                id="cap"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                maxLength={80}
                value={draft.cap}
                onChange={(e) => setDraft({ ...draft, cap: e.target.value })}
              />
              <p className="field-note">
                Invariant stops if the required transfer exceeds this limit.
              </p>
              {error && (
                <p id="input-error" role="alert" className="input-error">
                  {error}
                </p>
              )}
              <button
                className="primary run-button"
                disabled={running}
                aria-busy={running}
              >
                <Play size={15} fill="currentColor" aria-hidden="true" />
                {running ? "Running experiment…" : "Run experiment"}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              {dirty && (
                <p className="field-note pending">
                  Inputs changed. Run to update results.
                </p>
              )}
            </form>
            <div className="comparison" aria-live="polite" aria-atomic="true">
              <div className="request-line">
                <LockKeyhole size={14} aria-hidden="true" />
                <span>
                  Requested{" "}
                  <strong>
                    {fmt(result.amount)} {requestedUnit}
                  </strong>
                </span>
                <span className="tiny">{unitNames[applied.unit]}</span>
              </div>
              <div className="result-columns">
                <ResultPanel
                  safe={false}
                  result={result}
                  stage={stage}
                  unit={applied.unit}
                />
                <ResultPanel
                  safe
                  result={result}
                  stage={stage}
                  unit={applied.unit}
                />
              </div>
              <div className="timeline">
                <div className={stage >= 1 ? "active" : ""}>
                  <span>1</span>
                  <p>
                    Quote stored<strong>{fmt(result.quotedRaw)} raw</strong>
                  </p>
                </div>
                <ArrowRight size={15} aria-hidden="true" />
                <div className={stage >= 2 ? "active" : ""}>
                  <span>2</span>
                  <p>
                    Multiplier changes
                    <strong>
                      {applied.before}× → {applied.after}×
                    </strong>
                  </p>
                </div>
                <ArrowRight size={15} aria-hidden="true" />
                <div className={stage >= 3 ? "active" : ""}>
                  <span>3</span>
                  <p>
                    Execution checks
                    <strong>
                      {result.rejection
                        ? "Transfer blocked"
                        : "Intent preserved"}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="experiment-footer">
            <p>
              <span className="small-dot" /> No wallet. No transactions. All
              values in this experiment are simulated.
            </p>
            <button
              className="text-button"
              onClick={download}
              disabled={running || dirty}
            >
              <Download size={15} aria-hidden="true" /> Export result
            </button>
          </div>
          {downloadMessage && (
            <p role="status" className="field-note">
              {downloadMessage}
            </p>
          )}
          {liveSeed && (
            <p className="seed-note">Seeded from a live read: {liveSeed}</p>
          )}
          {result.rejection === "rounding" && (
            <div className="precision-note">
              <CircleHelp size={19} aria-hidden="true" />
              <div>
                <strong>A tiny difference is still a different promise.</strong>
                <p>
                  The official floor conversion returns{" "}
                  <code>{fmt(result.requiredRaw)}</code> raw tokens. That maps
                  back to <code>{fmt(result.deliverableUI)}</code>{" "}
                  share-equivalents—short by{" "}
                  <code>{result.shortfall.toString()}</code> base units. An
                  exact instruction rejects that rounding. The transferred
                  amount is zero.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="how-section container" id="mechanism">
          <div className="section-top">
            <div>
              <span className="eyebrow">THE INTEGRATION PATTERN</span>
              <h2>Keep the promise close to execution.</h2>
            </div>
            <a
              className="text-link"
              href="/sdk"
            >
              Use Invariant in your app <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="principles">
            <article>
              <span>01</span>
              <h3>Keep the intended unit.</h3>
              <p>
                Shares at execution, a position at authorization, and raw tokens
                are different promises. Preserve the one the user chose.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Convert when it counts.</h3>
              <p>
                For execution-time shares, read the multiplier and convert
                inside the same transaction that transfers the tokens.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Enforce the boundaries.</h3>
              <p>
                Apply the maximum raw spend and an explicit rounding policy.
                Revert when the exact instruction can’t be fulfilled.
              </p>
            </article>
          </div>
        </section>

        <LiveSection onSnapshot={setSnapshot} onSeed={seedFromLive} />

        <section id="evidence" className="container evidence-section">
          <div className="evidence-heading">
            <span className="eyebrow">03 / THE EVIDENCE</span>
            <h2>
              Reproducible.
              <br />
              With the limits in view.
            </h2>
            <p>
              Behind the interface is the original Foundry spike, using pinned
              Base reference mocks.
            </p>
            <a
              className="text-link"
              href={`${REPO}/blob/main/logs/forge-test-vvv.txt`}
              target="_blank"
              rel="noreferrer"
            >
              Inspect the test output{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="evidence-details">
            <div className="test-score">
              <CheckCheck size={25} aria-hidden="true" />
              <strong>8 / 8</strong>
              <span>
                Foundry tests passed
                <small>Captured reference-fixture results</small>
              </span>
            </div>
            <div className="test-topics">
              <span>Stale conversion</span>
              <span>Position intent</span>
              <span>Raw-token intent</span>
              <span>Spend cap rejection</span>
              <span>Sufficient spend cap</span>
              <span>No-change control</span>
              <span>Exactness rejection</span>
              <span>Cobalt reference</span>
            </div>
            <details>
              <summary>Cobalt: reference / future behavior</summary>
              <p>
                The pinned reference can activate a scheduled multiplier without
                emitting a second event at activation. This test does not
                establish scheduled behavior on deployed Coinbase stocks. A
                consumer must retain the schedule and timestamp or reread the
                effective multiplier.
              </p>
            </details>
            <details>
              <summary>What these results do—and don’t—establish</summary>
              <p>
                The spike demonstrates an application-level timing mistake under
                an exact execution-time share promise. Base’s helper arithmetic
                works correctly. We have not shown that a production app makes
                this mistake, that B20 is broken, or that this experimental
                executor is production-ready.
              </p>
              <p>
                The browser uses a TypeScript integer model of those fixtures.
                It does not run Foundry, sign orders, simulate transfer
                permissions, check allowances, or transfer assets. Live helper
                reads are separate and block-stamped.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="container footer">
        <a href="#" className="wordmark">
          <span className="mark small" aria-hidden="true">
            ≠
          </span>{" "}
          invariant<span className="lab-tag">LAB</span>
        </a>
        <p>
          A developer experiment for tokenized stocks on Base.
          <br />
          Read-only research. Coinbase stocks are available only in eligible
          jurisdictions outside the U.S.
        </p>
        <a href={REPO} target="_blank" rel="noreferrer">
          Built in the open <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </footer>
    </>
  );
}

function ResultPanel({
  safe,
  result: r,
  stage,
  unit,
}: {
  safe: boolean;
  result: Result;
  stage: number;
  unit: IntentUnit;
}) {
  const ready = stage === 3;
  const rejected = safe && !!r.rejection;
  const matches = safe ? !rejected : r.naiveMatches;
  const value = safe ? r.deliveredUI : r.naiveUI;
  const raw = safe ? r.rawSpent : r.quotedRaw;
  const state = rejected ? "blocked" : matches ? "good" : "bad";
  const caption = rejected
    ? r.rejection === "cap"
      ? "Spend limit protected"
      : "Exactness protected"
    : matches
      ? "Intent preserved"
      : "Intent mismatch";
  return (
    <article
      className={`result-panel ${safe ? "safe-panel" : "naive-panel"} ${state}`}
    >
      <div className="result-name">
        {safe ? (
          <ShieldCheck size={18} aria-hidden="true" />
        ) : (
          <Code2 size={18} aria-hidden="true" />
        )}
        <h3>{safe ? "Invariant" : "Naïve execution"}</h3>
        {safe && <span className="tiny">INTENT-AWARE</span>}
      </div>
      <p className="result-method">
        {safe
          ? unit === "execution"
            ? "Convert at execution. Check the promise."
            : "Preserve the authorized raw amount."
          : "Convert at quote. Transfer the cached amount."}
      </p>
      <div className={`result-number ${ready ? "visible-result" : ""}`}>
        <strong data-testid={safe ? "safe-amount" : "naive-amount"}>
          {ready ? (rejected ? "Blocked" : fmt(value)) : "—"}
        </strong>
        <span>
          {ready && rejected
            ? "No tokens transferred"
            : "share-equivalents delivered"}
        </span>
      </div>
      <div className="result-status">
        {ready ? (
          rejected ? (
            <LockKeyhole size={16} aria-hidden="true" />
          ) : matches ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <X size={16} aria-hidden="true" />
          )
        ) : (
          <FlaskConical size={16} aria-hidden="true" />
        )}
        <span>
          {ready
            ? caption
            : stage < 2
              ? "Reading the instruction…"
              : "Checking execution…"}
        </span>
      </div>
      <dl className="result-math">
        <div>
          <dt>Raw tokens transferred</dt>
          <dd>{ready ? fmt(raw) : "—"}</dd>
        </div>
        <div>
          <dt>{safe ? "Maximum raw spend" : "Cached raw quote"}</dt>
          <dd>{safe ? fmt(r.cap) : fmt(r.quotedRaw)}</dd>
        </div>
        <div>
          <dt>
            {safe && rejected ? "Required raw amount" : "Execution multiplier"}
          </dt>
          <dd>{safe && rejected ? fmt(r.requiredRaw) : `${fmt(r.after)}×`}</dd>
        </div>
      </dl>
      <p className="result-explanation">
        {safe
          ? r.rejection === "cap"
            ? `${fmt(r.requiredRaw)} raw required exceeds the ${fmt(r.cap)} raw cap. The instruction reverts before transfer.`
            : r.rejection === "rounding"
              ? "The floor conversion cannot deliver the exact requested amount. The instruction reverts before transfer."
              : unit === "execution"
                ? `${fmt(raw)} raw × ${fmt(r.after)} = ${fmt(value)} share-equivalents. Exactly the requested amount.`
                : "A changed share-equivalent value does not violate a fixed raw-position instruction."
          : r.naiveMatches
            ? "The cached amount satisfies this intent. A multiplier change is not inherently a bug."
            : `${fmt(r.quotedRaw)} cached raw × ${fmt(r.after)} = ${fmt(r.naiveUI)}. The raw quote no longer matches the share promise.`}
      </p>
    </article>
  );
}

function LiveSection({
  onSnapshot,
  onSeed,
}: {
  onSnapshot: (data: StockSnapshot | null) => void;
  onSeed: (data: StockSnapshot) => void;
}) {
  const [ticker, setTicker] = useState("NVDAc");
  const [data, setData] = useState<StockSnapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const timeout = setTimeout(() => controller.abort(), 50_000);
    setLoading(true);
    setData(null);
    onSnapshot(null);
    setError("");
    fetch(`/api/stocks?ticker=${encodeURIComponent(ticker)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Could not read Base.");
        return body as StockSnapshot;
      })
      .then((body) => {
        if (!disposed) {
          setData(body);
          onSnapshot(body);
          setNow(Date.now());
        }
      })
      .catch((err) => {
        if (!disposed)
          setError(
            err.name === "AbortError"
              ? "The read timed out. Retry the public RPC."
              : "Could not read current Base stock data. The public RPC may be unavailable. Retry below.",
          );
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [ticker, refresh, onSnapshot]);
  const stock = STOCKS.find((s) => s.ticker === ticker)!;
  const stale = !!data && now - Date.parse(data.observedAt) > 120_000;
  return (
    <section id="live" className="live-wrap">
      <div className="container live-section">
        <div className="section-top">
          <div>
            <span className="eyebrow">02 / ONCHAIN CONTEXT</span>
            <h2>Real stocks. Read from Base.</h2>
            <p className="section-description">
              Inspect the official conversion helpers at one block. No wallet
              needed.
            </p>
          </div>
          <a
            href={STOCK_SOURCE}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            Official token sources <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="stock-selector" aria-label="Coinbase stocks">
          {STOCKS.map((s) => (
            <button
              key={s.ticker}
              aria-pressed={ticker === s.ticker}
              onClick={() => setTicker(s.ticker)}
            >
              <strong>{s.ticker}</strong>
              <span>{s.company}</span>
            </button>
          ))}
        </div>
        <div className="live-card">
          <div className="live-card-top">
            <div className="stock-title">
              <span className="stock-monogram">
                {stock.company.slice(0, 1)}
              </span>
              <div>
                <h3>{stock.company}</h3>
                <p>
                  {data?.name ?? `${stock.ticker} · Official address listing`}
                </p>
              </div>
            </div>
            <span className={`read-status ${data && !stale ? "read-ok" : ""}`}>
              <span className="small-dot" />
              {loading
                ? "READING BASE…"
                : error
                  ? "RPC UNAVAILABLE"
                  : stale
                    ? "OLDER SNAPSHOT"
                    : "ONCHAIN SNAPSHOT"}
            </span>
          </div>
          {loading ? (
            <div className="live-loading" role="status">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
              <p>
                Reading metadata and conversion helpers from a single Base
                block…
              </p>
            </div>
          ) : error ? (
            <div className="live-error" role="alert">
              <h4>Live read unavailable</h4>
              <p>
                {error} The simulation above remains usable; no sample values
                are substituted here.
              </p>
              <button
                className="secondary"
                onClick={() => setRefresh((v) => v + 1)}
              >
                Retry live read <RotateCcw size={15} aria-hidden="true" />
              </button>
            </div>
          ) : data ? (
            <>
              <div className="live-metrics">
                <div>
                  <span className="tiny">CURRENT MULTIPLIER</span>
                  <strong>
                    {fmt(BigInt(data.multiplier))}
                    <small>×</small>
                  </strong>
                  <p>Read from multiplier()</p>
                </div>
                <div>
                  <span className="tiny">2 SHARE-EQUIVALENTS REQUIRE</span>
                  <strong>
                    {fmt(BigInt(data.rawForTwo), data.decimals)}
                    <small>raw</small>
                  </strong>
                  <p>Read from toRawBalance()</p>
                </div>
                <div>
                  <span className="tiny">ROUND-TRIP RESULT</span>
                  <strong>
                    {fmt(BigInt(data.uiRoundTrip), data.decimals)}
                    <small>shares</small>
                  </strong>
                  <p>Read from toScaledBalance()</p>
                </div>
              </div>
              <div className="live-provenance">
                <a
                  href={`https://basescan.org/block/${data.blockNumber}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Block {data.blockNumber}{" "}
                  <ArrowUpRight size={12} aria-hidden="true" />
                </a>
                <span>
                  Observed {new Date(data.observedAt).toLocaleTimeString()} ·{" "}
                  {data.decimals} decimals
                </span>
                <span>{new URL(data.endpoint).hostname}</span>
              </div>
              {stale && (
                <p className="seed-note">
                  This read is over two minutes old. Refresh before using it as
                  a reference.
                </p>
              )}
              <div className="live-actions">
                <button
                  className="secondary"
                  disabled={stale}
                  onClick={() => onSeed(data)}
                >
                  Use multiplier in experiment{" "}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
                <button
                  className="text-button"
                  onClick={() => setRefresh((v) => v + 1)}
                >
                  <RotateCcw size={14} aria-hidden="true" /> Refresh read
                </button>
                <small>
                  Successful reads may be cached for up to 90 seconds.
                </small>
              </div>
            </>
          ) : (
            <div className="live-error">
              <p>No stock data returned.</p>
              <button
                className="secondary"
                onClick={() => setRefresh((v) => v + 1)}
              >
                Retry live read
              </button>
            </div>
          )}
          <div className="address-line">
            <span className="tiny">BASE · CHAIN 8453</span>
            <a
              href={`https://basescan.org/address/${stock.address}`}
              target="_blank"
              rel="noreferrer"
            >
              {stock.address}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
        <p className="live-disclaimer">
          The listing is sourced from Base. Displayed onchain values are
          read-only observations, not trade quotes or transfer eligibility
          checks. The experiment’s multiplier changes are hypothetical.
        </p>
      </div>
    </section>
  );
}
