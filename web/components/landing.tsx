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
            <Link href="/manifest">Order record</Link>
            <Link href="/sdk">Developers</Link>
            <a href={REPO} target="_blank" rel="noreferrer">GitHub ↗</a>
          </nav>
          <Link href="/playground" className={styles.navCta}>
            Open app <ArrowRight size={15} />
          </Link>
        </header>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span /> BUILT FOR STOCK ORDERS ON BASE</p>
            <h1>Set your stock order.<br /><em>Get what you asked for.</em></h1>
            <p className={styles.heroText}>
              Stocks can change while an order is waiting. Invariant checks the order again
              before it goes through, so the amount does not quietly change on you.
            </p>
            <div className={styles.heroActions}>
              <Link href="/playground" className={styles.primary}>Open Invariant <ArrowRight size={17} /></Link>
              <a href="#how" className={styles.secondary}>See how it works</a>
            </div>
            <p className={styles.heroNote}>Explore without connecting a wallet.</p>
          </div>

          <div className={styles.promiseStage} aria-label="A user asks for two shares. A stock-change scenario would make a stale conversion deliver eight, while Invariant keeps the order at two.">
            <div className={styles.stageChrome}>
              <span>INVARIANT / ORDER 001</span>
              <span className={styles.liveDot}>BASE</span>
            </div>

            <div className={styles.sendLabel}>YOU ASKED FOR</div>
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
              <span className={styles.changePill}>stock changes while the order waits</span>
              <span className={styles.railLine} />
            </div>

            <div className={styles.resultPair}>
              <div className={styles.wrongResult}>
                <span>WITHOUT THE CHECK</span>
                <strong>8</strong>
                <small><X size={13} /> your order changed</small>
              </div>
              <div className={styles.rightResult}>
                <span>WITH INVARIANT</span>
                <strong>2</strong>
                <small><Check size={13} /> same order, still intact</small>
              </div>
            </div>
            <p className={styles.hypo}>Illustrative stock-change scenario.</p>
          </div>
        </div>
      </section>

      <section className={styles.intro} id="how">
        <p className={styles.sectionTag}>HOW IT HELPS</p>
        <h2>You choose the order. Invariant keeps it on track.</h2>
        <p className={styles.lede}>
          Tell the app what you want once. Invariant checks again right before execution.
        </p>
        <div className={styles.threeSteps}>
          <article>
            <span>01</span>
            <div className={styles.stepIcon}>2</div>
            <h3>Choose your amount</h3>
            <p>You say what you want in normal terms — for example, “I want 2 shares.”</p>
          </article>
          <article>
            <span>02</span>
            <div className={styles.stepIcon}>↻</div>
            <h3>We check before it goes through</h3>
            <p>If the stock changed while the order waited, Invariant checks the latest state first.</p>
          </article>
          <article>
            <span>03</span>
            <div className={`${styles.stepIcon} ${styles.stepCheck}`}>✓</div>
            <h3>Same order — or no order</h3>
            <p>If the app cannot safely honor what you asked for, Invariant stops instead of guessing.</p>
          </article>
        </div>
      </section>

      <section className={styles.blockSection}>
        <div className={styles.blockCopy}>
          <p className={styles.darkTag}>WHEN THINGS CHANGE</p>
          <h2>If the order no longer fits your limit, it stops.</h2>
          <p>
            Say you were okay spending up to 3 raw tokens. If the same order would now need 8,
            Invariant will stop it instead of changing the amount you approved.
          </p>
          <Link href="/playground#reverse" className={styles.darkLink}>See the safety check <ArrowRight size={16} /></Link>
        </div>
        <div className={styles.blockVisual}>
          <div className={styles.blockTop}>
            <span>YOUR ORDER</span><b>2 shares</b>
          </div>
          <div className={styles.limitNumbers}>
            <div><small>NOW NEEDS</small><strong>8</strong><span>raw</span></div>
            <div><small>YOUR LIMIT</small><strong>3</strong><span>raw</span></div>
          </div>
          <div className={styles.stopLane}>
            <span className={styles.movingTwo}>2</span>
            <span className={styles.lane} />
            <span className={styles.wall}><LockKeyhole size={18} /></span>
          </div>
          <div className={styles.blocked}><ShieldCheck size={18} /><div><strong>ORDER STOPPED</strong><span>Nothing moved</span></div></div>
        </div>
      </section>

      <section className={styles.productGrid}>
        <div className={styles.manifestPanel}>
          <div className={styles.panelHead}>
            <span>ORDER RECORD · INTENT MANIFEST</span>
            <span>01</span>
          </div>
          <h2>Keep the order details together.</h2>
          <p>Invariant packages the stock, amount, spending limit and exact-or-stop rule into one clear record.</p>
          <div className={styles.promiseCard}>
            <div className={styles.promiseAsset}><span>NV</span><div><b>NVDAc</b><small>Base mainnet</small></div></div>
            <div className={styles.promiseFields}>
              <div><small>SHARES</small><b>2</b></div>
              <div><small>MAX SPEND</small><b>3</b></div>
              <div><small>RULE</small><b>EXACT / STOP</b></div>
            </div>
            <div className={styles.promiseId}>order ID · 7a92…f81c</div>
          </div>
          <Link href="/manifest" className={styles.panelLink}>See the order record <ArrowRight size={16} /></Link>
        </div>

        <div className={styles.guardPanel}>
          <div className={styles.panelHead}>
            <span>FOR BUILDERS · INVARIANT GUARD</span>
            <span>02</span>
          </div>
          <h2>A simple check before the order goes through.</h2>
          <p>Builders can add Invariant to keep a user&apos;s amount and limits intact until execution.</p>
          <div className={styles.codeCard}>
            <div><Code2 size={15} /> guardIntent()</div>
            <pre>{`const result = guardIntent({
  amount: 2n * tokenUnit,
  executionMultiplier,
  maxRawSpend: 3n * tokenUnit,
});

result.ok ? execute(result) : block();`}</pre>
            <span className={styles.codeReady}><i /> order still matches what the user asked for</span>
          </div>
          <Link href="/sdk" className={styles.panelLink}>View developer integration <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section className={styles.assets}>
        <div className={styles.assetsTitle}>
          <div><p className={styles.sectionTag}>REAL STOCKS ON BASE</p><h2>Live tokenized stock data, right inside Invariant.</h2></div>
          <Link href="/playground#live" className={styles.assetsLink}>View live stock data <ArrowUpRight size={15} /></Link>
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
        <p className={styles.assetNote}>Live Base stock reads · illustrative stock-change scenario.</p>
      </section>

      <section className={styles.proofBand}>
        <div><strong>8/8</strong><span>safety tests passed</span></div>
        <div><strong>5</strong><span>Base stock reads</span></div>
        <div><strong>0</strong><span>wallets needed to get started</span></div>
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
            <h2>Your order. Your terms.</h2>
            <p>Invariant checks before execution so your stock order does not quietly change.</p>
          </div>
          <div className={styles.footerActions}>
            <Link href="/playground" className={styles.primary}>Open Invariant <ArrowRight size={16} /></Link>
            <a href={REPO} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>
          </div>
        </div>
        <div className={styles.footerMeta}><span>Built for tokenized-stock apps on Base.</span><span>Live Base data · no wallet required</span></div>
      </footer>
    </main>
  );
}
