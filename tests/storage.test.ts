import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync } from "node:fs";
import { describe, it, expect, afterEach } from "vitest";
import type { D1Database } from "@cloudflare/workers-types";
import {
  ensureCatalogue,
  nativeRateLimit,
  saveInvestigation,
  deleteInvestigation,
} from "../src/lib/storage";
import { investigateClaim } from "../src/lib/investigate";
const databases: DatabaseSync[] = [];
function database() {
  const sqlite = new DatabaseSync(":memory:");
  databases.push(sqlite);
  sqlite.exec(readFileSync("drizzle/0000_rainy_rumiko_fujikawa.sql", "utf8"));
  function prepare(sql: string) {
    let values: SQLInputValue[] = [];
    return {
      bind(...input: SQLInputValue[]) {
        values = input;
        return this;
      },
      async first() {
        return sqlite.prepare(sql).get(...values) ?? null;
      },
      async run() {
        return sqlite.prepare(sql).run(...values);
      },
    };
  }
  const db = {
    prepare,
    async batch(statements: ReturnType<typeof prepare>[]) {
      sqlite.exec("BEGIN");
      try {
        const results = await Promise.all(statements.map((s) => s.run()));
        sqlite.exec("COMMIT");
        return results;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  } as unknown as D1Database;
  return { db, sqlite };
}
afterEach(() => {
  databases.splice(0).forEach((d) => d.close());
});
describe("native Sites persistence", () => {
  it("seeds all catalogue records idempotently", async () => {
    const { db, sqlite } = database();
    await ensureCatalogue(db);
    await ensureCatalogue(db);
    expect(
      sqlite.prepare("SELECT COUNT(*) n FROM threat_techniques").get()?.n,
    ).toBe(14);
    expect(sqlite.prepare("SELECT COUNT(*) n FROM evidence").get()?.n).toBe(2);
  });
  it("enforces six requests per minute atomically", async () => {
    const { db } = database();
    const allowed = [];
    for (let i = 0; i < 7; i++)
      allowed.push(await nativeRateLimit(db, "visitor"));
    expect(allowed).toEqual([true, true, true, true, true, true, false]);
    expect(await nativeRateLimit(db, "another visitor")).toBe(true);
  });
  it("stores private results and enforces ownership on deletion", async () => {
    const { db, sqlite } = database();
    const result = await investigateClaim("Has the election date changed?");
    await saveInvestigation(db, "owner-a", result);
    expect(await deleteInvestigation(db, "owner-b", result.id)).toBe(false);
    expect(
      sqlite.prepare("SELECT COUNT(*) n FROM investigations").get()?.n,
    ).toBe(1);
    expect(await deleteInvestigation(db, "owner-a", result.id)).toBe(true);
    expect(sqlite.prepare("SELECT COUNT(*) n FROM claims").get()?.n).toBe(0);
  });
  it("purges expired results on the next investigation", async () => {
    const { db, sqlite } = database();
    const one = await investigateClaim("First date question");
    await saveInvestigation(db, "owner", one);
    sqlite.exec(
      "UPDATE investigations SET expires_at=0; UPDATE claims SET expires_at=0;",
    );
    const two = await investigateClaim("Second date question");
    await saveInvestigation(db, "owner", two);
    expect(sqlite.prepare("SELECT id FROM investigations").all()).toEqual([
      { id: two.id },
    ]);
  });
});
