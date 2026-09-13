import { test, expect } from "@playwright/test";
test("reads a real image locally, then sends reviewed text without pixels or model calls", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  const requests: { url: string; method: string; body: string | null }[] = [];
  context.on("request", (request) =>
    requests.push({
      url: request.url(),
      method: request.method(),
      body: request.postData(),
    }),
  );
  await page.goto("/verify/");
  expect((await (await page.request.get("/api/status")).json()).live).toBe(
    false,
  );
  expect(requests.some((request) => request.url.includes("/ocr/"))).toBe(false);
  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 1200, 200);
    ctx.fillStyle = "black";
    ctx.font = "48px Arial";
    ctx.fillText("IEBC changed the election date", 40, 100);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page
    .locator("#image-file")
    .setInputFiles({
      name: "test-notice.png",
      mimeType: "image/png",
      buffer: Buffer.from(image, "base64"),
    });
  await page.getByRole("button", { name: "Read text on this device" }).click();
  await expect(page.locator("#ocr-status")).toContainText(
    "Text extracted locally",
    { timeout: 45000 },
  );
  await expect(page.locator("#query")).toHaveValue(
    /IEBC changed the election date/i,
  );
  expect(requests.filter((request) => request.method === "POST")).toHaveLength(
    0,
  );
  expect(
    requests.every(
      (request) => new URL(request.url).origin === "http://127.0.0.1:8787",
    ),
  ).toBe(true);
  await page.locator("#query").fill("IEBC has changed the election date");
  await page.locator("#text-review").check();
  const submitted = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/investigate") && request.method() === "POST",
  );
  await page.getByRole("button", { name: "Check sources" }).click();
  const body = (await submitted).postDataJSON();
  expect(body).toEqual({
    query: "IEBC has changed the election date",
    mode: "investigate",
  });
  await expect(page.locator("#result")).toContainText("insufficient evidence");
  await expect(page.locator("#result")).toContainText("Where to check next");
  await expect(page.locator("#image-editor")).toBeHidden();
  await page.screenshot({
    path: "test-results/keo-no-llm-result.png",
    fullPage: true,
  });
});

test("missing OCR assets leave manual entry available", async ({ page }) => {
  await page.route("**/ocr/worker.min.js", (route) => route.abort());
  await page.goto("/verify/");
  const bytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  await page
    .locator("#image-file")
    .setInputFiles({ name: "blank.png", mimeType: "image/png", buffer: bytes });
  await page.getByRole("button", { name: "Read text on this device" }).click();
  await expect(page.locator("#ocr-status")).toContainText("could not be read", {
    timeout: 15000,
  });
  await page.locator("#query").fill("Manual transcription works");
  await expect(page.locator("#query")).toBeEditable();
  await expect(
    page.getByRole("button", { name: "Check sources" }),
  ).toBeEnabled();
});
