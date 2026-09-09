# Testing and verification

Invariant separates three kinds of evidence: reusable TypeScript logic, browser product flows, and Solidity reference tests.

## TypeScript

Run:

```bash
npm test
npm run typecheck
```

The tests cover:

- execution-time share intent;
- fixed-position and fixed-raw intent;
- stale conversion outcomes;
- spending-cap rejection;
- exactness/rounding rejection;
- integer bounds and decimal parsing;
- deterministic Order Record generation.

The guard and browser model use integer arithmetic; token amounts are represented in each asset’s native base units while B20 multipliers use WAD precision.

## Browser flows

Run:

```bash
npm run test:browser
```

Playwright verifies the current product routes and key journeys, including:

- landing page → Order Check navigation;
- forward-split and reverse-split outcomes;
- applied-result consistency after editing an order;
- explicit Base-read failure/recovery states;
- Order Record generation and ID changes;
- responsive layouts without horizontal overflow.

External Base reads are stubbed in browser interaction tests so UI tests do not depend on public RPC uptime.

## Foundry

Run:

```bash
forge test -vv
```

The Solidity reference suite contains 8 tests covering:

- stale forward conversion;
- execution-time conversion;
- reverse-split spending limits;
- successful cap boundaries;
- unchanged multiplier control;
- exactness rejection;
- alternate intent semantics;
- the pinned Cobalt multiplier reference behavior used by the fixture.

Captured Foundry output is kept in [`logs/`](../logs/).

## Live Base reads

The production app reads allowlisted Coinbase tokenized-stock contracts through public Base RPC endpoints. Each snapshot is read-only, pinned to one block and rejected if the chain or block freshness checks fail.

Live reads are operational evidence only. They are not execution quotes, user authorization or proof that an illustrative multiplier-change scenario occurred on a specific stock.
