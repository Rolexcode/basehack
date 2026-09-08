import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Github,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import styles from "./landing.module.css";

const REPO = "https://github.com/Rolexcode/basehack";

const assets = [
  ["NVDAc", "NVIDIA"],
  ["AAPLc", "Apple"],
  ["TSLAc", "Tesla"],
  ["MSFTc", "Microsoft"],
  ["AMZNc", "Amazon"],
] as const;

export default function Landing() {
  return (
    <main className={styles.page}>
      <section className={styles.heroWrap}>
        <header className={styles.nav}>
          <Link href="/" className={styles.brand} aria-label="Invariant home">
            <span className={styles.brandMark}>≠</span>
            <span>invariant</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Primary navigation">
            <a href="#how">How it works</a>
            <Link href="/manifest">Manifest</Link>
            <Link href="/sdk">Developers</Link>
            <a href={REPO} target="_blank" rel="noreferrer">GitHub ↗</a>
          </nav>
          <Link href="/playground" className={styles.navCta}>
            Open app <ArrowRight size={15} />
          </Link>
        </header>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span /> BUILT FOR TOKENIZED STOCKS ON BASE</p>
            <h1>Send 2 shares.<br /><em>Deliver 2 shares.</em></h1>
            <p className={styles.heroText}>
              If a stock changes while an instruction waits, an old conversion can
              stop meaning what the user asked for. Invariant checks again before execution.
            </p>
            <div className={styles.heroActions}>
              <Link href="/playground" className={styles.primary}>See it work <ArrowRight size={17} /></Link>
              <Link href="/manifest" className={styles.secondary}>Create a promise</Link>
            </div>
            <p className={styles.heroNote}>Exact delivery—or block. No wallet required to explore.</p>
          </div>

          <div className={styles.promiseStage} aria-label="Two shares requested. A stale conversion would deliver eight; Invariant preserves two.">
            <div className={styles.stageChrome}>
              <span>INVARIANT / PROMISE 001</span>
              <span className={styles.liveDot}>BASE</span>
            </div>

            <div className={styles.sendLabel}>YOU MEANT</div>
            <div className={styles.shareStack}>
              <div className={`${styles.shareTicket} ${styles.ticketBack}`}>
                <span>NVDAc</span><strong>1</strong><small>SHARE</small>
              </div>
              <div className={`${styles.shareTicket} ${styles.ticketFront}`}>
                <span>NVDAc</span><strong>1</strong><small>SHARE</small>
              </div>
            </div>
            <div className={styles.bigTwo}>2</div>
            <div className={styles.sharesWord}>shares</div>

            <div className={styles.changeRail}>
              <span className={styles.railLine} />
              <span className={styles.changePill}>stock changes · 1× → 4×</span>
              <span className={styles.railLine} />
            </div>

            <div className={styles.resultPair}>
              <div className={styles.wrongResult}>
                <span>OLD CONVERSION</span>
                <strong>8</strong>
                <small><X size={13} /> not what you asked for</small>
              </div>
              <div className={styles.rightResult}>
                <span>WITH INVARIANT</span>
                <strong>2</strong>
                <small><Check size={13} /> promise preserved</small>
              </div>
            </div>
            <p className={styles.hypo}>The 1× → 4× change is a hypothetical product scenario.</p>
          </div>
        </div>
      </section>

      <section className={styles.intro} id="how">
        <p className={styles.sectionTag}>THE WHOLE IDEA</p>
        <h2>Your order should not change while it waits.</h2>
        <p className={styles.lede}>
          Invariant keeps the instruction clear from the moment it is stated to the moment an app acts on it.
        </p>
        <div className={styles.threeSteps}>
          <article>
            <span>01</span>
            <div className={styles.stepIcon}>2</div>
            <h3>State the promise</h3>
            <p>“Deliver exactly 2 shares.” Keep the user&apos;s unit explicit.</p>
          </article>
          <article>
            <span>02</span>
            <div className={styles.stepIcon}>↻</div>
            <h3>Check again later</h3>
            <p>When execution happens, use the current stock representation—not a stale conversion.</p>
          </article>
          <article>
            <span>03</span>
            <div className={`${styles.stepIcon} ${styles.stepCheck}`}>✓</div>
            <h3>Deliver—or stop</h3>
            <p>If the exact promise cannot be honored within the user&apos;s limits, transfer nothing.</p>
          </article>
        </div>
      </section>

      <section className={styles.blockSection}>
        <div className={styles.blockCopy}>
          <p className={styles.darkTag}>THE SAFETY LINE</p>
          <h2>Never turn “2” into “whatever works.”</h2>
          <p>
            A reverse change could require more raw tokens than the user allowed.
            Invariant treats that limit as part of the instruction.
          </p>
          <Link href="/playground#reverse" className={styles.darkLink}>Run this case <ArrowRight size={16} /></Link>
        </div>
        <div className={styles.blockVisual}>
          <div className={styles.blockTop}>
            <span>REQUEST</span><b>2 shares</b>
          </div>
          <div className={styles.limitNumbers}>
            <div><small>NEEDED NOW</small><strong>8</strong><span>raw</span></div>
            <div><small>USER ALLOWED</small><strong>3</strong><span>raw</span></div>
          </div>
          <div className={styles.stopLane}>
            <span className={styles.movingTwo}>2</span>
            <span className={styles.lane} />
            <span className={styles.wall}><LockKeyhole size={18} /></span>
          </div>
          <div className={styles.blocked}><ShieldCheck size={18} /><div><strong>BLOCKED</strong><span>No tokens transferred</span></div></div>
        </div>
      </section>

      <section className={styles.productGrid}>
        <div className={styles.manifestPanel}>
          <div className={styles.panelHead}>
            <span>INTENT MANIFEST</span>
            <span>01</span>
          </div>
          <h2>Give the promise an ID.</h2>
          <p>Carry the stock, amount, spending ceiling and exact-or-block policy together.</p>
          <div className={styles.promiseCard}>
            <div className={styles.promiseAsset}><span>NV</span><div><b>NVDAc</b><small>Base mainnet</small></div></div>
            <div className={styles.promiseFields}>
              <div><small>SHARES</small><b>2</b></div>
              <div><small>MAX SPEND</small><b>3</b></div>
              <div><small>POLICY</small><b>EXACT / BLOCK</b></div>
            </div>
            <div className={styles.promiseId}>intent · 7a92…f81c</div>
          </div>
          <Link href="/manifest" className={styles.panelLink}>Create an Intent Manifest <ArrowRight size={16} /></Link>
        </div>

        <div className={styles.guardPanel}>
          <div className={styles.panelHead}>
            <span>INVARIANT GUARD</span>
            <span>02</span>
          </div>
          <h2>The check developers can reuse.</h2>
          <p>Preserve intent. Check at execution. Exact—or block.</p>
          <div className={styles.codeCard}>
            <div><Code2 size={15} /> guardIntent()</div>
            <pre>{`const result = guardIntent({
  amount: 2n * tokenUnit,
  executionMultiplier,
  maxRawSpend: 3n * tokenUnit,
});

result.ok ? execute(result) : block();`}</pre>
            <span className={styles.codeReady}><i /> exact intent protected</span>
          </div>
          <Link href="/sdk" className={styles.panelLink}>Developer integration <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section className={styles.assets}>
        <div className={styles.assetsTitle}>
          <div><p className={styles.sectionTag}>REAL BASE CONTEXT</p><h2>Built around real tokenized stocks.</h2></div>
          <Link href="/playground#live" className={styles.assetsLink}>Open live reads <ArrowUpRight size={15} /></Link>
        </div>
        <div className={styles.assetRail}>
          {assets.map(([ticker, company], index) => (
            <article key={ticker} className={styles.assetCard}>
              <div className={styles.assetLogo}>{company.slice(0, 1)}</div>
              <span className={styles.readOnly}>READ-ONLY</span>
              <strong>{ticker}</strong>
              <p>{company}</p>
              <footer><span>BASE</span><span>0{index + 1}</span></footer>
            </article>
          ))}
        </div>
        <p className={styles.assetNote}>The web app makes read-only calls. It does not move user funds.</p>
      </section>

      <section className={styles.proofBand}>
        <div><strong>8/8</strong><span>Foundry tests</span></div>
        <div><strong>5</strong><span>Base stock reads</span></div>
        <div><strong>0</strong><span>wallets needed to try it</span></div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerPromise}>
          <span className={styles.footerSend}>2</span>
          <span className={styles.footerPath}><i /></span>
          <span className={styles.footerReceive}>2 <Check size={18} /></span>
        </div>
        <div className={styles.footerCopy}>
          <div>
            <Link href="/" className={styles.footerBrand}><span>≠</span> invariant</Link>
            <h2>Send 2. Deliver 2.</h2>
            <p>Execute what the user meant.</p>
          </div>
          <div className={styles.footerActions}>
            <Link href="/playground" className={styles.primary}>Open Invariant <ArrowRight size={16} /></Link>
            <a href={REPO} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>
          </div>
        </div>
        <div className={styles.footerMeta}><span>Safety primitives for tokenized-stock instructions on Base.</span><span>Read-only web app · no funds moved</span></div>
      </footer>
    </main>
  );
}
