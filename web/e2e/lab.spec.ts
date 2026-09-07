import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Deliberately fail the external read so interaction tests never depend on public RPC uptime.
  await page.route("**/api/stocks**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"Test RPC offline"}',
    }),
  );
});
test("forward split, cap rejection, boundary success and exactness are legible", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("naive-amount")).toHaveText("8");
  await expect(page.getByTestId("safe-amount")).toHaveText("2");
  await page.getByRole("button", { name: "02 Reverse split" }).click();
  await expect(page.getByTestId("safe-amount")).toHaveText("Blocked");
  await page.getByLabel("Maximum raw-token spend").fill("8");
  await page.getByRole("button", { name: "Run experiment" }).click();
  await expect(page.getByTestId("safe-amount")).toHaveText("2");
  await page.getByRole("button", { name: "03 Exactness" }).click();
  await expect(page.getByTestId("safe-amount")).toHaveText("Blocked");
  await expect(
    page.getByText("1.999999999999999998", { exact: true }),
  ).toBeVisible();
});
test("intent changes and invalid inputs preserve correct applied results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("The user means").selectOption("position");
  await page.getByRole("button", { name: "Run experiment" }).click();
  await expect(page.getByTestId("safe-amount")).toHaveText("8");
  await page.getByLabel("At execution", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Run experiment" }).click();
  await expect(
    page.getByText("Multiplier must be positive", { exact: false }),
  ).toBeVisible();
  await expect(page.getByTestId("safe-amount")).toHaveText("8");
  await expect(
    page.getByRole("button", { name: "Export result" }),
  ).toBeDisabled();
});
test("RPC error stays explicit, recovery works, and full address is shown", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Live read unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByText("No sample values are substituted here.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "AAPLc Apple" }).click();
  await expect(page.locator(".address-line a")).toContainText(
    "0xb200000000000000000000c2e324d24d7eecd1fb",
  );
  await page.getByRole("button", { name: "Retry live read" }).click();
  await expect(
    page.getByRole("heading", { name: "Live read unavailable" }),
  ).toBeVisible();
});
for (const width of [375, 768, 1280])
  test(`layout at ${width}px has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "One intent. Two outcomes." }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/lab-${width}.png`,
      fullPage: true,
    });
  });
test("shareable presets, keyboard focus and downloadable report work", async ({
  page,
}) => {
  await page.goto("/#rounding");
  await expect(page.getByTestId("safe-amount")).toHaveText("Blocked");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to experiment" }),
  ).toBeFocused();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export result" }).click();
  expect((await download).suggestedFilename()).toBe(
    "invariant-experiment.json",
  );
});

test("unknown hashes do not crash the app", async ({ page }) => {
  await page.goto("/#toString");
  await expect(page.getByTestId("safe-amount")).toHaveText("2");
});

test("successful live read seeds a hypothetical scenario without retaining a misleading preset URL", async ({
  page,
}) => {
  // Explicit browser fixture, separate from documented actual public RPC smoke checks.
  await page.unroute("**/api/stocks**");
  await page.route("**/api/stocks**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
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
      }),
    }),
  );
  await page.goto("/#reverse");
  await page
    .getByRole("button", { name: "Use multiplier in experiment" })
    .click();
  await expect(page).toHaveURL(/#experiment$/);
  await expect(page.getByTestId("safe-amount")).toHaveText("2");
  await expect(
    page.getByText("The subsequent 4× change is hypothetical", {
      exact: false,
    }),
  ).toBeVisible();
});
