import path from "node:path";

/** Resolved once per process; env is the single source of truth. */
export type AppConfig = Readonly<{
  dataDir: string;
  imagesDir: string;
  dbPath: string;
  anthropicModel: string;
}>;

const dataDir = path.resolve(process.env.DATA_DIR ?? "./data");

export const config: AppConfig = Object.freeze({
  dataDir,
  imagesDir: path.join(dataDir, "images"),
  dbPath: path.join(dataDir, "inspo.db"),
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
});

/**
 * The API key is required for analysis, not for boot: the gallery must stay
 * browsable even when the key is absent. Callers surface this error onto the
 * item so the failure is visible in the UI instead of swallowed.
 */
export function requireApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (dev) or pass it to the container (docker).",
    );
  }
  return key;
}
