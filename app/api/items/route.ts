import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { config } from "@/lib/config";
import { developImageItem, developUrlItem } from "@/lib/develop";
import * as repo from "@/lib/items-repo";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const ALLOWED_UPLOADS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function GET() {
  return NextResponse.json({ ok: true, data: repo.findAll() });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("multipart/form-data")) {
      return await createFromUpload(request);
    }
    return await createFromUrl(request);
  } catch (error) {
    console.error("[api/items] save failed:", error);
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

async function createFromUrl(request: NextRequest) {
  const body: unknown = await request.json();
  const rawUrl =
    typeof body === "object" && body !== null && "url" in body ? (body as { url: unknown }).url : null;
  if (typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "Provide a URL to save" }, { status: 400 });
  }
  const normalized = rawUrl.trim().match(/^https?:\/\//) ? rawUrl.trim() : `https://${rawUrl.trim()}`;
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    return NextResponse.json({ ok: false, error: `"${rawUrl}" is not a valid URL` }, { status: 400 });
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return NextResponse.json({ ok: false, error: "Only http(s) URLs can be captured" }, { status: 400 });
  }

  const item = repo.create({
    kind: "url",
    sourceUrl: url.toString(),
    imageFile: `${randomUUID()}.png`,
  });
  after(() => developUrlItem(item.id, url.toString()));
  return NextResponse.json({ ok: true, data: item }, { status: 201 });
}

async function createFromUpload(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Attach an image file" }, { status: 400 });
  }
  const ext = ALLOWED_UPLOADS[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: `Unsupported image type "${file.type}" — use PNG, JPEG, WebP, or GIF` },
      { status: 400 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "Image exceeds the 20 MB limit" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const imageFile = `${randomUUID()}.${ext}`;
  await fs.mkdir(config.imagesDir, { recursive: true });
  await fs.writeFile(path.join(config.imagesDir, imageFile), buffer);

  const meta = await sharp(buffer)
    .metadata()
    .catch(() => null);

  const item = repo.create({
    kind: "image",
    imageFile,
    width: meta?.width ?? null,
    height: meta?.height ?? null,
  });
  after(() => developImageItem(item.id));
  return NextResponse.json({ ok: true, data: item }, { status: 201 });
}
