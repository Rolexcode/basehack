import { parseDecimal } from "./intent";

export type IntentManifest = {
  schema: "invariant.intent.v1";
  chainId: number;
  asset: {
    ticker: string;
    address: string;
    decimals: number;
  };
  intent: {
    unit: "execution-time-shares";
    requestedShareBaseUnits: string;
    maxRawSpendBaseUnits: string;
    policy: "exact-or-block";
  };
};

export type IntentManifestEnvelope = {
  id: string;
  algorithm: "sha256";
  signed: false;
  manifest: IntentManifest;
};

export function buildIntentManifest(input: {
  chainId: number;
  ticker: string;
  address: string;
  decimals: number;
  requestedShares: string;
  maxRawSpend: string;
}): IntentManifest {
  if (input.chainId !== 8453) throw new Error("Intent manifests are scoped to Base mainnet.");
  if (!/^0x[a-fA-F0-9]{40}$/.test(input.address)) throw new Error("Invalid asset address.");
  if (!Number.isInteger(input.decimals) || input.decimals < 0 || input.decimals > 36)
    throw new Error("Unsupported asset decimals.");

  const requested = parseDecimal(input.requestedShares, input.decimals);
  const cap = parseDecimal(input.maxRawSpend, input.decimals);
  if (requested === 0n) throw new Error("Requested shares must be greater than zero.");
  if (cap === 0n) throw new Error("Maximum raw-token spend must be greater than zero.");

  return {
    schema: "invariant.intent.v1",
    chainId: input.chainId,
    asset: {
      ticker: input.ticker,
      address: input.address.toLowerCase(),
      decimals: input.decimals,
    },
    intent: {
      unit: "execution-time-shares",
      requestedShareBaseUnits: requested.toString(),
      maxRawSpendBaseUnits: cap.toString(),
      policy: "exact-or-block",
    },
  };
}

export function canonicalIntent(manifest: IntentManifest): string {
  return JSON.stringify(manifest);
}

export async function hashIntentManifest(manifest: IntentManifest): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalIntent(manifest));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `inv_sha256_${hex}`;
}

export async function createIntentManifest(
  input: Parameters<typeof buildIntentManifest>[0],
): Promise<IntentManifestEnvelope> {
  const manifest = buildIntentManifest(input);
  return {
    id: await hashIntentManifest(manifest),
    algorithm: "sha256",
    signed: false,
    manifest,
  };
}
