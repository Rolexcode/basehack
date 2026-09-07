import { test } from "node:test";
import assert from "node:assert/strict";
import {
  simulate,
  PRESETS,
  parseDecimal,
  formatDecimal,
  WAD,
} from "../lib/intent";

test("forward split reproduces the independently asserted Foundry balances", () => {
  const r = simulate(PRESETS.split);
  assert.equal(r.quotedRaw, 2n * WAD);
  assert.equal(r.naiveUI, 8n * WAD);
  assert.equal(r.rawSpent, WAD / 2n);
  assert.equal(r.deliveredUI, 2n * WAD);
  assert.equal(r.rejection, null);
});
test("reverse split blocks overspend without transferring anything", () => {
  const r = simulate(PRESETS.reverse);
  assert.equal(r.requiredRaw, 8n * WAD);
  assert.equal(r.naiveUI, WAD / 2n);
  assert.equal(r.rejection, "cap");
  assert.equal(r.rawSpent, 0n);
  assert.equal(r.deliveredUI, 0n);
});
test("reverse split succeeds at the exact spend boundary", () => {
  const r = simulate({ ...PRESETS.reverse, cap: "8" });
  assert.equal(r.rawSpent, 8n * WAD);
  assert.equal(r.deliveredUI, 2n * WAD);
  assert.equal(r.rejection, null);
  assert.equal(
    simulate({ ...PRESETS.reverse, cap: "7.999999999999999999" }).rejection,
    "cap",
  );
});
test("exactness guard rejects the two-base-unit loss at multiplier three", () => {
  const r = simulate(PRESETS.rounding);
  assert.equal(r.requiredRaw, 666666666666666666n);
  assert.equal(r.deliverableUI, 1999999999999999998n);
  assert.equal(r.shortfall, 2n);
  assert.equal(r.rejection, "rounding");
  assert.equal(r.rawSpent, 0n);
});
test("no-change control has matching outcomes", () => {
  const r = simulate(PRESETS.control);
  assert.equal(r.naiveUI, 2n * WAD);
  assert.equal(r.deliveredUI, r.naiveUI);
  assert.equal(r.naiveMatches, true);
});
test("position intent correctly preserves raw entitlement through a split", () => {
  const r = simulate({ ...PRESETS.split, unit: "position" });
  assert.equal(r.rawSpent, 2n * WAD);
  assert.equal(r.deliveredUI, 8n * WAD);
  assert.equal(r.naiveMatches, true);
});
test("raw intent bypasses share conversion at quote", () => {
  const r = simulate({ ...PRESETS.split, before: "2", unit: "raw" });
  assert.equal(r.quotedRaw, 2n * WAD);
  assert.equal(r.rawSpent, 2n * WAD);
  assert.equal(r.naiveMatches, true);
});
test("position intent still respects its spend cap", () => {
  assert.equal(
    simulate({ ...PRESETS.split, unit: "position", cap: "1" }).rejection,
    "cap",
  );
});
test("zero cap blocks a nonzero raw transfer", () => {
  assert.equal(simulate({ ...PRESETS.split, cap: "0" }).rawSpent, 0n);
});
test("cap rejection has priority over rounding, matching the Solidity executor", () => {
  assert.equal(simulate({ ...PRESETS.rounding, cap: "0.1" }).rejection, "cap");
});
test("decimal parsing never silently rounds precision or accepts exponent notation", () => {
  for (const value of [
    "",
    "-1",
    "1e18",
    "NaN",
    "Infinity",
    "1.0000000000000000001",
  ])
    assert.throws(() => parseDecimal(value));
  assert.equal(parseDecimal("0.000000000000000001"), 1n);
});
test("rejects invalid multipliers and overflow instead of showing unsafe arithmetic", () => {
  for (const after of ["0", "-1", "999999999999999999999999999999"])
    assert.throws(() => simulate({ ...PRESETS.split, after }));
  assert.throws(() => simulate({ ...PRESETS.split, amount: "0" }));
  assert.throws(() =>
    simulate({ ...PRESETS.split, amount: "1" + "0".repeat(59), after: "4" }),
  );
});
test("formatting retains all eighteen decimals, including negative deltas", () => {
  assert.equal(formatDecimal(1999999999999999998n), "1.999999999999999998");
  assert.equal(formatDecimal(-1n), "-0.000000000000000001");
  assert.equal(formatDecimal(1234567n, 6), "1.234567");
});
test("every successful exact-share scenario delivers the request and respects the cap", () => {
  for (const amount of ["0.1", "1", "2", "17.345"])
    for (const before of ["0.25", "1", "2"])
      for (const after of ["0.25", "1", "3", "4"]) {
        const r = simulate({
          amount,
          before,
          after,
          cap: "100",
          unit: "execution",
        });
        if (!r.rejection) {
          assert.equal(r.deliveredUI, parseDecimal(amount));
          assert.ok(r.rawSpent <= r.cap);
        } else assert.equal(r.rawSpent, 0n);
      }
});
