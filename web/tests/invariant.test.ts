import { test } from "node:test";
import assert from "node:assert/strict";
import {
  guardIntent,
  MAX_B20_MULTIPLIER,
  MAX_UINT256,
  WAD,
} from "../lib/invariant";

const e18 = (n: bigint) => n * WAD;

test("execution-time intent preserves the exact requested shares", () => {
  const r = guardIntent({
    unit: "execution",
    amount: e18(2n),
    quoteMultiplier: WAD,
    executionMultiplier: e18(4n),
    maxRawSpend: e18(3n),
  });
  assert.equal(r.naiveDeliveredShares, e18(8n));
  assert.equal(r.rawToTransfer, WAD / 2n);
  assert.equal(r.sharesToDeliver, e18(2n));
  assert.equal(r.ok, true);
});

test("reverse split cannot exceed the user's raw-token ceiling", () => {
  const r = guardIntent({
    unit: "execution",
    amount: e18(2n),
    quoteMultiplier: WAD,
    executionMultiplier: WAD / 4n,
    maxRawSpend: e18(3n),
  });
  assert.equal(r.requiredRaw, e18(8n));
  assert.equal(r.ok, false);
  assert.equal(r.reason, "cap");
  assert.equal(r.rawToTransfer, 0n);
});

test("fixed raw intent remains fixed even after multiplier changes", () => {
  const r = guardIntent({
    unit: "raw",
    amount: e18(2n),
    quoteMultiplier: WAD,
    executionMultiplier: e18(4n),
    maxRawSpend: e18(2n),
  });
  assert.equal(r.rawToTransfer, e18(2n));
  assert.equal(r.sharesToDeliver, e18(8n));
  assert.equal(r.ok, true);
});

test("exact-share intent rejects floor-rounding underdelivery", () => {
  const r = guardIntent({
    unit: "execution",
    amount: e18(2n),
    quoteMultiplier: WAD,
    executionMultiplier: e18(3n),
    maxRawSpend: e18(3n),
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "rounding");
  assert.equal(r.rawToTransfer, 0n);
});

test("zero, negative and out-of-range inputs fail closed", () => {
  const base = {
    unit: "execution" as const,
    amount: WAD,
    quoteMultiplier: WAD,
    executionMultiplier: WAD,
    maxRawSpend: WAD,
  };
  assert.throws(() => guardIntent({ ...base, amount: 0n }));
  assert.throws(() => guardIntent({ ...base, amount: -1n }));
  assert.throws(() => guardIntent({ ...base, quoteMultiplier: 0n }));
  assert.throws(() => guardIntent({ ...base, executionMultiplier: 0n }));
  assert.throws(() =>
    guardIntent({ ...base, quoteMultiplier: MAX_B20_MULTIPLIER + 1n }),
  );
  assert.throws(() => guardIntent({ ...base, maxRawSpend: MAX_UINT256 + 1n }));
});

test("multiplication overflow is rejected instead of wrapping", () => {
  assert.throws(() =>
    guardIntent({
      unit: "execution",
      amount: MAX_UINT256,
      quoteMultiplier: MAX_B20_MULTIPLIER,
      executionMultiplier: MAX_B20_MULTIPLIER,
      maxRawSpend: MAX_UINT256,
    }),
  );
});

test("guard never spends above cap across a stress matrix", () => {
  const amounts = [1n, WAD / 10n, WAD, e18(2n), e18(17n) + WAD / 3n];
  const multipliers = [WAD / 4n, WAD / 2n, WAD, e18(2n), e18(3n), e18(4n)];
  const caps = [0n, WAD / 10n, WAD, e18(3n), e18(100n)];

  for (const amount of amounts)
    for (const quoteMultiplier of multipliers)
      for (const executionMultiplier of multipliers)
        for (const maxRawSpend of caps) {
          const r = guardIntent({
            unit: "execution",
            amount,
            quoteMultiplier,
            executionMultiplier,
            maxRawSpend,
          });
          assert.ok(r.rawToTransfer <= maxRawSpend);
          if (r.ok) assert.equal(r.sharesToDeliver, amount);
          else assert.equal(r.rawToTransfer, 0n);
        }
});
