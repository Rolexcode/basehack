import { test, expect } from "@playwright/test";

const stockSnapshot = {
  ticker: "NVDAc",
  company: "NVIDIA",
  address: "0xb20000000000000000000078ee7ce2fe4908108c",
  name: "NVIDIA Corporation",
  symbol: "NVDAc",
  decimals: 8,
  multiplier: "1000000000000000000",
  precision: "1000000000000000000",
  blockNumber: "50992614",
  blockTimestamp: new Date().toISOString(),
  observedAt: new Date().toISOString(),
  endpoint: "https://base-rpc.publicnode.com",
  chainId: 8453,
  requestedUI: "200000000",
  rawForTwo: "200000000",
  uiRoundTrip: "200000000",
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/stocks**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"Test RPC offline"}',
    }),
  );
});

test("landing page opens the current Order Check experience", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Set your stock order/i })).toBeVisible();
  await page.getByRole("link", { name: "Open Invariant" }).first().click();
  await expect(page).toHaveURL(/\/playground$/);
  await expect(page.getByRole("heading", { name: /See what your stock order becomes/i })).toBeVisible();
});

test("Order Check preserves the requested amount and protects the spend cap", async ({ page }) => {
  await page.goto("/playground", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("naive-amount")).toHaveText("8");
  await expect(page.getByTestId("safe-amount")).toHaveText("2");

  await page.getByRole("button", { name: /Reverse split/ }).click();
  await expect(page.getByTestId("safe-amount")).toHaveText("Stopped");
  await expect(page.getByText("Your limit was protected")).toBeVisible();

  await page.getByLabel("Your spending limit").fill("8");
  await page.getByRole("button", { name: "Check order" }).click();
  await expect(page.getByTestId("safe-amount")).toHaveText("2");
});

test("edited inputs do not relabel a result until the order is checked", async ({ page }) => {
  await page.goto("/playground", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("naive-amount")).toHaveText("8");

  await page.getByLabel("When it goes through").fill("2");
  await expect(page.getByText("Order details changed. Check the order to update the result.")).toBeVisible();
  await expect(page.getByTestId("naive-amount")).toHaveText("8");

  await page.getByRole("button", { name: "Check order" }).click();
  await expect(page.getByTestId("naive-amount")).toHaveText("4");
  await expect(page.getByTestId("safe-amount")).toHaveText("2");
});

test("invalid order input fails without replacing the last valid result", async ({ page }) => {
  await page.goto("/playground", { waitUntil: "domcontentloaded" });
  await page.getByLabel("When it goes through").fill("0");
  await page.getByRole("button", { name: "Check order" }).click();
  await expect(page.getByText("Multiplier must be positive", { exact: false })).toBeVisible();
  await expect(page.getByTestId("safe-amount")).toHaveText("2");
});

test("live Base read shows an allowlisted stock and contract link", async ({ page }) => {
  await page.unroute("**/api/stocks**");
  await page.route("**/api/stocks**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(stockSnapshot),
    }),
  );

  await page.goto("/playground", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Read from Base" }).click();
  await expect(page.getByText("Base mainnet")).toBeVisible();
  await expect(page.getByText("NVDAc")).toBeVisible();
  await expect(page.getByRole("link", { name: "View token on BaseScan" })).toHaveAttribute(
    "href",
    `https://basescan.org/token/${stockSnapshot.address}`,
  );
});

test("Order Record changes its deterministic ID when the order changes", async ({ page }) => {
  await page.unroute("**/api/stocks**");
  await page.route("**/api/stocks**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(stockSnapshot),
    }),
  );

  await page.goto("/manifest", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Verified on Base")).toBeVisible();
  await page.getByRole("button", { name: "Create order record" }).click();
  await expect(page.getByRole("heading", { name: "Your order now has an ID." })).toBeVisible();
  const firstId = await page.locator("code").innerText();

  await page.getByLabel("How many shares?").fill("8");
  await expect(page.getByRole("heading", { name: "Your order now has an ID." })).toHaveCount(0);
  await page.getByRole("button", { name: "Create order record" }).click();
  expect(await page.locator("code").innerText()).not.toBe(firstId);
});

for (const width of [375, 768, 1280]) {
  test(`product routes have no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/playground", "/manifest", "/sdk"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${route} overflowed at ${width}px`,
      ).toBe(true);
    }
  });
}

test("unknown Order Check hashes do not crash the product", async ({ page }) => {
  await page.goto("/playground#toString", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("safe-amount")).toHaveText("2");
});
