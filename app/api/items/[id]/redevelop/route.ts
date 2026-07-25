import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { redevelopItem } from "@/lib/develop";
import { getDb } from "@/lib/db";
import * as repo from "@/lib/items-repo";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** Re-runs the develop pipeline on a failed slide. */
export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const item = repo.findById(id);
  if (!item) {
    return NextResponse.json({ ok: false, error: "Slide not found" }, { status: 404 });
  }
  if (item.status === "developing") {
    return NextResponse.json({ ok: false, error: "Slide is already developing" }, { status: 409 });
  }
  getDb()
    .prepare("UPDATE items SET status = 'developing', error = NULL WHERE id = ?")
    .run(id);
  after(() => redevelopItem(id));
  return NextResponse.json({ ok: true, data: repo.findById(id) });
}
