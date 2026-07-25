import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import type { Analysis, Item, ItemKind } from "./types";

type ItemRow = {
  id: string;
  kind: ItemKind;
  source_url: string | null;
  image_file: string;
  video_url: string | null;
  width: number | null;
  height: number | null;
  status: Item["status"];
  error: string | null;
  design_type: string | null;
  style_hint: string | null;
  title: string | null;
  keywords: string;
  description: string | null;
  palette: string;
  image_prompt: string | null;
  brief: string | null;
  created_at: string;
};

function parseJsonArray(raw: string): readonly string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function toItem(row: ItemRow): Item {
  return {
    id: row.id,
    kind: row.kind,
    sourceUrl: row.source_url,
    imageFile: row.image_file,
    videoUrl: row.video_url,
    width: row.width,
    height: row.height,
    status: row.status,
    error: row.error,
    designType: row.design_type,
    styleHint: row.style_hint,
    title: row.title,
    keywords: parseJsonArray(row.keywords),
    description: row.description,
    palette: parseJsonArray(row.palette),
    imagePrompt: row.image_prompt,
    brief: row.brief,
    createdAt: row.created_at,
  };
}

export function findAll(): readonly Item[] {
  const rows = getDb()
    .prepare("SELECT * FROM items ORDER BY created_at DESC")
    .all() as ItemRow[];
  return rows.map(toItem);
}

export function findById(id: string): Item | null {
  const row = getDb().prepare("SELECT * FROM items WHERE id = ?").get(id) as
    | ItemRow
    | undefined;
  return row ? toItem(row) : null;
}

/** Every non-null design type currently in the library, for canonicalization. */
export function distinctDesignTypes(): readonly string[] {
  const rows = getDb()
    .prepare(
      "SELECT design_type AS t, COUNT(*) AS n FROM items WHERE design_type IS NOT NULL GROUP BY design_type ORDER BY n DESC",
    )
    .all() as { t: string; n: number }[];
  return rows.map((r) => r.t);
}

export function create(input: {
  kind: ItemKind;
  sourceUrl?: string | null;
  imageFile: string;
  width?: number | null;
  height?: number | null;
}): Item {
  const id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO items (id, kind, source_url, image_file, width, height)
       VALUES (@id, @kind, @sourceUrl, @imageFile, @width, @height)`,
    )
    .run({
      id,
      kind: input.kind,
      sourceUrl: input.sourceUrl ?? null,
      imageFile: input.imageFile,
      width: input.width ?? null,
      height: input.height ?? null,
    });
  const created = findById(id);
  if (!created) throw new Error(`Item ${id} vanished after insert`);
  return created;
}

export function markReady(id: string, analysis: Analysis): Item | null {
  getDb()
    .prepare(
      `UPDATE items SET
         status = 'ready', error = NULL,
         design_type = @designType, style_hint = @styleHint, title = @title,
         keywords = @keywords, description = @description,
         palette = @palette, image_prompt = @imagePrompt, brief = @brief
       WHERE id = @id`,
    )
    .run({
      id,
      designType: analysis.designType,
      styleHint: analysis.styleHint,
      title: analysis.title,
      keywords: JSON.stringify(analysis.keywords),
      description: analysis.description,
      palette: JSON.stringify(analysis.palette),
      imagePrompt: analysis.imagePrompt,
      brief: analysis.brief,
    });
  return findById(id);
}

export function markFailed(id: string, error: string): Item | null {
  getDb()
    .prepare("UPDATE items SET status = 'failed', error = ? WHERE id = ?")
    .run(error, id);
  return findById(id);
}

export function setCapture(
  id: string,
  imageFile: string,
  width: number,
  height: number,
  videoUrl: string | null,
): void {
  getDb()
    .prepare("UPDATE items SET image_file = ?, width = ?, height = ?, video_url = ? WHERE id = ?")
    .run(imageFile, width, height, videoUrl, id);
}

export function remove(id: string): boolean {
  const result = getDb().prepare("DELETE FROM items WHERE id = ?").run(id);
  return result.changes > 0;
}
