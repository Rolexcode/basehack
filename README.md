# Invariant Lab

**You asked for 2 shares.** Invariant checks for exact delivery or blocks the instruction. Explore how a stale conversion can deliver 8 share-equivalents instead of 2, and use the reusable guard to check the intended amount and spending cap.

**Live app: [invariant-lab.vercel.app](https://invariant-lab.vercel.app)** · [Source](https://github.com/Rolexcode/basehack)

**Developer guide: [Use Invariant in your app](https://invariant-lab.vercel.app/sdk)** · **[Create an Intent Manifest](https://invariant-lab.vercel.app/manifest)**. `web/lib/invariant.ts` accepts amounts and spending caps in the asset’s native base units, using its actual `decimals()`. Only multipliers use the fixed 18-decimal WAD scale. The guide reads actual stock metadata and labels the subsequent 4× change as hypothetical. The guard calculates a decision; a production executor must enforce it within the transfer transaction.

## Web app

The Next.js app wraps the original research spike with:

- Four interactive scenarios: forward split, reverse split with a spend cap, exactness rejection, and no-change control.
- Three explicit instruction meanings: execution-time shares, authorization-time position, and fixed raw tokens.
- Exact BigInt arithmetic, input validation, a replayable execution timeline, and JSON result export.
- Read-only Coinbase stock metadata and conversion helpers on Base mainnet, using addresses from [Base's official integration guide](https://docs.base.org/specifications/b20/tokenized-stocks-on-base).
- A responsive interface, keyboard controls, reduced-motion support, explicit loading/error states, and linked source evidence.

The browser is an integer simulation of the pinned Solidity fixtures, **not an EVM execution or a trading application**. The lab uses 18-decimal amounts to match the existing tests. Live contract reads use each token's actual decimals (NVDAc returned 8 during verification). Using a live multiplier in the experiment seeds the starting factor only; subsequent changes are hypothetical.

### Run locally

Requires Node.js 22 or newer and npm. From this repository:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No API keys, wallet, funds, or paid service are required.

```sh
npm test                 # Integer-model tests
npm run build            # Production build and TypeScript check
npm run test:browser     # Playwright; uses installed Google Chrome
```

Playwright starts the production server automatically, so build first. Browser tests deliberately stub RPC failures to verify recovery without depending on public endpoint uptime. The actual chain reader is verified separately.

### Live read boundaries

`GET /api/stocks?ticker=NVDAc` supports a fixed allowlist of NVDAc, AAPLc, TSLAc, MSFTc, and AMZNc. It verifies chain 8453 and a recent block, then pins name, symbol, decimals, multiplier, precision, and both conversion-helper reads to that block. It uses free public RPC endpoints, deduplicates in-flight reads, caches successes, and returns HTTP 503 on failure. It never substitutes mock values. The interface timestamps each observation and marks older snapshots.

Only view calls are made. No private keys, approvals, signatures, contract deployments, or mainnet transactions are used. These reads do not establish transfer eligibility, liquidity, market value, or live scheduled-multiplier support.

### Deployment and submission

The repository root is a Next.js project with Vercel configuration. Deploy to a free Hobby account without paid add-ons. No database, paid API, or other infrastructure is needed. The original Foundry sources stay in place; `.vercelignore` excludes them from the web deployment upload.

See [submission readiness](docs/submission-readiness.md) for outstanding submission material and [verification](docs/verification.md) for checks performed. The builder reported registration code `bc_uvgijblh`. The app sends no transactions, so it has no transaction calldata to attribute.

## Original B20 intent spike — preserved findings

This bounded Foundry experiment tests one claim: a delayed B20 instruction stated in UI/share-equivalent units can be mis-executed if an application converts it to raw ERC-20 units at authorization time and the multiplier changes before execution.

It is not a frontend, production order protocol, live-chain test, or claim about an existing application.

## Result

`forge build --force`: passed with Solidity 0.8.30.

`forge test -vvv`: **8 passed, 0 failed, 0 skipped**.

| Test | Result | Finding |
|---|---|---|
| `test_executionTimeIntentStaleQuote` | PASS | A quote of 2 raw at multiplier 1 delivered 8 UI after multiplier became 4. Converting at execution transferred 0.5 raw and delivered 2 UI. |
| `test_signingTimeIntent` | PASS | Preserving the signing-time raw position correctly delivered 2 raw / 8 UI, proving that different authorized meanings require different handling. |
| `test_reverseSplitRespectsMaxSpend` | PASS | At multiplier 0.25, 2 UI required 8 raw. A 3-raw cap reverted with balances and allowance unchanged. |
| `test_reverseSplitSufficientCapSucceeds` | PASS | An 8-raw cap allowed 8 raw to deliver exactly 2 UI. |
| `test_rawTokenInstructionUnaffected` | PASS | An instruction for exactly 2 raw tokens still delivered exactly 2 raw tokens after the multiplier changed. |
| `test_noMultiplierChangeBothPathsAgree` | PASS | Without a multiplier change, early and execution-time conversions both delivered 2 raw / 2 UI. |
| `test_exactIntentRejectsUnrepresentableRounding` | PASS | At multiplier 3, official floor conversions made exact 2 UI unrepresentable by 2 UI base units; the exact-intent executor reverted. |
| `test_cobaltActivationHasNoEvent` | PASS | The Cobalt reference emitted one scheduling event and zero activation-boundary events; an event-only current-value cache stayed at 1 while the reference read returned 4. |

## What the spike establishes

The primary scenario is a real time-of-check/time-of-use mismatch under a precise contract: “at execution time, deliver exactly 2 UI/share-equivalent units.” Base's official conversion helper returns the right answer when called. The failure occurs when an application calls it too early, caches the resulting raw amount, and later treats that raw amount as satisfying an execution-time UI promise.

The helpers therefore solve conversion arithmetic, but do not choose the user's intended unit, decide when conversion should occur, impose a maximum raw spend, or define rounding tolerance. Those are application-level semantics.

The spike also shows that the application cannot normalize every order. “Deliver 2 UI units at execution,” “transfer the raw position represented by 2 UI units when signed,” and “transfer exactly 2 raw tokens” are three different promises. All can be valid.

## Cobalt boundary

The scheduled-multiplier test uses the pinned `base-std` Solidity reference mock. It confirms the reference behavior documented for Cobalt: scheduling emits an event, while reaching `effectiveAt` changes the multiplier on the read path without a second event. A consumer can remain correct by retaining the scheduled value and timestamp or rereading onchain.

This does **not** confirm that deployed Coinbase tokenized stocks expose Cobalt scheduled multipliers on Base mainnet.

## Assessment

**Technical gate: passed. Product direction: focused on a developer safety primitive.**

The experiment demonstrates a reusable guard and deterministic Intent Manifest for delayed, share-denominated B20 instructions. Its claim stays narrow: bind the authorized unit, Base asset, amount, spending cap, and exact-or-block policy; then use current conversion data at execution. It does not claim that production applications currently make this mistake or that the manifest alone authorizes a trade.

## Reproduce

The repository vendors unmodified source and test helpers from the commits recorded in `dependencies.json`.

```powershell
forge build
forge test -vvv
```

Full captured output is in `logs/forge-build.txt` and `logs/forge-test-vvv.txt`.

## Claim boundaries

This spike does not claim that B20 is broken, that all automated orders fail across corporate actions, that current Coinbase stocks implement Cobalt scheduled multipliers, that a production application has this bug, or that passing these tests proves market demand.
