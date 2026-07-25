import type { Page } from "playwright";

/**
 * Featured-image capture: on inspiration-gallery pages (dribbble, landing.love,
 * craftwork.design, …) the page is chrome around one large artwork. When such a
 * dominant image exists, saving it beats screenshotting the chrome. A dominant
 * <video> counts through its poster image (gallery sites use video previews
 * with a curated hero poster). Normal sites, where the page itself is the
 * design, fail these thresholds and fall back to a screenshot.
 */

export type ImageCandidate = Readonly<{
  src: string;
  area: number;
  top: number;
  naturalWidth: number;
  order: number;
  videoSrc?: string | null;
}>;

export type FeaturedImage = Readonly<{
  buffer: Buffer;
  contentType: string;
  videoSrc: string | null;
}>;

const MIN_NATURAL_WIDTH = 700;
const MIN_VIEWPORT_FRACTION = 0.28;
const MAX_TOP_FRACTION = 1.2;
const MAX_BYTES = 30 * 1024 * 1024;

/** Picks the first image in document order that dominates the shown viewport. Pure; tested. */
export function pickFeatured(
  candidates: readonly ImageCandidate[],
  viewportWidth: number,
  viewportHeight: number,
): ImageCandidate | null {
  const minArea = viewportWidth * viewportHeight * MIN_VIEWPORT_FRACTION;
  const eligible = candidates
    .filter((c) => c.src.startsWith("http") && !c.src.toLowerCase().split("?")[0].endsWith(".svg"))
    .filter(
      (c) =>
        c.naturalWidth >= MIN_NATURAL_WIDTH &&
        c.area >= minArea &&
        c.top < viewportHeight * MAX_TOP_FRACTION,
    )
    .sort((a, b) => a.order - b.order);
  return eligible[0] ?? null;
}

/** Finds and downloads the page's featured image, or null when the page has none. */
export async function findFeaturedImage(page: Page): Promise<FeaturedImage | null> {
  const viewport = page.viewportSize();
  if (!viewport) return null;

  const candidates: ImageCandidate[] = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("img, video")).map((el, order) => {
      const rect = el.getBoundingClientRect();
      if (el instanceof HTMLVideoElement) {
        return {
          src: el.poster || "",
          area: rect.width * rect.height,
          top: rect.top,
          // Posters carry no intrinsic size upfront; the video's resolution
          // (or its rendered width while metadata loads) stands in for it.
          naturalWidth: el.videoWidth || Math.round(rect.width),
          order,
          videoSrc: el.currentSrc || el.src || null,
        };
      }
      const img = el as HTMLImageElement;
      return {
        src: img.currentSrc || img.src || "",
        area: rect.width * rect.height,
        top: rect.top,
        naturalWidth: img.naturalWidth,
        order,
      };
    }),
  );

  const featured = pickFeatured(candidates, viewport.width, viewport.height);
  if (!featured) return null;

  try {
    const response = await page.request.get(featured.src, { timeout: 20_000 });
    if (!response.ok()) return null;
    const contentType = (response.headers()["content-type"] ?? "").split(";")[0].trim();
    if (!contentType.startsWith("image/")) return null;
    const buffer = await response.body();
    if (buffer.length === 0 || buffer.length > MAX_BYTES) return null;
    const videoSrc =
      featured.videoSrc && featured.videoSrc.startsWith("http") ? featured.videoSrc : null;
    return { buffer, contentType, videoSrc };
  } catch {
    return null;
  }
}
