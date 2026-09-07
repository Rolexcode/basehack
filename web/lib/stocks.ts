/** Allowlist verified against Base's official stock integration guide on 2026-09-07. */
export const STOCK_SOURCE =
  "https://docs.base.org/specifications/b20/tokenized-stocks-on-base";
export const STOCKS = [
  {
    ticker: "NVDAc",
    company: "NVIDIA",
    address: "0xb20000000000000000000078ee7ce2fe4908108c",
  },
  {
    ticker: "AAPLc",
    company: "Apple",
    address: "0xb200000000000000000000c2e324d24d7eecd1fb",
  },
  {
    ticker: "TSLAc",
    company: "Tesla",
    address: "0xb2000000000000000000001e800a7f5189430cd0",
  },
  {
    ticker: "MSFTc",
    company: "Microsoft",
    address: "0xb200000000000000000000ab99cfa739e253872b",
  },
  {
    ticker: "AMZNc",
    company: "Amazon",
    address: "0xb200000000000000000000d9192b6b456483c2e8",
  },
] as const;
export type StockSnapshot = {
  ticker: string;
  company: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  multiplier: string;
  precision: string;
  blockNumber: string;
  blockTimestamp: string;
  observedAt: string;
  endpoint: string;
  chainId: number;
  requestedUI: string;
  rawForTwo: string;
  uiRoundTrip: string;
};
