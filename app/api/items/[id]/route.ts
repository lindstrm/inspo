import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "@/lib/config";
import * as repo from "@/lib/items-repo";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const item = repo.findById(id);
  if (!item) {
    return NextResponse.json({ ok: false, error: "Slide not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data: item });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const item = repo.findById(id);
  if (!item) {
    return NextResponse.json({ ok: false, error: "Slide not found" }, { status: 404 });
  }
  repo.remove(id);
  await fs.unlink(path.join(config.imagesDir, item.imageFile)).catch(() => {
    /* the record is gone either way; a stray file is harmless */
  });
  return NextResponse.json({ ok: true, data: { id } });
}
