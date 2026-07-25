import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { repairLeakedMarkup } from "./analysis-repair";
import { config, requireApiKey } from "./config";
import { canonicalizeType } from "./taxonomy";
import type { Analysis, Item } from "./types";

const MAX_EDGE_PX = 1568;

/**
 * The analysis arrives via forced tool use: the API validates the payload
 * against this schema and hands it over already parsed, so malformed-JSON
 * failures (unescaped quotes, raw newlines) cannot happen.
 */
const ANALYSIS_TOOL: Anthropic.Tool = {
  name: "record_analysis",
  description: "Record the catalog entry for this design image in the slide library.",
  input_schema: {
    type: "object",
    properties: {
      designType: {
        type: "string",
        description:
          "The style FAMILY this slide belongs to: 1-3 words, a recognized tradition or evocative coinage (e.g. 'Neo-Brutalism', 'Illustrated Storybook', 'Glitched Antiquity').",
      },
      styleHint: {
        type: "string",
        description:
          "2-4 lowercase words naming THIS exact rendition, more specific than the family (e.g. 'cinematic illustrated dark', 'classical x data noir').",
      },
      title: {
        type: "string",
        description:
          "Short human title for the caption label — the site/product name if identifiable, else a 2-4 word subject.",
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        description:
          "6-10 precise design-vocabulary terms describing THIS design: composition, type treatment, color strategy, texture, motion cues — terms a designer would actually use.",
      },
      description: {
        type: "string",
        description:
          "2-3 sentences explaining what this design IS: name the tradition it draws from, what defines it, what makes this example distinct. Written like a lecturer at the slide projector.",
      },
      palette: {
        type: "array",
        items: { type: "string" },
        description: "4-6 hex colors actually present in the image, dominant first.",
      },
      imagePrompt: {
        type: "string",
        description:
          "One copyable paragraph for an image-generation model: a hero background image matching this design's style — mood, palette, composition, texture, lighting. No preamble, no 'generate', just the prompt itself.",
      },
      brief: {
        type: "string",
        description:
          "A complete markdown build brief that would let a coding agent build a NEW website in this style. Use exactly these sections: '# Design Brief: <style name>' then '## Direction' (2-3 sentences of thesis), '## Palette' (named hex roles), '## Typography' (families or precise substitutes, hierarchy, weights), '## Layout' (grid, spacing, density, responsive behavior), '## Motion' (easing, durations, what animates), '## Components' (buttons, cards, nav, inputs in this style). Be specific enough to execute without seeing the image.",
      },
    },
    required: [
      "designType",
      "styleHint",
      "title",
      "keywords",
      "description",
      "palette",
      "imagePrompt",
      "brief",
    ],
  },
};

/** Downscale + JPEG-encode so the API payload stays small and fast. */
async function imageForApi(imageFile: string): Promise<{ data: string; mediaType: "image/jpeg" }> {
  const raw = await fs.readFile(path.join(config.imagesDir, imageFile));
  const jpeg = await sharp(raw)
    .resize(MAX_EDGE_PX, MAX_EDGE_PX, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  return { data: jpeg.toString("base64"), mediaType: "image/jpeg" };
}

function buildPrompt(item: Item, existingTypes: readonly string[]): string {
  const source = item.sourceUrl
    ? `It was collected from ${item.sourceUrl}. That URL may be an inspiration gallery (dribbble, landing.love, …) that merely hosts the work: the design shown IN THE IMAGE is the subject of every field. Never describe, name, or classify the hosting page.`
    : "It was uploaded directly.";
  const typeGuidance =
    existingTypes.length > 0
      ? `The library already contains these style families — add this slide to one of them (reuse the name VERBATIM) when the design belongs to it; create a new family only when none fits:\n${existingTypes.map((t) => `- ${t}`).join("\n")}`
      : "The library has no style families yet; coin a precise, evocative family name.";

  return `You are the registrar of a private design slide library. Analyze this interface/design screenshot and produce its catalog record. ${source}

${typeGuidance}

Base every field strictly on the supplied image, then record the catalog entry by calling record_analysis.`;
}

function asStringArray(value: unknown, max: number): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0).slice(0, max);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Analysis response missing "${field}"`);
  }
  return value.trim();
}

/** Tool-call serialization markup must never appear inside field values. */
const MARKUP_LEAK = /<\/?parameter[\s>]|<\/?invoke[\s>]|<\/description>|<\/?antml/i;

function assertNoMarkupLeak(analysis: Analysis): Analysis {
  const fields: Record<string, readonly string[]> = {
    designType: [analysis.designType],
    styleHint: [analysis.styleHint],
    title: [analysis.title],
    description: [analysis.description],
    imagePrompt: [analysis.imagePrompt],
    brief: [analysis.brief],
    keywords: analysis.keywords,
    palette: analysis.palette,
  };
  for (const [field, values] of Object.entries(fields)) {
    for (const value of values) {
      const match = MARKUP_LEAK.exec(value);
      if (match) {
        const at = Math.max(0, (match.index ?? 0) - 40);
        const excerpt = value.slice(at, at + 160).replace(/\s+/g, " ");
        throw new Error(`Analysis leaked tool markup in "${field}": …${excerpt}…`);
      }
    }
  }
  return analysis;
}

async function runAnalysis(item: Item, existingTypes: readonly string[]): Promise<Analysis> {
  const client = new Anthropic({ apiKey: requireApiKey() });
  const image = await imageForApi(item.imageFile);

  const response = await client.messages.create({
    model: config.anthropicModel,
    max_tokens: 8000,
    tools: [ANALYSIS_TOOL],
    tool_choice: { type: "tool", name: "record_analysis" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: image.mediaType, data: image.data },
          },
          { type: "text", text: buildPrompt(item, existingTypes) },
        ],
      },
    ],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("Analysis output was truncated before the record completed");
  }
  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) throw new Error("Analysis returned no structured record");
  const json = repairLeakedMarkup(toolUse.input as Record<string, unknown>);

  return assertNoMarkupLeak({
    designType: canonicalizeType(requireString(json.designType, "designType"), existingTypes),
    styleHint:
      typeof json.styleHint === "string" && json.styleHint.trim().length > 0
        ? json.styleHint.trim().toLowerCase()
        : "",
    title: requireString(json.title, "title"),
    keywords: asStringArray(json.keywords, 12),
    description: requireString(json.description, "description"),
    palette: asStringArray(json.palette, 8).filter((c) => /^#[0-9a-fA-F]{3,8}$/.test(c)),
    imagePrompt: requireString(json.imagePrompt, "imagePrompt"),
    brief: requireString(json.brief, "brief"),
  });
}

/**
 * Runs vision analysis for one saved item and returns its validated,
 * canonicalized catalog record. A bad generation (truncation, missing fields,
 * leaked markup) is retried once before the failure lands on the item.
 */
export async function analyzeItem(item: Item, existingTypes: readonly string[]): Promise<Analysis> {
  try {
    return await runAnalysis(item, existingTypes);
  } catch (error) {
    console.warn(`[analyze] first attempt failed for ${item.id}, retrying once:`, error);
    return runAnalysis(item, existingTypes);
  }
}
