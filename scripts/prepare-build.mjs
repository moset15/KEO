import { rm } from "node:fs/promises";
// Only remove this project's generated output, including obsolete asset layouts.
await rm(new URL("../dist", import.meta.url), { recursive: true, force: true });
