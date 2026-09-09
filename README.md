# Invariant

Invariant is a developer SDK for safer share-denominated instructions around tokenized stocks on Base.

The core idea is simple: if a user says they want **2 shares**, an application should preserve that meaning instead of converting it too early into a raw token amount that may become stale after a split or multiplier change.

Invariant helps applications keep that intent explicit and check it again at execution time.

**Live app:** https://invariant-lab.vercel.app

## SDK

The SDK is built around a small set of checks that applications can use before executing an instruction:

- preserve the unit the user actually authorized;
- convert using current token metadata at execution time;
- enforce an optional maximum spend;
- reject exact instructions when the requested amount cannot be represented cleanly;
- distinguish between share-denominated instructions and fixed raw-token instructions.

The reusable guard lives in `web/lib/invariant.ts` and works with token amounts in their native base units. Multipliers use 18-decimal fixed-point precision.

Invariant does not execute trades by itself. It gives an application a deterministic decision that can be enforced by its own transaction flow.

## Intent Manifest

Invariant also includes an Intent Manifest: a compact way to record what the user actually approved.

A manifest can bind:

- the asset;
- the intended unit;
- the requested amount;
- an optional spending cap;
- whether the instruction must be exact or should be blocked.

This makes delayed instructions easier to reason about because the application can compare the original intent with the current conversion state before execution.

## Example

A user authorizes an instruction for 2 share-equivalent units. If the underlying multiplier changes before execution, a raw token amount calculated earlier may no longer equal 2 shares.

Invariant keeps the instruction share-denominated, performs the conversion using current data, and either returns the amount needed to satisfy the instruction or blocks it when the constraints cannot be met.

The SDK is intended as a small developer safety layer for applications building around tokenized stocks on Base.