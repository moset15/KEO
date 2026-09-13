import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import { sources, evidence } from "./repository";
import { events } from "./events";
import taxonomy from "../../data/threats/taxonomy.json";
import type { Investigation } from "./schemas";
export interface StorageEnv {
  DB?: D1Database;
  BUCKET?: R2Bucket;
}
const version = "2026-09-13-1";
export async function ensureCatalogue(db: D1Database) {
  const meta = await db
    .prepare("SELECT version FROM catalogue_meta WHERE id = ?")
    .bind("catalogue")
    .first<{ version: string }>();
  if (meta?.version === version) return;
  const writes = [
    ...sources.map((s) =>
      db
        .prepare("INSERT OR REPLACE INTO sources (id,payload) VALUES (?,?)")
        .bind(s.source_id, JSON.stringify(s)),
    ),
    ...evidence.map((e) =>
      db
        .prepare(
          "INSERT OR REPLACE INTO evidence (id,source_id,payload) VALUES (?,?,?)",
        )
        .bind(e.id, e.source_id, JSON.stringify(e)),
    ),
    ...events.map((e) =>
      db
        .prepare(
          "INSERT OR REPLACE INTO events (id,county,payload) VALUES (?,?,?)",
        )
        .bind(e.id, e.location.county, JSON.stringify(e)),
    ),
    ...taxonomy.map((t) =>
      db
        .prepare(
          "INSERT OR REPLACE INTO threat_techniques (id,payload) VALUES (?,?)",
        )
        .bind(t.id, JSON.stringify(t)),
    ),
    db
      .prepare(
        "INSERT OR REPLACE INTO catalogue_meta (id,version) VALUES (?,?)",
      )
      .bind("catalogue", version),
  ];
  await db.batch(writes);
}
export async function hash(value: string) {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  ]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
export async function nativeRateLimit(
  db: D1Database,
  caller: string,
): Promise<boolean> {
  const minute = Math.floor(Date.now() / 60000);
  const key = await hash(caller + ":" + minute);
  const record = await db
    .prepare(
      "INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count",
    )
    .bind(key, Date.now() + 120000)
    .first<{ count: number }>();
  await db
    .prepare("DELETE FROM rate_limits WHERE expires_at < ?")
    .bind(Date.now())
    .run();
  return !!record && record.count <= 6;
}
export async function saveInvestigation(
  db: D1Database,
  owner: string,
  result: Investigation,
) {
  const now = Date.now(),
    expiry = now + 86400000;
  await db.batch([
    db.prepare("DELETE FROM investigations WHERE expires_at < ?").bind(now),
    db.prepare("DELETE FROM claims WHERE expires_at < ?").bind(now),
    db
      .prepare(
        "INSERT INTO claims (id,text,status,expires_at) VALUES (?,?,?,?)",
      )
      .bind(result.id, result.claim, result.status, expiry),
    db
      .prepare(
        "INSERT INTO investigations (id,owner,payload,created_at,expires_at) VALUES (?,?,?,?,?)",
      )
      .bind(result.id, owner, JSON.stringify(result), now, expiry),
  ]);
}
export async function deleteInvestigation(
  db: D1Database,
  owner: string,
  id: string,
) {
  const record = await db
    .prepare("SELECT id FROM investigations WHERE id = ? AND owner = ?")
    .bind(id, owner)
    .first();
  if (!record) return false;
  await db.batch([
    db
      .prepare("DELETE FROM investigations WHERE id = ? AND owner = ?")
      .bind(id, owner),
    db.prepare("DELETE FROM claims WHERE id = ?").bind(id),
  ]);
  return true;
}
export async function cleanTemporaryImages(bucket: R2Bucket) {
  const objects = await bucket.list({ prefix: "temporary/", limit: 100 });
  const expired = objects.objects
    .filter((o) => o.uploaded.getTime() < Date.now() - 3600000)
    .map((o) => o.key);
  if (expired.length) await bucket.delete(expired);
}
