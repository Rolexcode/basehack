import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  Github,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import styles from "./landing.module.css";

const REPO = "https://github.com/Rolexcode/basehack";

const stocks = [
  ["NVDAc", "NVIDIA"],
  ["AAPLc", "Apple"],
  ["TSLAc", "Tesla"],
  ["MSFTc", "Microsoft"],
  ["AMZNc", "Amazon"],
] as const;

export default function Landing() {
  return (
    <main className={styles.page}>
      <section className={styles.heroShell}>
        <header className={styles.nav}>
          <Link href="/" className={styles.brand} aria-label="Invariant home">
            <span className={styles.brandMark}>≠</span>
            <span>invariant</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Primary navigation">
            <a href="#product">Product</a>
            <Link href="/manifest">Manifest</Link>
            <Link href="/sdk">Developers</Link>
            <a href={REPO} target="_blank" rel="noreferrer" className={styles.navSource}>
              <Github size={15} aria-hidden="true" />
              GitHub
            </a>
          </nav>
          <Link href="/playground" className={styles.navCta}>
            Open Invariant <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>
              <span className={styles.baseDot} />
              SAFETY PRIMITIVES FOR TOKENIZED STOCKS ON BASE
            </div>
            <h1>
              <span>2 should still</span>
              <span>mean 2.</span>
            </h1>
            <p>
              Preserve what users authorize—even when a tokenized stock changes
              before execution. Invariant checks the promise again when it matters.
            </p>
            <div className={styles.heroActions}>
              <Link href="/playground" className={styles.primaryCta}>
                Try Invariant <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/sdk" className={styles.secondaryCta}>
                Developer guide <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.heroTrust}>
              <span>Read-only Base data</span>
              <span>8/8 Foundry tests</span>
              <span>No wallet required</span>
            </div>
          </div>

          <div className={styles.heroVisual} aria-label="Two shares requested. Cached conversion delivers eight; Invariant preserves two.">
            <div className={styles.visualTopline}>
              <span>ONE PROMISE</span>
              <span>HYPOTHETICAL 1× → 4×</span>
            </div>
            <div className={styles.intentChip}>
              <span className={styles.intentTwo}>2</span>
              <span>
                <strong>shares</strong>
                <small>requested at execution</small>
              </span>
              <LockKeyhole size={18} aria-hidden="true" />
            </div>
            <div className={styles.executionTrack}>
              <span className={styles.trackNode}>intent</span>
              <span className={styles.trackLine} />
              <span className={styles.trackEvent}>1× → 4×</span>
              <span className={styles.trackLine} />
              <span className={styles.trackNode}>execute</span>
            </div>
            <div className={styles.outcomeGrid}>
              <article className={styles.badOutcome}>
                <div className={styles.outcomeLabel}>CACHED CONVERSION</div>
                <div className={styles.outcomeNumber}>8</div>
                <div className={styles.outcomeFooter}>
                  <X size={15} aria-hidden="true" />
                  promise changed
                </div>
              </article>
              <article className={styles.goodOutcome}>
                <div className={styles.outcomeLabel}>INVARIANT</div>
                <div className={styles.outcomeNumber}>2</div>
                <div className={styles.outcomeFooter}>
                  <Check size={15} aria-hidden="true" />
                  intent preserved
                </div>
              </article>
            </div>
            <div className={styles.visualCaption}>
              The problem is stale application logic—not a claim that Base or B20 is broken.
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statement} id="product">
        <p className={styles.sectionEyebrow}>THE PROBLEM</p>
        <h2>Between intent and execution, things can change.</h2>
        <p>
          The user should not have to understand token representation to know what
          their instruction means. Invariant keeps the authorized meaning explicit.
        </p>
        <div className={styles.promiseFlow}>
          <div className={styles.promiseCard}>
            <small>USER ASKED</small>
            <strong>2</strong>
            <span>shares</span>
          </div>
          <div className={styles.flowArrow}>
            <span>representation changes</span>
            <b>1× → 4×</b>
          </div>
          <div className={styles.splitOutcomes}>
            <div className={styles.splitBad}>
              <small>CACHED</small>
              <strong>8</strong>
              <span><X size={13} /> wrong promise</span>
            </div>
            <div className={styles.splitGood}>
              <small>INVARIANT</small>
              <strong>2</strong>
              <span><Check size={13} /> exact intent</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.protectionSection}>
        <div className={styles.protectionCopy}>
          <p className={styles.darkEyebrow}>EXACT — OR NOTHING</p>
          <h2>Boundaries are part of the promise.</h2>
          <p>
            If preserving the instruction would spend beyond the user&apos;s ceiling,
            Invariant fails closed instead of improvising.
          </p>
          <Link href="/playground#reverse" className={styles.darkLink}>
            Try the reverse-split case <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.boundaryVisual}>
          <div className={styles.boundaryRow}>
            <span>Requested</span><strong>2 shares</strong>
          </div>
          <div className={styles.boundaryRow}>
            <span>Required</span><strong>8 raw</strong>
          </div>
          <div className={styles.boundaryRow}>
            <span>User maximum</span><strong>3 raw</strong>
          </div>
          <div className={styles.stopTrack}>
            <span className={styles.stopDot} />
            <span className={styles.stopLine} />
            <span className={styles.stopWall}><LockKeyhole size={18} /></span>
          </div>
          <div className={styles.blockedState}>
            <span>BLOCKED</span>
            <small>No tokens transferred</small>
          </div>
        </div>
      </section>

      <section className={styles.manifestSection}>
        <div className={styles.manifestCopy}>
          <p className={styles.sectionEyebrow}>INTENT MANIFEST</p>
          <h2>Make the promise machine-readable.</h2>
          <p>
            Bind the asset, exact share instruction, spend ceiling and execution
            policy into deterministic intent data that an execution layer can check.
          </p>
          <Link href="/manifest" className={styles.inlineLink}>
            Create a manifest <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.manifestCard}>
          <div className={styles.manifestHeader}>
            <span>INVARIANT INTENT</span>
            <span className={styles.statusPill}>READY</span>
          </div>
          <div className={styles.manifestAsset}>
            <div className={styles.assetBadge}>NV</div>
            <div><strong>NVDAc</strong><span>Base mainnet asset</span></div>
          </div>
          <dl className={styles.manifestGrid}>
            <div><dt>Instruction</dt><dd>Exactly 2 shares</dd></div>
            <div><dt>Maximum spend</dt><dd>3 raw</dd></div>
            <div><dt>Policy</dt><dd>Exact or block</dd></div>
            <div><dt>Intent ID</dt><dd>7a92…f81c</dd></div>
          </dl>
          <div className={styles.manifestSeal}>
            <ShieldCheck size={19} />
            <span>The promise stays explicit.</span>
          </div>
        </div>
      </section>

      <section className={styles.assetsSection}>
        <div className={styles.assetsHeading}>
          <div>
            <p className={styles.sectionEyebrow}>ONCHAIN CONTEXT</p>
            <h2>Real assets. Read from Base.</h2>
          </div>
          <Link href="/playground#live" className={styles.inlineLink}>
            Open live reads <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className={styles.stockGrid}>
          {stocks.map(([ticker, company], index) => (
            <article className={styles.stockCard} key={ticker}>
              <div className={styles.stockIcon}>{company.slice(0, 1)}</div>
              <span className={styles.livePill}>READ-ONLY</span>
              <strong>{ticker}</strong>
              <p>{company}</p>
              <div className={styles.stockFooter}>
                <span>BASE MAINNET</span>
                <span>0{index + 1}</span>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.assetsNote}>
          Live helper reads are read-only. The split scenarios used in the playground are hypothetical.
        </p>
      </section>

      <section className={styles.developerSection}>
        <div className={styles.developerCopy}>
          <p className={styles.darkEyebrow}>INVARIANT GUARD</p>
          <h2>One guard. Three rules.</h2>
          <div className={styles.rules}>
            <div><span>01</span><strong>Preserve intent</strong><p>Keep the unit the user actually authorized.</p></div>
            <div><span>02</span><strong>Check at execution</strong><p>Re-evaluate execution-time shares when execution happens.</p></div>
            <div><span>03</span><strong>Exact—or block</strong><p>Respect spend limits and reject silent rounding.</p></div>
          </div>
          <Link href="/sdk" className={styles.darkLink}>
            Integrate Invariant <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.codeWindow}>
          <div className={styles.codeTop}>
            <span><Braces size={14} /> invariant.ts</span>
            <span>GUARD</span>
          </div>
          <pre><code>{`const decision = guardIntent({
  unit: "execution",
  amount: 2n * tokenUnit,
  executionMultiplier,
  maxRawSpend: 3n * tokenUnit,
});

if (!decision.ok) {
  throw new Error(decision.reason);
}

// preserve exactly what the user meant
return decision.rawToTransfer;`}</code></pre>
          <div className={styles.codeStatus}>
            <span className={styles.codePulse} />
            exact intent → protected
          </div>
        </div>
      </section>

      <section className={styles.proofStrip}>
        <div><strong>8 / 8</strong><span>Foundry tests passed</span></div>
        <div><strong>5</strong><span>Supported Base stock reads</span></div>
        <div><strong>0</strong><span>Wallets required to explore</span></div>
        <div><strong>1</strong><span>Promise carried through execution</span></div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTrack} aria-hidden="true">
          <span className={styles.footerTwo}>2</span>
          <span className={styles.footerLine} />
          <span className={styles.footerCheck}><Check size={20} /></span>
        </div>
        <div className={styles.footerMain}>
          <div>
            <Link href="/" className={styles.footerBrand}>
              <span>≠</span> invariant
            </Link>
            <h2>Execute what the user meant.</h2>
            <p>Safety primitives for tokenized-stock instructions on Base.</p>
          </div>
          <div className={styles.footerActions}>
            <Link href="/playground" className={styles.primaryCta}>Open Invariant <ArrowRight size={16} /></Link>
            <a href={REPO} target="_blank" rel="noreferrer" className={styles.footerRepo}>
              GitHub <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>Read-only research product. No funds are moved by the current web app.</span>
          <span>Built on Base.</span>
        </div>
      </footer>
    </main>
  );
}
