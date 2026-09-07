/** Integer model of the pinned Foundry fixtures. This module never submits transactions. */
export const WAD = 10n ** 18n;
export const MAX_UINT256 = (1n << 256n) - 1n;
export type IntentUnit = "execution" | "position" | "raw";
export type Experiment = {
  amount: string;
  before: string;
  after: string;
  cap: string;
  unit: IntentUnit;
};
export const PRESETS = {
  split: {
    name: "Stock split",
    short: "01",
    amount: "2",
    before: "1",
    after: "4",
    cap: "3",
    unit: "execution",
  },
  reverse: {
    name: "Reverse split",
    short: "02",
    amount: "2",
    before: "1",
    after: "0.25",
    cap: "3",
    unit: "execution",
  },
  rounding: {
    name: "Exactness",
    short: "03",
    amount: "2",
    before: "1",
    after: "3",
    cap: "3",
    unit: "execution",
  },
  control: {
    name: "No change",
    short: "04",
    amount: "2",
    before: "1",
    after: "1",
    cap: "3",
    unit: "execution",
  },
} satisfies Record<string, Experiment & { name: string; short: string }>;
export type Preset = keyof typeof PRESETS;

export function parseDecimal(input: string, decimals = 18): bigint {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36)
    throw new Error("Unsupported decimal precision.");
  if (!/^\d+(\.\d+)?$/.test(input) || input.length > 80)
    throw new Error("Enter a non-negative decimal amount.");
  const [whole, fraction = ""] = input.split(".");
  if (fraction.length > decimals)
    throw new Error(`Use at most ${decimals} decimal places.`);
  const result =
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, "0") || "0");
  if (result > MAX_UINT256)
    throw new Error("Amount exceeds the contract integer limit.");
  return result;
}
export function formatDecimal(value: bigint, decimals = 18): string {
  const sign = value < 0n ? "-" : "";
  const v = value < 0n ? -value : value;
  const scale = 10n ** BigInt(decimals);
  const fraction = (v % scale)
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return sign + (v / scale).toString() + (fraction ? "." + fraction : "");
}
function multiplyDivide(a: bigint, b: bigint, divisor: bigint): bigint {
  if (a * b > MAX_UINT256)
    throw new Error("Conversion would overflow the contract integer limit.");
  return (a * b) / divisor;
}
export function simulate(input: Experiment) {
  const amount = parseDecimal(input.amount);
  const before = parseDecimal(input.before);
  const after = parseDecimal(input.after);
  const cap = parseDecimal(input.cap);
  if (amount === 0n)
    throw new Error("Requested amount must be greater than zero.");
  if (
    before === 0n ||
    after === 0n ||
    before > (1n << 128n) - 1n ||
    after > (1n << 128n) - 1n
  )
    throw new Error(
      "Multiplier must be positive and within the B20 uint128 bound.",
    );
  if (!["execution", "position", "raw"].includes(input.unit))
    throw new Error("Choose a supported intent.");
  const quotedRaw =
    input.unit === "raw" ? amount : multiplyDivide(amount, WAD, before);
  const requiredRaw =
    input.unit === "execution" ? multiplyDivide(amount, WAD, after) : quotedRaw;
  const naiveUI = multiplyDivide(quotedRaw, after, WAD);
  const deliverableUI = multiplyDivide(requiredRaw, after, WAD);
  const rejection =
    requiredRaw > cap
      ? "cap"
      : input.unit === "execution" && deliverableUI !== amount
        ? "rounding"
        : null;
  return {
    amount,
    before,
    after,
    cap,
    quotedRaw,
    requiredRaw,
    naiveUI,
    deliverableUI,
    rejection,
    rawSpent: rejection ? 0n : requiredRaw,
    deliveredUI: rejection ? 0n : deliverableUI,
    naiveMatches: input.unit !== "execution" || naiveUI === amount,
    shortfall: input.unit === "execution" ? amount - deliverableUI : 0n,
  };
}
