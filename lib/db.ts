import Database from "better-sqlite3";
import fs from "node:fs";
import { config } from "./config";

let db: Database.Database | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS items (
  id            TEXT PRIMARY KEY,
  kind          TEXT NOT NULL CHECK (kind IN ('url','image')),
  source_url    TEXT,
  image_file    TEXT NOT NULL,
  width         INTEGER,
  height        INTEGER,
  status        TEXT NOT NULL DEFAULT 'developing'
                CHECK (status IN ('developing','ready','failed')),
  error         TEXT,
  design_type   TEXT,
  title         TEXT,
  keywords      TEXT NOT NULL DEFAULT '[]',
  description   TEXT,
  palette       TEXT NOT NULL DEFAULT '[]',
  image_prompt  TEXT,
  brief         TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_items_created ON items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_type ON items (design_type);
`;

/** Additive migrations only: existing columns are never altered. */
function ensureColumn(database: Database.Database, column: string, ddl: string): void {
  const columns = database.prepare("PRAGMA table_info(items)").all() as { name: string }[];
  if (!columns.some((c) => c.name === column)) {
    database.exec(`ALTER TABLE items ADD COLUMN ${ddl}`);
  }
}

/** Lazily opens the database, creating the data directory and schema on first use. */
export function getDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(config.imagesDir, { recursive: true });
  db = new Database(config.dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  ensureColumn(db, "style_hint", "style_hint TEXT");
  ensureColumn(db, "video_url", "video_url TEXT");
  return db;
}
