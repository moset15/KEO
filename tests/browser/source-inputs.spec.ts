import { test, expect } from "@playwright/test";
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const provenance = {
  requested_url: "https://www.iebc.or.ke/notice",
  final_url: "https://www.iebc.or.ke/notice",
  retrieved_at: "2026-09-14T10:00:00Z",
};

test("an old failed image decode cannot erase a newer image or edited claim", async ({
  page,
}) => {
  await page.goto("/ask/");
  await page.getByText("Add screenshot or photograph", { exact: true }).click();
  await page.evaluate(() => {
    const original = window.createImageBitmap.bind(window);
    let count = 0;
    window.createImageBitmap = async (source: ImageBitmapSource) => {
      if (count++ === 0) {
        document.documentElement.dataset.oldDecodePending = "true";
        await new Promise((_, reject) =>
          window.addEventListener(
            "test:reject-old-image",
            () => reject(new Error("Old failed decoder")),
            { once: true },
          ),
        );
      }
      return original(source);
    };
  });
  const file = {
    name: "old.png",
    mimeType: "image/png",
    buffer: Buffer.from(png, "base64"),
  };
  await page.locator("#image-file").setInputFiles(file);
  await expect(page.locator("html")).toHaveAttribute(
    "data-old-decode-pending",
    "true",
  );
  await page.locator("#image-file").setInputFiles({ ...file, name: "new.png" });
  await expect(page.locator("#image-editor")).toBeVisible();
  await page.locator("#query").fill("Keep the newer claim");
  await page.evaluate(() =>
    window.dispatchEvent(new Event("test:reject-old-image")),
  );
  await expect(page.locator("#image-editor")).toBeVisible();
  await expect(page.locator("#query")).toHaveValue("Keep the newer claim");
  await expect(page.locator("#form-error")).toBeHidden();
});
test("Ask and Investigate expose screenshot controls with a local preview", async ({
  page,
}) => {
  for (const path of ["/ask/", "/investigate/"]) {
    await page.goto(path);
    await expect(
      page.getByText("Add screenshot or photograph", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Add article or image URL", { exact: true }),
    ).toBeVisible();
    await page
      .getByText("Add screenshot or photograph", { exact: true })
      .click();
    await page.locator("#image-file").setInputFiles({
      name: "notice.png",
      mimeType: "image/png",
      buffer: Buffer.from(png, "base64"),
    });
    await expect(page.locator("#image-editor")).toBeVisible();
    await expect(page.locator("#text-review-label")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Remove image" }).click();
    await expect(page.locator("#image-editor")).toBeHidden();
    for (const type of ["image/jpeg", "image/webp"]) {
      const data = await page.evaluate((type) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 12;
        return canvas.toDataURL(type).split(",")[1];
      }, type);
      await page.locator("#image-file").setInputFiles({
        name: "sample." + type.split("/")[1],
        mimeType: type,
        buffer: Buffer.from(data, "base64"),
      });
      await expect(page.locator("#image-editor")).toBeVisible();
      await page.getByRole("button", { name: "Remove image" }).click();
    }
  }
  await page.screenshot({
    path: "test-results/keo-inline-inputs-360.png",
    fullPage: true,
  });
});
test("article import is plain text and requires review before a text-only lookup", async ({
  page,
}) => {
  await page.route("**/api/import", (route) =>
    route.fulfill({
      json: {
        ...provenance,
        kind: "text",
        title: "<script>untrusted title</script>",
        text: "IEBC has changed the election date",
        truncated: true,
      },
    }),
  );
  await page.goto("/ask/");
  await page.getByText("Add article or image URL", { exact: true }).click();
  await page.locator("#source-url").fill(provenance.requested_url);
  await page.getByRole("button", { name: "Read link", exact: true }).click();
  await expect(page.locator("#url-status")).toContainText("Confirm");
  await page.locator("#url-consent").check();
  await page.getByRole("button", { name: "Read link", exact: true }).click();
  await expect(page.locator("#query")).toHaveValue(
    "IEBC has changed the election date",
  );
  await expect(page.locator("#url-status")).toContainText("2,000");
  await expect(page.locator("#import-note")).toContainText("unverified");
  await expect(page.locator("#import-note script")).toHaveCount(0);
  await page.getByRole("button", { name: "Ask KEO", exact: true }).click();
  await expect(page.locator("#result")).toBeEmpty();
  await page.locator("#text-review").check();
  const sent = page.waitForRequest((request) =>
    request.url().endsWith("/api/investigate"),
  );
  await page.getByRole("button", { name: "Ask KEO", exact: true }).click();
  expect((await sent).postDataJSON()).toEqual({
    query: "IEBC has changed the election date",
    mode: "ask",
  });
  await expect(page.locator("#result")).toContainText("insufficient evidence");
});
test("direct image import uses the local preview; failures and cancellation preserve manual input", async ({
  page,
}) => {
  await page.route("**/api/import", (route) =>
    route.fulfill({
      json: {
        ...provenance,
        kind: "image",
        data_url: "data:image/png;base64," + png,
      },
    }),
  );
  await page.goto("/investigate/");
  await page.getByText("Add article or image URL", { exact: true }).click();
  await page.locator("#source-url").fill(provenance.requested_url);
  await page.locator("#url-consent").check();
  await page.getByRole("button", { name: "Read link", exact: true }).click();
  await expect(page.locator("#image-editor")).toBeVisible();
  await expect(page.locator("#url-status")).toContainText("Image imported");
  await page.locator("#query").fill("Keep my manually entered claim");
  await page.route("**/api/import", (route) =>
    route.fulfill({
      status: 415,
      json: { error: "For PDFs, paste the claim or upload a screenshot." },
    }),
  );
  await page.getByRole("button", { name: "Read link", exact: true }).click();
  await expect(page.locator("#url-status")).toContainText("For PDFs");
  await expect(page.locator("#query")).toHaveValue(
    "Keep my manually entered claim",
  );
  await expect(page.locator("#image-editor")).toBeVisible();
  await page.route("**/api/import", (route) =>
    route.fulfill({
      json: {
        ...provenance,
        kind: "image",
        data_url:
          "data:image/png;base64," +
          Buffer.from(png, "base64").subarray(0, 24).toString("base64"),
      },
    }),
  );
  await page.getByRole("button", { name: "Read link", exact: true }).click();
  await expect(page.locator("#url-status")).toContainText(
    "could not be opened",
  );
  await expect(page.locator("#image-editor")).toBeVisible();
  await expect(page.locator("#query")).toHaveValue(
    "Keep my manually entered claim",
  );
  await page.getByRole("button", { name: "Remove image" }).click();
  await page.locator("#query").fill("Keep my manually entered claim");
  await page.route("**/api/import", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route
      .fulfill({
        json: {
          ...provenance,
          kind: "text",
          title: "Late",
          text: "Do not restore this",
          truncated: false,
        },
      })
      .catch(() => {});
  });
  await page.getByRole("button", { name: "Read link", exact: true }).click();
  await page.getByRole("button", { name: "Cancel import" }).click();
  await expect(page.locator("#url-status")).toContainText("cancelled");
  await page.waitForTimeout(700);
  await expect(page.locator("#query")).toHaveValue(
    "Keep my manually entered claim",
  );
  await expect(page.locator("#import-note")).toBeHidden();
});

