import { describe, it, expect, vi } from "vitest";
import { validateImage, extractImageClaim } from "../src/lib/images";
import { GatewayProvider } from "../src/lib/gateway";
import { handle, type Env } from "../worker";
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const config = {
  AI_ENABLED: "true",
  OPENAI_API_KEY: "test-only",
  AI_MODEL: "test-only",
};
const response = (text: string) =>
  Response.json({
    status: "completed",
    output: [{ type: "message", content: [{ type: "output_text", text }] }],
  });
describe("image verification boundary", () => {
  it("accepts supported bytes and rejects mismatched types, SVG and malformed data", () => {
    expect(validateImage(png).type).toBe("image/png");
    expect(() => validateImage(png.replace("png", "jpeg"))).toThrow();
    expect(() => validateImage("data:image/svg+xml;base64,PHN2Zz4=")).toThrow();
    expect(() => validateImage("data:image/png;base64,invalid")).toThrow();
  });
  it("extracts structured claims through the configured provider and redacts phone numbers", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      response(
        JSON.stringify({
          claim: "Call +254712345678 for the election date",
          legible: true,
          limitations: [],
        }),
      ),
    );
    const provider = new GatewayProvider(config, fetcher);
    const result = await extractImageClaim(provider, png);
    expect(result.claim).not.toContain("+254712345678");
    const request = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(request.text.format.strict).toBe(true);
    expect(request.store).toBe(false);
    expect(request.input[0].content[1].image_url).toBe(png);
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://api.openai.com/v1/responses",
    );
  });
  it("does not create a claim from illegible images or malformed model output", async () => {
    for (const text of [
      "not JSON",
      JSON.stringify({ claim: "", legible: false, limitations: ["Blurred"] }),
    ]) {
      const provider = new GatewayProvider(
        config,
        vi.fn<typeof fetch>().mockResolvedValue(response(text)),
      );
      await expect(extractImageClaim(provider, png)).rejects.toThrow();
    }
  });
  it("requires consent before any image call and reports missing live access", async () => {
    const env: Env = { ASSETS: { fetch: async () => new Response("static") } };
    const request = (consent: boolean) =>
      new Request("https://keo.example/api/investigate", {
        method: "POST",
        headers: {
          origin: "https://keo.example",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          query: "Verify this notice",
          mode: "verify",
          image: png,
          consent,
        }),
      });
    expect((await handle(request(false), env)).status).toBe(400);
    const result = await handle(request(true), env);
    expect(result.status).toBe(503);
    expect(await result.json()).toHaveProperty("error");
  });
});
