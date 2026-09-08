import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildIntentManifest,
  canonicalIntent,
  createIntentManifest,
} from "../lib/manifest";

test("manifest encodes exact Base asset and native-unit promise deterministically", () => {
  const input = {
    chainId: 8453,
    ticker: "NVDAc",
    address: "0xb20000000000000000000078ee7ce2fe4908108c",
    decimals: 8,
    requestedShares: "2",
    maxRawSpend: "3",
  };
  const a = buildIntentManifest(input);
  const b = buildIntentManifest(input);
  assert.deepEqual(a, b);
  assert.equal(a.intent.requestedShareBaseUnits, "200000000");
  assert.equal(a.intent.maxRawSpendBaseUnits, "300000000");
  assert.equal(a.intent.policy, "exact-or-block");
  assert.equal(canonicalIntent(a), canonicalIntent(b));
});

test("manifest rejects wrong chain, malformed address, zero shares and excess precision", () => {
  const base = {
    chainId: 8453,
    ticker: "NVDAc",
    address: "0xb20000000000000000000078ee7ce2fe4908108c",
    decimals: 8,
    requestedShares: "2",
    maxRawSpend: "3",
  };
  assert.throws(() => buildIntentManifest({ ...base, chainId: 1 }));
  assert.throws(() => buildIntentManifest({ ...base, address: "0x1234" }));
  assert.throws(() => buildIntentManifest({ ...base, requestedShares: "0" }));
  assert.throws(() => buildIntentManifest({ ...base, maxRawSpend: "0" }));
  assert.throws(() => buildIntentManifest({ ...base, requestedShares: "1.000000001" }));
});

test("intent ID is stable for the same fields and changes with the promise", async () => {
  const input = {
    chainId: 8453,
    ticker: "NVDAc",
    address: "0xb20000000000000000000078ee7ce2fe4908108c",
    decimals: 8,
    requestedShares: "2",
    maxRawSpend: "3",
  };
  const first = await createIntentManifest(input);
  const second = await createIntentManifest(input);
  const changed = await createIntentManifest({ ...input, requestedShares: "8" });
  assert.equal(first.id, second.id);
  assert.notEqual(first.id, changed.id);
  assert.match(first.id, /^inv_sha256_[a-f0-9]{64}$/);
  assert.equal(first.signed, false);
});

test("canonical manifest excludes changing execution data", () => {
  const manifest = buildIntentManifest({
    chainId: 8453,
    ticker: "AAPLc",
    address: "0xb200000000000000000000c2e324d24d7eecd1fb",
    decimals: 8,
    requestedShares: "2",
    maxRawSpend: "3",
  });
  const encoded = canonicalIntent(manifest);
  assert.equal(encoded.includes("multiplier"), false);
  assert.equal(encoded.includes("blockNumber"), false);
  assert.equal(encoded.includes("observedAt"), false);
});
