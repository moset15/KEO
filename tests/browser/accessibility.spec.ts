import { test, expect } from "@playwright/test";

test("methodology supports enlargement, keyboard focus and tablet layout", async ({
  page,
}) => {
  await page.goto("/methodology/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/keo-methodology-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 768, height: 1024 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("public documents remain readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 360, height: 800 },
  });
  const page = await context.newPage();
  await page.goto("/methodology/roadmap/");
  await expect(page.locator("article")).toContainText("Phase 4");
  await page.goto("/map/");
  await expect(page.locator("#map-records")).toBeVisible();
  await context.close();
});

test("record mobile loading performance and the flag-colour interface", async ({
  page,
}) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setCacheDisabled", { cacheDisabled: true });
  await session.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 1600000 / 8,
    uploadThroughput: 750000 / 8,
  });
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    new PerformanceObserver((list) => {
      (window as Window & { keoLcp?: number }).keoLcp = list
        .getEntries()
        .at(-1)?.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  for (const route of ["/", "/methodology/"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const lcp = await page.evaluate(
      () => (window as Window & { keoLcp?: number }).keoLcp,
    );
    console.log(
      "KEO mobile LCP",
      route,
      lcp,
      "ms; 360px, 1.6Mbps, 150ms latency, CPU x4, cold cache",
    );
    expect(lcp).toBeGreaterThan(0);
  }
  await page.screenshot({
    path: "test-results/keo-methodology-360.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/keo-methodology-desktop.png",
    fullPage: true,
  });
});
