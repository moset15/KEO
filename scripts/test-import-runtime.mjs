import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";

// Runs the real Worker API and HTMLRewriter against local publisher fixtures.
const bundle = await build({
  stdin: {
    contents:
      'import {handle} from "./worker/index.ts"; export default {fetch(request) {return handle(request, {RATE_LIMITER:{limit:async()=>({success:true})}, ASSETS:{fetch:async()=>new Response("fixture")}})}};',
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "browser",
  loader: { ".md": "text" },
});
const calls = [];
const runtime = new Miniflare(
  convertV4MiniflareOptions({
    workers: [
      {
        name: "keo-import-runtime-test",
        modules: true,
        script: bundle.outputFiles[0].text,
        compatibilityDate: "2026-09-12",
        outboundService: async (request) => {
          calls.push(request.url);
          assert.equal(request.headers.get("cookie"), null);
          assert.equal(request.headers.get("authorization"), null);
          const path = new URL(request.url).pathname;
          if (path === "/redirect")
            return new Response(null, {
              status: 302,
              headers: { location: "/notice" },
            });
          if (path === "/escape")
            return new Response(null, {
              status: 302,
              headers: { location: "https://127.0.0.1/" },
            });
          if (path === "/image")
            return new Response(
              Buffer.from(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                "base64",
              ),
              { headers: { "content-type": "image/png" } },
            );
          return new Response(
            '<!doctype html><html><head><title>Public &amp; official notice</title><script>SECRET SCRIPT</script></head><body><nav>UNWANTED NAV</nav><main><article><h1>Election notice</h1><p>The claim &amp; its date need checking.</p><script>BAD SCRIPT</script><span hidden>HIDDEN TEXT</span><img src="https://tracker.invalid/pixel"><iframe src="https://tracker.invalid/frame">IFRAME TEXT</iframe></article></main></body></html>',
            { headers: { "content-type": "text/html" } },
          );
        },
      },
    ],
  }),
);
try {
  const retrieve = (path) =>
    runtime.dispatchFetch("https://keo.example/api/import", {
      method: "POST",
      headers: {
        origin: "https://keo.example",
        "content-type": "application/json",
        cookie: "private=do-not-forward",
        authorization: "test-do-not-forward",
      },
      body: JSON.stringify({
        url: "https://www.iebc.or.ke" + path,
        consent: true,
      }),
    });
  const page = await retrieve("/redirect");
  assert.equal(page.status, 200);
  const result = await page.json();
  assert.equal(result.title, "Public & official notice");
  assert.equal(
    result.text,
    "Election notice The claim & its date need checking.",
  );
  assert.equal(result.final_url, "https://www.iebc.or.ke/notice");
  assert.equal((await retrieve("/escape")).status, 400);
  const image = await (await retrieve("/image")).json();
  assert.equal(image.kind, "image");
  assert.match(image.data_url, /^data:image\/png;base64,/);
  assert.deepEqual(calls, [
    "https://www.iebc.or.ke/redirect",
    "https://www.iebc.or.ke/notice",
    "https://www.iebc.or.ke/escape",
    "https://www.iebc.or.ke/image",
  ]);
  console.log(
    "PASS: native HTML extraction, safe redirects, raster import, no embedded fetches or forwarded credentials.",
  );
} finally {
  await runtime.dispose();
}
