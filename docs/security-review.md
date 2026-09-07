# Security review

Reviewed 2026-09-07 for the Base Builder Quest submission.

## Scope

- `web/lib/invariant.ts` reusable pure intent guard
- `web/lib/intent.ts` browser simulation adapter
- `src/IntentShareExecutor.sol` bounded Solidity research fixture
- `/api/stocks` read-only Base data path
- Next.js deployment configuration

This is a hackathon/developer research build, not a production trading or custody system.

## Checks performed

### Intent and arithmetic safety

- All displayed experiment arithmetic uses `bigint`; no floating-point conversion is used for token amounts.
- Inputs reject negatives, exponent notation, excessive decimal precision, zero requested amounts, zero multipliers, values outside uint256, and B20 multipliers outside uint128.
- Multiplication fails closed before uint256 overflow rather than wrapping.
- Exact execution-time share intent rejects floor-rounding underdelivery.
- Maximum raw spend is enforced before any hypothetical transfer amount is returned.
- A stress matrix asserts that successful decisions never exceed the user cap and that blocked decisions return zero transfer.
- Fixed raw-token and signing-time-position instructions are intentionally not normalized as execution-time share promises.

### API / live-read surface

- `/api/stocks` accepts only a fixed ticker allowlist; users cannot supply arbitrary contract addresses or RPC URLs.
- RPC endpoints are hardcoded to known public Base endpoints, preventing user-controlled SSRF through this route.
- Reads verify Base chain id 8453 and reject blocks older than five minutes.
- Contract reads for one snapshot are pinned to one block number.
- Live data is read-only: no key, wallet, signature, approval, deployment, or transaction is used.
- The reader times out each public RPC attempt and falls back to a second endpoint; it never substitutes mock values for a failed live read.

### Web surface

- No `dangerouslySetInnerHTML`, `eval`, `new Function`, `document.write`, private-key handling, mnemonic handling, or secret-bearing environment-variable use was found in the application code during review.
- The app sends `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a restrictive camera/microphone/geolocation permissions policy.
- User-controlled experiment values are rendered through React, not inserted as raw HTML.

### Solidity research fixture

- The order is deleted before the external `transferFrom` call.
- Only the order owner can execute the current research order.
- Maximum raw spend and exact-share representability are checked before transfer.
- The fixture explicitly does not implement signatures or delegated keepers, so it should not be presented as a production order protocol.

## Important production gaps

These are not hidden behind a “production ready” claim. A production executor would still need, at minimum:

- EIP-712 or equivalent authenticated authorization
- nonces and replay protection
- deadlines / expiry
- cancellation
- explicit asset allowlists and issuer-policy checks
- allowance and balance handling
- transfer restriction / eligibility handling
- tolerance semantics for non-exact instructions
- keeper / relayer authorization if third parties can execute
- same-transaction reads for the effective multiplier and transfer
- monitoring, incident response, rate limiting and abuse controls
- independent smart-contract audit before custody or real-value execution

## Threats intentionally avoided by this submission

The public deployment does not custody funds, request approvals, ask for signatures, accept private keys, or execute trades. That substantially reduces the consequence of a web compromise during the hackathon demo.

## Result

No critical vulnerability was identified in the current read-only web application or pure intent guard during this bounded review. The most important risk would come from misrepresenting the experimental Solidity fixture or pure guard as a complete production execution system; the UI, README, SDK page and source comments therefore keep those boundaries explicit.
