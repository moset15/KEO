import { afterEach, describe, expect, it, vi } from "vitest";
import { publicImportURL } from "../src/lib/import-policy";
import { importPublicURL } from "../src/lib/url-import";
import { checkRasterSize } from "../src/lib/raster-size";
import { handle, type Env } from "../worker";

const target = "https://www.iebc.or.ke/notice";
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
afterEach(() => vi.unstubAllGlobals());
describe("restricted public imports", () => {
  it.each([
    "http://www.iebc.or.ke/",
    "https://www.iebc.or.ke.attacker.test/",
    "https://www.iebc.or.ke@evil.test/",
    "https://user:pass@www.iebc.or.ke/",
    "https://127.0.0.1/",
    "https://[::1]/",
    "https://2130706433/",
    "https://localhost/",
    "https://www.iebc.or.ke:8443/",
    "file:///etc/passwd",
    "data:text/html,hello",
  ])("rejects unsafe target %s", (value) =>
    expect(() => publicImportURL(value)).toThrow(),
  );
  it("normalises hosts and drops fragments", () => {
    expect(publicImportURL("https://WWW.IEBC.OR.KE/notice#heading").href).toBe(
      target,
    );
  });
  it("imports bounded text with provenance, never a verdict", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("An election claim ".repeat(200), {
        headers: { "content-type": "text/plain" },
      }),
    );
    const result = await importPublicURL(target, fetcher);
    expect(result).toMatchObject({
      kind: "text",
      requested_url: target,
      final_url: target,
      truncated: true,
    });
    if (result.kind === "text") expect(result.text.length).toBe(2000);
    expect(result).not.toHaveProperty("status");
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      method: "GET",
      redirect: "manual",
      headers: { Accept: expect.any(String) },
    });
    expect(Object.keys(fetcher.mock.calls[0][1]!.headers!)).toEqual(["Accept"]);
  });
  it("passes HTML through a plain-text extractor", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("<article>A claim</article>", {
        headers: { "content-type": "text/html" },
      }),
    );
    const extract = vi
      .fn()
      .mockResolvedValue({ title: "Notice", text: "A claim" });
    expect(await importPublicURL(target, fetcher, extract)).toMatchObject({
      kind: "text",
      title: "Notice",
      text: "A claim",
    });
    expect(extract).toHaveBeenCalledWith("<article>A claim</article>");
  });
  it("follows relative redirects but rejects foreign, private and looping redirects", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(null, { status: 302, headers: { location: "/final" } }),
      )
      .mockResolvedValueOnce(
        new Response("Public claim", {
          headers: { "content-type": "text/plain" },
        }),
      );
    expect(await importPublicURL(target, fetcher)).toMatchObject({
      final_url: "https://www.iebc.or.ke/final",
    });
    for (const location of [
      "http://127.0.0.1/",
      "https://evil.test/",
      target,
    ]) {
      const denied = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(null, { status: 302, headers: { location } }),
        );
      await expect(importPublicURL(target, denied)).rejects.toThrow();
      expect(denied).toHaveBeenCalledTimes(1);
    }
  });
  it("bounds actual bytes, declared bytes and a stalled body", async () => {
    for (const headers of [
      { "content-type": "text/plain" },
      { "content-type": "text/plain", "content-length": "1000001" },
    ] as Record<string, string>[]) {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("x".repeat(1000001), { headers }));
      await expect(importPublicURL(target, fetcher)).rejects.toMatchObject({
        status: 413,
      });
    }
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("start"));
      },
    });
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(stream, { headers: { "content-type": "text/plain" } }),
      );
    await expect(
      importPublicURL(target, fetcher, undefined, 20),
    ).rejects.toMatchObject({ status: 504 });
  });
  it("rejects blocked, PDF, script-only and fake-image responses", async () => {
    for (const response of [
      new Response("secret diagnostic", { status: 403 }),
      new Response("%PDF", { headers: { "content-type": "application/pdf" } }),
      new Response("<svg>not an image</svg>", {
        headers: { "content-type": "image/png" },
      }),
      new Response("<script>bad</script>", {
        headers: { "content-type": "text/html" },
      }),
    ]) {
      await expect(
        importPublicURL(
          target,
          vi.fn<typeof fetch>().mockResolvedValue(response),
          async () => ({ title: "", text: "" }),
        ),
      ).rejects.toThrow();
    }
  });
  it("imports valid raster bytes and rejects oversized dimensions before decoding", async () => {
    const bytes = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(bytes, { headers: { "content-type": "image/png" } }),
      );
    expect(await importPublicURL(target, fetcher)).toMatchObject({
      kind: "image",
      data_url: "data:image/png;base64," + png,
    });
    expect(checkRasterSize(bytes, "image/png")).toEqual({
      width: 1,
      height: 1,
    });
    new DataView(bytes.buffer).setUint32(16, 50000);
    expect(() => checkRasterSize(bytes, "image/png")).toThrow("Resize");
    expect(() => checkRasterSize(new Uint8Array(25), "image/jpeg")).toThrow(
      "header",
    );
  });
  it("enforces same-origin, consent and available rate limiting before outbound retrieval", async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetcher);
    const env: Env = { ASSETS: { fetch: fetcher } };
    const request = (body: unknown, origin = "https://keo.example") =>
      new Request("https://keo.example/api/import", {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    expect(
      (
        await handle(
          request({ url: target, consent: true }, "https://evil.test"),
          env,
        )
      ).status,
    ).toBe(403);
    expect(
      (await handle(request({ url: target, consent: false }), env)).status,
    ).toBe(400);
    expect(
      (await handle(request({ url: target, consent: true }), env)).status,
    ).toBe(503);
    env.RATE_LIMITER = { limit: vi.fn().mockResolvedValue({ success: false }) };
    expect(
      (await handle(request({ url: target, consent: true }), env)).status,
    ).toBe(429);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
