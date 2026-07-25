---
name: Inspo
description: A personal slide library — saved design turned into named, luminous, copyable vocabulary.
colors:
  kodachrome-red: "#d6382c"
  red-ink: "#a8281e"
  red-signal: "#e0574b"
  safelight-amber: "#e89a3c"
  safelight-deep: "#7a4a14"
  room-black: "#131215"
  room-deep: "#0c0b0d"
  table-surface: "#17151a"
  table-charcoal: "#1c1a1f"
  table-edge: "#2e2b33"
  mount-bone: "#eae6de"
  mount-bone-dim: "#ddd7cb"
  type-ink: "#2a2630"
  ink-faint: "#675f58"
  projection-white: "#f4f1ea"
  white-dim: "#a8a49d"
  placeholder-dim: "#8f8a84"
  safelight-dark: "#191008"
  backlight-glow: "rgba(255, 250, 235, 0.13)"
  backlight-lifted: "rgba(255, 250, 235, 0.2)"
  hairline-light: "rgba(244, 241, 234, 0.14)"
typography:
  display:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0.01em"
  wordmark:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    letterSpacing: "0.14em"
  section-title:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
    letterSpacing: "0.16em"
  chrome-label:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.09em"
  body:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  typed:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0.02em"
  typed-caption:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.02em"
  typed-note:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
  typed-callout:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    letterSpacing: "0.18em"
  typed-micro:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.5625rem"
    fontWeight: 400
    letterSpacing: "0.28em"
  typed-hint:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
  control-glyph:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
rounded:
  mount: "3px"
  window: "2px"
  dot: "1px"
spacing:
  mount-pad: "7px"
  grid-gap-x: "14px"
  grid-gap-y: "16px"
  page-pad: "24px"
  card-pad: "22px"
components:
  button-expose:
    backgroundColor: "{colors.kodachrome-red}"
    textColor: "{colors.projection-white}"
    typography: "{typography.chrome-label}"
    rounded: "{rounded.window}"
    padding: "0 18px"
  button-expose-hover:
    backgroundColor: "#b52d22"
    textColor: "{colors.projection-white}"
  button-copy:
    backgroundColor: "{colors.mount-bone}"
    textColor: "{colors.type-ink}"
    typography: "{typography.chrome-label}"
    rounded: "{rounded.window}"
    padding: "11px 14px"
  button-copy-hover:
    backgroundColor: "{colors.type-ink}"
    textColor: "{colors.mount-bone}"
  tray-tab:
    backgroundColor: "{colors.table-charcoal}"
    textColor: "{colors.white-dim}"
    typography: "{typography.chrome-label}"
    padding: "8px 13px"
  tray-tab-active:
    backgroundColor: "{colors.mount-bone}"
    textColor: "{colors.type-ink}"
  capture-input:
    backgroundColor: "{colors.room-deep}"
    textColor: "{colors.projection-white}"
    typography: "{typography.typed}"
    rounded: "{rounded.window}"
    padding: "9px 12px"
---

# Design System: Inspo

## Overview

**Creative North Star: "The Slide Library"**

Inspo is the art-history slide library, rebuilt as software: a darkened viewing room where every saved screenshot is a mounted 35mm slide glowing on a light table. The images are the only luminous objects in the room; the chrome recedes into the dark, speaking quietly through typed labels and tray tabs. Design types are carousel trays. Opening an item is a projection — the room dims further and the slide fills the wall beside the registrar's typed caption card, which carries the vocabulary: style name, keywords, image prompt, build brief.

The register is serious and material, never sterile: bone cardboard mounts, typewriter captions, grease-pencil red, the amber of a darkroom safelight while a fresh save "develops." Warmth comes from the materials, not from decoration.

**Key Characteristics:**
- Dark neutral viewing room; backlit images supply all luminosity
- Every image framed in a dark archival mount — one stop darker than the room — with a typed catalog card beneath; bone survives on the registrar's projection card and the active tray tab
- Strict light-table grid of uniform mount modules — never masonry
- One accent: Kodachrome red; safelight amber reserved for in-progress analysis
- Typed (typewriter) voice for all metadata; Franklin caps for chrome

## Colors

A dark neutral room with bone-cardboard artifacts, one red accent, and amber for work-in-progress.

