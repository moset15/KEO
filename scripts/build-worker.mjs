import { build } from "esbuild";
import { mkdir, cp } from "node:fs/promises";
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
