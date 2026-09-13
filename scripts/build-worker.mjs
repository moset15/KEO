import { build } from "esbuild";
import { mkdir, cp, readdir } from "node:fs/promises";
await build({
  entryPoints: ["worker/index.ts"],
  outfile: "dist/server/index.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  loader: { ".md": "text" },
  minify: true,
});
await mkdir("dist/.openai", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
await cp("drizzle", "dist/.openai/drizzle", { recursive: true });
await mkdir("dist/client/ocr/core", { recursive: true });
await mkdir("dist/client/ocr/lang", { recursive: true });
await cp(
  "node_modules/tesseract.js/dist/worker.min.js",
  "dist/client/ocr/worker.min.js",
);
for (const file of await readdir("node_modules/tesseract.js-core")) {
  if (/^tesseract-core.*-lstm\.wasm\.js$/.test(file))
    await cp(
      "node_modules/tesseract.js-core/" + file,
      "dist/client/ocr/core/" + file,
    );
}
await cp(
  "node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz",
  "dist/client/ocr/lang/eng.traineddata.gz",
);
await cp(
  "node_modules/tesseract.js/LICENSE.md",
  "dist/client/ocr/TESSERACT-LICENSE",
);
await cp(
  "node_modules/tesseract.js-core/LICENSE",
  "dist/client/ocr/CORE-LICENSE",
);
