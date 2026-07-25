# Inspo

A personal slide library: save design inspiration (paste a URL or drop an image), and every save is analyzed by Claude vision into named, copyable vocabulary — design type, style keywords, a hero-background image prompt, and a full markdown build brief you can paste straight into a coding agent.

## Run with Docker

```bash
cp .env.example .env    # add your ANTHROPIC_API_KEY
docker compose up --build
```

Open http://localhost:3000. The collection (SQLite + images) persists in `./data`.

## Run locally (development)

```bash
npm install             # also downloads Chromium for screenshots
cp .env.example .env.local
npm run dev
```

## How it works

- **Save:** `POST /api/items` with `{ "url": "..." }` or a multipart image upload. The API returns instantly; capture + analysis run in the background ("developing").
- **Capture:** URL saves load the page in Playwright/Chromium; if one large image dominates the shown viewport (inspiration-gallery pages like Dribbble, landing.love, craftwork.design), that featured image is saved directly — otherwise an above-the-fold screenshot at 1440×900@2x.
- **Analysis:** Claude (default `claude-sonnet-5`, override via `ANTHROPIC_MODEL`) returns the design type, keywords, description, palette, image prompt, and build brief. Design types are canonicalized against the existing library so trays stay clean.
- **Storage:** SQLite (`DATA_DIR/inspo.db`) + image files (`DATA_DIR/images/`).

## Tests

```bash
npm test
```
