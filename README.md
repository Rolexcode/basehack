# Invariant B20 intent spike

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

**Technical gate: passed. Product gate: not passed by this experiment.**

The demonstrated issue is useful as an integration library or SDK guardrail for delayed, share-denominated B20 instructions. The solution is currently too compact to justify a standalone consumer product: preserve the authorized unit, convert at the correct time, enforce spend/receive bounds, and handle rounding explicitly. The experiment does not show that production applications currently make this mistake or that users demand a separate product.

## Reproduce

The repository vendors unmodified source and test helpers from the commits recorded in `dependencies.json`.

```powershell
forge build
forge test -vvv
```

Full captured output is in `logs/forge-build.txt` and `logs/forge-test-vvv.txt`.

## Claim boundaries

This spike does not claim that B20 is broken, that all automated orders fail across corporate actions, that current Coinbase stocks implement Cobalt scheduled multipliers, that a production application has this bug, or that passing these tests proves market demand.
