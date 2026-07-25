import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "@/lib/config";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Serves stored slide images. Names are server-generated UUIDs — anything else is rejected. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/.test(file)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  try {
    const data = await fs.readFile(path.join(config.imagesDir, file));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
}
