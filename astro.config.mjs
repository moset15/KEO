import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import documentationLinks from "./scripts/remark-documentation.mjs";
export default defineConfig({
  site: "https://keo-observatory.mossy-wren-4073.chatgpt.site",
  output: "static",
  outDir: "./dist/client",
  markdown: { processor: unified({ remarkPlugins: [documentationLinks] }) },
});
