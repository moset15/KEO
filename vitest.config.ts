import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [
    {
      name: "prompt-text",
      transform(source, id) {
        if (id.endsWith(".md"))
          return {
            code: "export default " + JSON.stringify(source),
            map: null,
          };
      },
    },
  ],
  test: { include: ["tests/**/*.test.ts"] },
});
