/** Reusable integer guard for B20-style delayed instructions. Pure logic only: no RPC, signatures, approvals, or transfers. */
export const WAD = 10n ** 18n;
export const MAX_UINT256 = (1n << 256n) - 1n;
export const MAX_B20_MULTIPLIER = (1n << 128n) - 1n;

export type IntentUnit = "execution" | "position" | "raw";
export type GuardBlockReason = "cap" | "rounding" | null;

export type GuardRequest = {
  unit: IntentUnit;
  amount: bigint;
  quoteMultiplier: bigint;
  executionMultiplier: bigint;
  maxRawSpend: bigint;
};

export type GuardDecision = {
  ok: boolean;
  reason: GuardBlockReason;
  requestedAmount: bigint;
  quotedRaw: bigint;
  requiredRaw: bigint;
  naiveDeliveredShares: bigint;
  exactDeliveredShares: bigint;
  rawToTransfer: bigint;
  sharesToDeliver: bigint;
  shortfall: bigint;
};

function assertUint256(value: bigint, label: string) {
  if (value < 0n || value > MAX_UINT256)
    throw new Error(`${label} exceeds the uint256 range.`);
}

function assertMultiplier(value: bigint, label: string) {
  if (value <= 0n || value > MAX_B20_MULTIPLIER)
    throw new Error(`${label} must be positive and within the B20 uint128 bound.`);
}

export function mulDivFloor(a: bigint, b: bigint, divisor: bigint): bigint {
  assertUint256(a, "Amount");
  assertUint256(b, "Multiplier");
  if (divisor <= 0n) throw new Error("Divisor must be positive.");
  if (a !== 0n && b > MAX_UINT256 / a)
    throw new Error("Conversion would overflow the contract integer limit.");
  return (a * b) / divisor;
}

/**
 * Evaluate one already-authorized instruction against the multiplier visible at execution.
 *
 * This does not make execution atomic by itself. Production callers must obtain the effective
 * multiplier and transfer under the same onchain execution context, and must separately handle
 * signatures, nonces, deadlines, allowances, asset allowlists, transfer restrictions and replay.
 */
export function guardIntent(request: GuardRequest): GuardDecision {
  const {
    unit,
    amount,
    quoteMultiplier,
    executionMultiplier,
    maxRawSpend,
  } = request;

  if (!["execution", "position", "raw"].includes(unit))
    throw new Error("Choose a supported intent.");
  if (amount <= 0n) throw new Error("Requested amount must be greater than zero.");
  assertUint256(amount, "Requested amount");
  assertUint256(maxRawSpend, "Maximum raw spend");
  assertMultiplier(quoteMultiplier, "Quote multiplier");
  assertMultiplier(executionMultiplier, "Execution multiplier");

  const quotedRaw =
    unit === "raw" ? amount : mulDivFloor(amount, WAD, quoteMultiplier);
  const requiredRaw =
    unit === "execution"
      ? mulDivFloor(amount, WAD, executionMultiplier)
      : quotedRaw;
  const naiveDeliveredShares = mulDivFloor(
    quotedRaw,
    executionMultiplier,
    WAD,
  );
  const exactDeliveredShares = mulDivFloor(
    requiredRaw,
    executionMultiplier,
    WAD,
  );

  const reason: GuardBlockReason =
    requiredRaw > maxRawSpend
      ? "cap"
      : unit === "execution" && exactDeliveredShares !== amount
        ? "rounding"
        : null;

  const ok = reason === null;
  return {
    ok,
    reason,
    requestedAmount: amount,
    quotedRaw,
    requiredRaw,
    naiveDeliveredShares,
    exactDeliveredShares,
    rawToTransfer: ok ? requiredRaw : 0n,
    sharesToDeliver: ok ? exactDeliveredShares : 0n,
    shortfall:
      unit === "execution" && exactDeliveredShares <= amount
        ? amount - exactDeliveredShares
        : 0n,
  };
}
