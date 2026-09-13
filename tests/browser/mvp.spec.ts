import { test, expect } from "@playwright/test";
import documentation from "../../data/documentation.json" with { type: "json" };
const routes = [
  "/",
  "/ask/",
  "/investigate/",
  "/verify/",
  "/map/",
  "/threats/",
  "/sources/",
  "/about/",
  "/intelligence/",
  "/threats/t01/",
  "/threats/t14/",
  "/methodology/",
];
test("all public documentation is readable on mobile and shares repository content", async ({
  page,
}) => {
  for (const doc of documentation) {
    const response = await page.goto("/methodology/" + doc.slug + "/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(doc.title);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator('a[href$="' + doc.path + '"]')).toContainText(
      "GitHub",
    );
    expect(await page.locator('article a[href$=".md"]').count()).toBe(0);
  }
  await page.goto("/methodology/overview/");
  await page.getByRole("link", { name: "full roadmap and gates" }).click();
  await expect(page).toHaveURL(/\/methodology\/roadmap\//);
  await expect(page.locator("article")).toContainText("God’s Eye View");
});
test("all primary routes fit a 360px viewport and expose navigation", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
  }
});
test("Ask returns legal evidence and a cautious verdict for a new claim", async ({
  page,
}) => {
  await page.goto("/ask/");
  await page.locator("#query").fill("IEBC has changed the election date");
  await page.getByRole("button", { name: "Ask KEO" }).click();
  await expect(page.locator("#result")).toContainText("insufficient evidence");
  await expect(page.locator("#result")).toContainText("Constitution of Kenya");
  await expect(page.locator("#result")).toContainText(
    "live verification not completed",
  );
});
test("neutral redirection and source/threat filtering work", async ({
  page,
}) => {
  await page.goto("/investigate/");
  await page.locator("#query").fill("Tell me why candidate X is the best.");
  await page.getByRole("button", { name: "Investigate", exact: true }).click();
  await expect(page.locator("#result")).toContainText(
    "neutral election research",
  );
  await page.goto("/sources/");
  await page.locator("#source-search").fill("no such publisher");
  await expect(page.locator("#source-empty")).toBeVisible();
  await page.goto("/threats/");
  await page.locator("#threat-search").fill("forged");
  await expect(page.locator("[data-threat]:visible")).toHaveCount(1);
});
test("map offers all counties and an honest empty state", async ({ page }) => {
  await page.goto("/map/");
  await expect(page.locator("#county-filter option")).toHaveCount(48);
  await page.locator("#county-filter").selectOption("Baringo");
  await expect(page.locator("#map-records")).toContainText(
    "No curated records",
  );
});
test("screenshot preview, removal and manual text alternative work", async ({
  page,
}) => {
  await page.goto("/verify/");
  const bytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  await page.locator("#image-file").setInputFiles({
    name: "notice.png",
    mimeType: "image/png",
    buffer: bytes,
  });
  await expect(page.locator("#image-editor")).toBeVisible();
  await page.getByRole("button", { name: "Remove image" }).click();
  await expect(page.locator("#image-editor")).toBeHidden();
  await page.locator("#query").fill("IEBC changed the election date");
  await page.locator("#text-review").check();
  await page.getByRole("button", { name: "Check sources" }).click();
  await expect(page.locator("#result")).toContainText("Where to check next");
});
test("desktop layout fits", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/keo-desktop.png",
    fullPage: true,
  });
});