test("manual typing cancels an in-flight import and an unused invalid URL does not block lookup", async ({
  page,
}) => {
  await page.route("**/api/import", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route
      .fulfill({
        json: {
          ...provenance,
          kind: "text",
          title: "Late",
          text: "Do not overwrite",
          truncated: false,
        },
      })
      .catch(() => {});
  });
  await page.goto("/ask/");
  await page.getByText("Add article or image URL", { exact: true }).click();
  await page.locator("#source-url").fill(provenance.requested_url);
  await page.locator("#url-consent").check();
  await page.getByRole("button", { name: "Read link", exact: true }).click();
  await page.locator("#query").fill("Manually entered claim");
  await expect(page.locator("#url-status")).toContainText("edited the claim");
  await page.waitForTimeout(700);
  await expect(page.locator("#query")).toHaveValue("Manually entered claim");
  await page.locator("#source-url").fill("not a URL");
  await page.route("**/api/investigate", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      status: 503,
      json: { error: "Test manual submission reached the server" },
    });
  });
  await page.getByRole("button", { name: "Ask KEO", exact: true }).click();
  await expect(page.locator("#query")).toBeDisabled();
  await expect(page.locator("#image-file")).toBeDisabled();
  await expect(page.locator("#form-error")).toContainText(
    "manual submission reached",
  );
});
