# Invariant

**Your order. Your terms.**

Invariant is an intent-preservation layer for tokenized-stock apps on Base. It keeps a share-denominated order explicit until execution, re-checks the current conversion state, and either preserves the order or stops when the user’s limits can no longer be honored.

**Live app:** https://invariant-lab.vercel.app

## Why it exists

A user can ask for a precise outcome such as **2 shares**. If an app converts that request into a raw token amount too early, a later multiplier change can make the cached amount represent something different at execution.

Invariant keeps the requested unit and constraints intact instead of treating an old raw conversion as the order itself.

Illustrative example:

```text
User asks for        2 shares
Multiplier at quote  1×
Multiplier later     4×
Cached raw path      8 share-equivalents
Invariant path       2 share-equivalents
```

The 1× → 4× change above is an illustrative scenario, not a claim that a specific Coinbase stock experienced that event.

## Product

- **Order Check** — compare a cached conversion with an execution-time check across split, reverse-split, exactness and no-change scenarios.
- **Live Base reads** — read current metadata and B20 conversion helpers for supported tokenized stocks on Base mainnet. Reads are allowlisted and read-only.
- **Order Record** — package the asset, requested shares, spending limit and exact-or-stop policy into a deterministic manifest ID.
- **Invariant Guard** — pure TypeScript decision logic that developers can place before an execution layer.

Supported live reads currently include `NVDAc`, `AAPLc`, `TSLAc`, `MSFTc` and `AMZNc`.

## How the guard works

For an execution-time share instruction, the guard:

1. preserves the amount in the unit the user chose;
2. re-evaluates the raw amount using the execution multiplier;
3. enforces the maximum raw spend;
4. rejects exact instructions that cannot be represented without rounding drift;
5. returns zero transfer amount when the instruction is blocked.

The reusable implementation lives in [`web/lib/invariant.ts`](web/lib/invariant.ts). The Order Record implementation lives in [`web/lib/manifest.ts`](web/lib/manifest.ts).

## Repository map

```text
app/                     Next.js routes and Base read API
web/components/          Product UI
web/lib/                 Guard, manifest and Base reader
web/tests/               TypeScript unit tests
web/e2e/                 Playwright product-flow tests
src/                     Solidity reference executors
test/                    Foundry reference tests
logs/                    Captured Foundry output
docs/                    Security and verification notes
lib/                     Vendored upstream Base/Foundry dependencies
```

`lib/base-std` and `lib/forge-std` are vendored upstream dependencies; their bundled documentation is not project-authored product documentation. Exact upstream revisions are recorded in [`dependencies.json`](dependencies.json).

## Verification

```bash
npm test
npm run typecheck
npm run build
npm run test:browser
forge test -vv
```

The Foundry suite contains 8 reference tests covering stale conversion, execution-time conversion, reverse-split limits, unchanged state and exactness behavior. TypeScript tests cover the reusable guard, manifest and integer conversion model.

See [`docs/verification.md`](docs/verification.md) for what each layer verifies.

## Security boundary

The public web app is read-only. It does not hold keys, request token approvals, collect signatures or execute trades.

`Invariant Guard` is decision logic, not a complete transaction protocol. A production executor still needs authenticated authorization, nonces, deadlines, cancellation, replay protection, asset allowlists, allowance/balance handling, transfer eligibility checks and same-transaction enforcement of the effective multiplier and transfer.

See [`docs/security-review.md`](docs/security-review.md) for the current trust boundaries.

## Stack

Next.js · React · TypeScript · viem · Base · Solidity · Foundry · Playwright
