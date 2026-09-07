# Verification — September 7, 2026

- `npm run build`: Next.js production build and TypeScript compilation passed.
- `npm test`: 14 integer-model tests passed, including independently asserted Foundry outcomes, cap boundaries, rounding, input precision, overflow, and successful-delivery invariants.
- `forge test -vv`: all original 8 Solidity tests passed again from the Desktop/basehack repository; no existing contract or test was modified.
- `npm run test:browser`: 9 Playwright tests passed in installed Chrome. Covers forward split, reverse rejection and sufficient cap, exactness, changed intent, invalid inputs, RPC failure/retry, address switching, report download, preset URL, keyboard focus, layouts at 375/768/1280 px, unknown URL fragments, and seeding from a successful read. Browser RPC responses are explicitly stubbed; real chain reads were checked separately.
- `npm install`: audit reported zero vulnerabilities for the installed dependency tree.
- Actual read-only NVDAc smoke check succeeded at Base block **50992614**, observed **2026-09-07T09:49:34.241Z** through `https://base-rpc.publicnode.com`. Values: name `NVIDIA Corporation`, symbol `NVDAc`, decimals `8`, multiplier `1000000000000000000`, WAD precision `1000000000000000000`. A request for `200000000` share base units returned `200000000` raw base units; the reverse helper returned `200000000` share base units. This is a historical verification observation, not a current quote or fixture substituted into the UI.

Browser screenshots are generated into ignored `test-results/`. Original captured Foundry logs in `logs/` are preserved. The web app displays these as captured reference-test results rather than implying tests execute on every page load.

## Public deployment

The Vercel dashboard confirmed a **Hobby** project and a **Ready / Production** deployment. `https://invariant-lab.vercel.app` returned HTTP 200 with the Invariant page and no login redirect. Vercel's longer internal deployment aliases can be protected; use the public production domain for submission.

The deployed `/api/stocks?ticker=NVDAc` returned HTTP 200, block **50998424**, observed **2026-09-07T13:03:16.271Z**, with matching 2-share/raw helper values. AAPLc, TSLAc, and MSFTc each passed direct read-only checks, with 8 decimals and multiplier 1. An initial AMZNc read failed transiently; the deployed endpoint then returned HTTP 200 at block **50998453**, observed **2026-09-07T13:04:14.378Z**, name `Amazon.com Inc.`, decimals 8, multiplier 1. Public RPC availability remains an external dependency.

The deployed browser UI was also checked directly: reverse-split rejection displayed 8 raw required versus a 3-raw cap, the live snapshot appeared, and using that multiplier seeded an explicitly hypothetical experiment. This exposed a stale preset hash when seeding; the final code clears it. Additional browser regressions cover that behavior and unknown URL fragments.
