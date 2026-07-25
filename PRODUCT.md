# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A single user — the owner (a designer/developer) — using Inspo as a personal tool. No other audiences, accounts, or sharing mechanics. They reach for it in two situations: when they've just found a design worth banking, and mid-project when they need to hand a concrete visual direction to an AI model instead of a vague feeling.

## Product Purpose

Inspo turns a personal screenshot collection into organized, queryable taste. It is not just storage: the app groups saved screenshots by design type and can explain what each design *is* — the actual vocabulary behind it. Clicking a screenshot surfaces the style's keywords, a copyable image prompt for generating a matching hero background, and a "copy brief" button that seeds an entire website build. Success means the owner's taste becomes language and artifacts a model can act on.

## Positioning

Public platforms (Pinterest, Are.na, Cosmos) hold images; Inspo articulates them. Its mechanism is the save-to-vocabulary pipeline: every screenshot the owner saves is analyzed, classified by design type, and converted into named style keywords, a generation-ready image prompt, and a build brief. The collection is private, owned outright, and optimized for handing taste to AI models — no feed, no social layer, no accounts.

## Operating Context

Used in the browser alongside design/development work. Three moments matter:

1. **Capture** — something inspiring was just found; saving it must be near-zero friction.
2. **Recall** — mid-project, browsing groups of design types for direction or a specific remembered reference.
3. **Hand-off** — copying a style's keywords, image prompt, or build brief out of Inspo and into a model (image generator, coding agent) to start real work.

## Capabilities and Constraints

Confirmed capabilities:

- Add items by pasting a URL manually; the app auto-captures a real visual to analyze: on inspiration-gallery pages (dribbble, landing.love, craftwork.design, …) it grabs the page's dominant featured image directly, and on all other pages it screenshots with a headless browser.
- Add items by uploading images directly (drag & drop).
- Content types: websites & landing pages (links with captured previews), UI screenshots & static images, and typography & color references (font pairings, palettes).
- **AI vision analysis on save:** the Claude API (vision) analyzes each saved item and automatically generates its design type, style keywords, image prompt, and build brief — no manual tagging required.
- Screenshots are grouped by design type in the gallery. The taxonomy is **model-generated but canonicalized**: the model names types freely, and new names are merged into existing types when they match, so groups stay clean without a hand-maintained list.
- Per-item detail view exposes: style keywords, a copyable image prompt for a matching hero background, and a "copy brief" action that seeds an entire website build.
- The brief is **structured markdown written for a coding agent** (direction, palette, typography, layout, motion, components) — made to paste straight into Claude Code or similar with zero editing.

Confirmed constraints:

- Stack: Next.js / React.
- Single-user; no auth, sharing, or multi-user features required.
- **Ships as a Docker package:** the app runs self-hosted in a container. The headless browser for screenshots lives in the image; data persists on a mounted volume; the API key is passed as a container environment variable.
- Storage: **SQLite** for metadata and analysis results; image files on disk (both on the mounted volume).
- Analysis provider: **Claude API**; the key lives in a local `.env` file (never committed) and reaches the container as an env var. Saves incur an API call, so network access is an operating requirement.

Explicitly not in scope (not selected by the owner):

- Bookmarklet/browser-extension capture.
- Uploading video files as a content type. (URL saves whose featured media is a video preview do keep the video's link: the wall shows the poster still, and projection plays the video, falling back to the still if the remote file disappears.)
- Importing an existing saved collection (none was confirmed to exist).

Open decisions (recorded, not invented):

- Exact section-by-section template of the build brief — the shape (direction, palette, typography, layout, motion, components) is agreed; the precise template will be settled during design/build.

## Evidence on Hand

None. The repository is empty; there is no existing collection, seed content, logo, or asset library. Future work must not fabricate saved items, sample "inspiration," or pre-filled collections presented as the owner's real content — placeholder/demo content must be clearly identifiable as such.

## Product Principles

1. **Capture is near-zero friction.** Pasting a URL or dropping an image is the fastest interaction in the product; analysis happens automatically after the save, never as a gate before it.
2. **Every save earns its vocabulary.** A screenshot without a design type, keywords, prompt, and brief is incomplete inventory; the pipeline's job is to leave nothing unarticulated.
3. **Outputs are model-ready.** Keywords, image prompts, and briefs exist to be copied and pasted into a model with zero editing — hand-off value, not decoration, is the test.
4. **One user, no ceremony.** No accounts, onboarding funnels, or social mechanics — every flow assumes the owner and optimizes for repeat daily use.
5. **The saved material is honest.** Previews, metadata, and generated vocabulary describe the real saved source; the gallery never invents or embellishes content.
