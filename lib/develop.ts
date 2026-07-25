import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config";
import { analyzeItem } from "./analyze";
import { captureUrl } from "./screenshot";
import * as repo from "./items-repo";

/**
 * The darkroom: everything that happens to a save after the API has already
 * responded. Failures land on the item as a visible status, never thrown
 * upward — by the time this runs, there is no request left to fail.
 */

async function analyzeAndFinish(id: string): Promise<void> {
  const item = repo.findById(id);
  if (!item) return;
  try {
    const analysis = await analyzeItem(item, repo.distinctDesignTypes());
    repo.markReady(id, analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error(`[develop] analysis failed for ${id}:`, error);
    repo.markFailed(id, message);
  }
}

/** URL save: grab the page's featured image when one dominates (gallery
    sites), otherwise screenshot with a real browser — then analyze. */
export async function developUrlItem(id: string, url: string): Promise<void> {
  const item = repo.findById(id);
  if (!item) return;
  try {
    const capture = await captureUrl(url);
    const imageFile = `${randomUUID()}.${capture.ext}`;
    await fs.writeFile(path.join(config.imagesDir, imageFile), capture.buffer);
    repo.setCapture(id, imageFile, capture.width, capture.height, capture.videoUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Screenshot capture failed";
    console.error(`[develop] capture failed for ${id}:`, error);
    repo.markFailed(id, `Could not capture ${url}: ${message}`);
    return;
  }
  await analyzeAndFinish(id);
}

/** Image upload: the file is already on disk, go straight to analysis. */
export async function developImageItem(id: string): Promise<void> {
  await analyzeAndFinish(id);
}

/** Re-run analysis on a failed slide (capture is retried for URL items without an image). */
export async function redevelopItem(id: string): Promise<void> {
  const item = repo.findById(id);
  if (!item) return;
  const hasImage = await fs
    .access(path.join(config.imagesDir, item.imageFile))
    .then(() => true)
    .catch(() => false);
  if (!hasImage && item.kind === "url" && item.sourceUrl) {
    await developUrlItem(id, item.sourceUrl);
    return;
  }
  await analyzeAndFinish(id);
}
