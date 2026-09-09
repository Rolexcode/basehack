# Security boundaries

Invariant’s public deployment is a read-only product surface plus reusable decision logic. It is not a broker, custodian or complete transaction executor.

## Current web surface

- `/api/stocks` accepts only the stock tickers in the project allowlist.
- Public Base RPC endpoints are fixed in code; callers cannot provide arbitrary RPC URLs or contract addresses.
- Reads verify Base chain ID `8453`, reject stale blocks and pin each stock snapshot to one block number.
- Token arithmetic uses integer `bigint` values rather than floating point.
- The web app does not request private keys, wallet signatures, token approvals or transactions.
- Security headers disable framing and browser camera/microphone/geolocation access.

## Invariant Guard

`web/lib/invariant.ts` is pure decision logic. It validates integer bounds, multiplier bounds, spending caps and exact representability.

A blocked decision returns a zero transfer amount. The guard deliberately distinguishes between:

- shares requested at execution;
- a raw position fixed at authorization;
- a fixed raw-token amount.

Those are different instructions and should not be silently normalized into one another.

## Solidity reference executor

`src/IntentShareExecutor.sol` exists to make the execution-time behavior testable with Foundry. It checks the spending cap and exact share delivery before transfer, and deletes the stored order before the external `transferFrom` call.

It is not a production order protocol.

## Production requirements

A real execution layer would additionally need, at minimum:

- authenticated authorization such as EIP-712;
- nonces and replay protection;
- deadlines and cancellation;
- asset allowlists and issuer-policy checks;
- allowance and balance handling;
- transfer restriction and eligibility handling;
- explicit tolerance rules for non-exact instructions;
- keeper/relayer authorization where applicable;
- same-transaction enforcement of the effective multiplier and transfer;
- monitoring, rate limiting and incident response;
- independent security review before real-value use.

## Claim boundary

Invariant demonstrates an application-level stale-conversion risk for precisely defined delayed instructions. It does not claim that Base, B20 or Coinbase tokenized stocks are broken, or that a production application is currently affected.
