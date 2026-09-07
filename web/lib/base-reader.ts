import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { STOCKS, type StockSnapshot } from "./stocks";

const abi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function multiplier() view returns (uint256)",
  "function WAD_PRECISION() view returns (uint256)",
  "function toRawBalance(uint256) view returns (uint256)",
  "function toScaledBalance(uint256) view returns (uint256)",
]);
const endpoints = [
  "https://mainnet.base.org",
  "https://base-rpc.publicnode.com",
];
const cache = new Map<string, { time: number; data: StockSnapshot }>();
const pending = new Map<string, Promise<StockSnapshot>>();

async function fetchStock(
  stock: (typeof STOCKS)[number],
): Promise<StockSnapshot> {
  for (const endpoint of endpoints) {
    try {
      const client = createPublicClient({
        chain: base,
        transport: http(endpoint, { timeout: 4000, retryCount: 0 }),
      });
      const [chainId, block] = await Promise.all([
        client.getChainId(),
        client.getBlock(),
      ]);
      if (chainId !== 8453 || block.number === null)
        throw new Error("Unexpected chain.");
      if (Math.abs(Date.now() / 1000 - Number(block.timestamp)) > 300)
        throw new Error("RPC block is stale.");
      const args = { address: stock.address, abi, blockNumber: block.number };
      const [name, symbol, decimals, multiplier, precision] = await Promise.all(
        [
          client.readContract({ ...args, functionName: "name" }),
          client.readContract({ ...args, functionName: "symbol" }),
          client.readContract({ ...args, functionName: "decimals" }),
          client.readContract({ ...args, functionName: "multiplier" }),
          client.readContract({ ...args, functionName: "WAD_PRECISION" }),
        ],
      );
      if (decimals > 36 || multiplier === 0n || precision !== 10n ** 18n)
        throw new Error("Unsupported asset parameters.");
      const requestedUI = 2n * 10n ** BigInt(decimals);
      const raw = await client.readContract({
        ...args,
        functionName: "toRawBalance",
        args: [requestedUI],
      });
      const roundTrip = await client.readContract({
        ...args,
        functionName: "toScaledBalance",
        args: [raw],
      });
      return {
        ...stock,
        name,
        symbol,
        decimals,
        multiplier: multiplier.toString(),
        precision: precision.toString(),
        blockNumber: block.number.toString(),
        blockTimestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
        observedAt: new Date().toISOString(),
        endpoint,
        chainId,
        requestedUI: requestedUI.toString(),
        rawForTwo: raw.toString(),
        uiRoundTrip: roundTrip.toString(),
      };
    } catch {
      /* Try the other public read-only endpoint. Never substitute mock data. */
    }
  }
  throw new Error(
    "Public Base RPC could not return a recent, complete stock read. Retry in a moment.",
  );
}
export async function readStock(ticker: string): Promise<StockSnapshot> {
  const stock = STOCKS.find((s) => s.ticker === ticker);
  if (!stock) throw new Error("Unsupported stock.");
  const previous = cache.get(ticker);
  if (previous && Date.now() - previous.time < 60_000) return previous.data;
  const inflight = pending.get(ticker);
  if (inflight) return inflight;
  const promise = fetchStock(stock)
    .then((data) => {
      cache.set(ticker, { time: Date.now(), data });
      return data;
    })
    .finally(() => pending.delete(ticker));
  pending.set(ticker, promise);
  return promise;
}