### Primary
- **Kodachrome Red** (#d6382c): the single accent — active markers, the Expose action, selection and focus rings, grease-pencil marks. Used sparingly and with intent. Its darker sibling **Red Ink** (#a8281e) carries red *text* on bone surfaces; its lighter sibling **Red Signal** (#e0574b) carries red *text and marks* on dark grounds — plain Kodachrome red fails the contrast floor as small dark-ground text.

### Secondary
- **Safelight Amber** (#e89a3c): exclusively for the "developing" state — a saved item whose analysis is still running (with **Safelight Deep** #7a4a14 for its dimmed caption). Never used decoratively; when nothing is processing, no amber appears on screen.

### Neutral
- **Room Black** (#131215): the viewing-room ground; the page background. **Room Deep** (#0c0b0d) is one stop darker: the archival mount cards on the wall, wells, image-window backing, the projection backdrop. On dark cards, hairlines are **Hairline Light** (rgba(244,241,234,0.14)) and text speaks Projection White / White Dim / Red Signal.
- **Table Surface** (#17151a): the light table's plane — one stop above Room Black, it grounds the mount grid so the table reads as furniture in the room.
- **Table Charcoal** (#1c1a1f): raised dark surfaces — the header bar, tray tabs — edged by **Table Edge** (#2e2b33) borders. A 1px Table Edge rail runs under the tray tabs: the drawer lip the trays rise from.
- **Mount Bone** (#eae6de): slide-mount cardboard and caption cards; the light neutral.
- **Type Ink** (#2a2630): typed ink on bone surfaces; **Ink Faint** (#675f58) for secondary typed text on bone.
- **Projection White** (#f4f1ea): text on dark grounds — warm, like projected light; **White Dim** (#a8a49d) for secondary text on dark.

### Named Rules
**The Backlight Rule.** Saved images are the only luminous objects. Chrome never glows, gradients never compete, and nothing on the surface is brighter than a slide.

**The Safelight Rule.** Amber means "still developing" and nothing else. Its absence is information.

## Typography

**Display/UI Font:** Libre Franklin (with system sans fallback)
**Label/Mono Font:** Courier Prime (with monospace fallback)

**Character:** Franklin Gothic's American trade-print bluntness for chrome and tray names — tight, bold, capitalized, like mount-box printing and museum wall labels. Courier Prime's typewriter voice for everything the registrar would have typed: captions, keywords, metadata, prompts, briefs.

### Hierarchy
- **Display** (Franklin 800, 1.375rem, lh 1.15): card titles; the wordmark at 1.0625rem with 0.14em tracking.
- **Chrome Label** (Franklin 700, 0.6875rem, 0.09em tracking, uppercase): buttons, tray tabs, card section headings.
- **Body** (Franklin 400, 15px, lh 1.5): sparing running text; this product has little of it.
- **Typed** (Courier Prime 400, 0.8125rem, lh 1.65): descriptions, keywords, briefs — the registrar's record.
- **Typed Caption** (Courier Prime 400, 0.6875rem, uppercase): mount caption strips, counts, dates, hexes.

### Named Rules
**The Registrar's Voice Rule.** If a human would have typed it on a card — captions, keywords, prompts, briefs — it is set in Courier Prime on a bone surface. Chrome speaks Franklin; records speak typewriter.

## Layout

The light table: a strict CSS grid of uniform mount modules — `repeat(auto-fill, minmax(208px, 1fr))` with 16px/14px gaps (150px minimum on ≤720px screens). Each screenshot fills a fixed 3:2 mount window (`object-fit: cover`, top-anchored), so rows stay racked and even; never masonry. The header bar (wordmark + capture input) is sticky on Table Charcoal; tray tabs sit beneath it and scroll horizontally on overflow; the whole window is a drop target. Projection view is a full-screen overlay: image dominant beside a 392px caption card on desktop, stacked and scrollable below 900px. Page padding 24px (14px mobile); density reads as abundance, edge to edge.

## Elevation & Depth

Depth is tonal, never shadowed. The wall is flat and minimal: mount cards separate from the ground by tone (Room Deep card on Table Surface) and a 1px Table Edge border — no glow, no lift; hover lightens the card one stop to Room Black. The backlight glow survives in exactly two places: under the projected image in projection view (`0 6px 44px rgba(255,250,235,0.13)`) and as the developing state's breathing inset amber. Projection darkens the room another stop (`rgba(7,6,8,0.93)`) rather than lifting a card. No floating-material shadows anywhere.

## Shapes

Slide-mount geometry: mount modules with 3px die-cut corners, 2px image windows and controls, rectangular tray tabs rounded only at the top (3px). No pills, no large radii. Grease-pencil marks (the failed-slide X) are hand-drawn SVG strokes with round caps — marks, not fonts.

## Components

### Buttons
- **Expose (primary):** Kodachrome Red block, Projection White chrome-label caps, 2px corners, 0×18px padding; hover darkens to #b52d22; disabled falls to Table Edge. Instant color swap (120ms mechanical ease).
- **Copy actions:** full-width on the caption card; Mount Bone with a 1.5px Type Ink border; hover inverts to ink-on-bone's negative (ink background, bone text); copied state swaps the label to "Copied to clipboard" with Red Ink accents. Right-aligned typed hint (e.g. "seeds a site").
- **Quiet actions:** typed, underlined, Ink Faint; danger variants arm to Red Ink ("Discard slide" → "Confirm discard").

### Tray Tabs
- Table Charcoal tabs, top corners 3px, White Dim chrome-label caps with typed counts; active tab lifts into the light: Mount Bone background, Type Ink text (`aria-pressed`). Trays group by **style family**: the analysis assigns each slide to an existing family verbatim when it fits, otherwise a new family is created (canonicalized in `lib/taxonomy.ts`).

### Slide Mount
- The signature component: a flat Room Deep archival card (darker than the room ground, 1px Table Edge border, 9px padding, 3px corners, no glow) so the slide is the only light. Fixed height — 420px (380px ≤720px) — as a flex column: the image window absorbs all flex (`object-fit: cover`, top-anchored) above the catalog anatomy: a caption row (title in Franklin 700 1rem Projection White left, the per-item style hint in typed lowercase White Dim right); up to two keyword chips on a single non-wrapping line (Table Charcoal ground, 1px Table Edge border, typed 0.6875rem Projection White, ellipsizing) with a "+N" typed overflow count; and a Hairline Light-topped footer with the style family left (Red Signal ◆ + Red Signal typed bold caps, ellipsized) and the "02 / 12" accession counter right in White Dim. Hover lightens the card to Room Black; nothing lifts or glows. Grid: fixed columns that flex with the viewport — 4 across, 3 ≤1280px, 2 ≤960px, 1 ≤640px. States: developing (amber breathing window, film-edge typed marking, Safelight Amber hint), failed (grease-pencil red X, Red Signal title), just-developed (the one authored moment: a 1.1s darkroom develop-in from amber darkness to full image).

### Inputs
- Capture input: Room Deep well, 1px Table Edge border, typed Projection White text; focus swaps the border to Kodachrome Red. Placeholder #8f8a84.

### Caption Card
- Mount Bone, 392px wide (full-width stacked on mobile), 22px padding: red tray mark with dot, Franklin display title, typed meta, "The lecture" description, typed vocabulary list with red interpuncts, palette chips (30px swatches with typed hexes), copy actions, quiet footer.

## Do's and Don'ts

### Do:
- **Do** frame every image in an archival mount card (Room Deep, Table Edge border) with its typed catalog anatomy — no naked images on the ground, and the image stays the brightest thing on the card.
- **Do** keep state changes instant and mechanical, like a carousel advance: swap, don't slide. (**The Ka-Chunk Rule.** 120ms `cubic-bezier(0.2,0,0,1)` for state swaps; the only long animation is the develop-in.)
- **Do** show the developing state in Safelight Amber with the caption reading "developing…" — analysis fills the label in when it lands.
- **Do** let density read as abundance; the wall is full, edge to edge.

### Don't:
- **Don't** use masonry columns, hover-zoom cards, or overlay-on-hover metadata — the category rut this world exists to refuse.
- **Don't** add soft drop shadows, glassmorphism, or decorative gradients; depth is tonal and backlit only.
- **Don't** let chrome outglow the slides — no neon accents, no bright fills outside Kodachrome Red's small, intentional uses.
- **Don't** drift into sterile minimalism: the materials (bone, typewriter ink, amber, red) must stay present even in empty states — the empty state is a real bone mount with an empty window and typed caption, never a dashed wireframe.
- **Don't** use amber outside the developing state, ever — not for emphasis, not for empty-state highlights. Failed states speak Red Signal on dark and Red Ink on bone.
