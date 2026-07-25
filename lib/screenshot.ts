import { chromium } from "playwright";
import sharp from "sharp";
import { findFeaturedImage } from "./featured-image";

export type CaptureExt = "png" | "jpg" | "webp" | "gif";

export type Capture = Readonly<{
  buffer: Buffer;
  ext: CaptureExt;
  pageTitle: string;
  width: number;
  height: number;
  method: "featured" | "screenshot";
  videoUrl: string | null;
}>;

const VIEWPORT = { width: 1440, height: 900 } as const;
const NAV_TIMEOUT_MS = 30_000;
const SETTLE_MS = 2_500;

const EXT_BY_TYPE: Record<string, CaptureExt> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Captures a URL: on gallery pages the dominant featured image is saved
 * directly; everything else gets an above-the-fold screenshot with a real
 * browser. Throws with a user-readable message when the page cannot be reached.
 */
export async function captureUrl(url: string): Promise<Capture> {
  const browser = await chromium.launch({
    args: ["--disable-dev-shm-usage", "--no-sandbox"],
  });
  try {
    const page = await browser.newPage({
      viewport: { ...VIEWPORT },
      deviceScaleFactor: 2,
    });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {
      /* busy pages never go idle; the settle delay below covers them */
    });
    await page.waitForTimeout(SETTLE_MS);
    const pageTitle = (await page.title()) || new URL(url).hostname;

    const featured = await findFeaturedImage(page);
    if (featured) {
      const capture = await packageFeatured(featured, pageTitle);
      if (capture) return capture;
    }

    const png = await page.screenshot({ type: "png", fullPage: false });
    return {
      buffer: png,
      ext: "png",
      pageTitle,
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      method: "screenshot",
      videoUrl: null,
    };
  } finally {
    await browser.close();
  }
}

/** Normalizes a downloaded featured image; null falls back to the screenshot. */
async function packageFeatured(
  featured: { buffer: Buffer; contentType: string; videoSrc: string | null },
  pageTitle: string,
): Promise<Capture | null> {
  try {
    const known = EXT_BY_TYPE[featured.contentType];
    const finalBuffer = known ? featured.buffer : await sharp(featured.buffer).png().toBuffer();
    const ext = known ?? "png";
    const meta = await sharp(finalBuffer).metadata();
    return {
      buffer: finalBuffer,
      ext,
      pageTitle,
      width: meta.width ?? VIEWPORT.width,
      height: meta.height ?? VIEWPORT.height,
      method: "featured",
      videoUrl: featured.videoSrc,
    };
  } catch {
    return null;
  }
}
