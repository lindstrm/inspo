// TEST-ONLY: injects synthetic analysis rows so the ready-state UI can be
// verified without an API key. Run with "undo" to restore the failed state.
import Database from "better-sqlite3";

const db = new Database("data/inspo.db");
const undo = process.argv[2] === "undo";

if (undo) {
  db.prepare(
    "UPDATE items SET status='failed', error='ANTHROPIC_API_KEY is not set. Add it to .env.local (dev) or pass it to the container (docker).', design_type=NULL, style_hint=NULL, title=NULL, keywords='[]', description=NULL, palette='[]', image_prompt=NULL, brief=NULL",
  ).run();
  console.log("reverted to failed state");
  process.exit(0);
}

const rows = db.prepare("SELECT id, source_url FROM items ORDER BY created_at DESC").all();

const fixtures = {
  "stripe.com": {
    design_type: "Gradient Fintech",
    style_hint: "luminous mesh optimism",
    title: "Stripe",
    keywords: ["animated mesh gradient", "airy grid", "inter-style grotesque", "code-as-content", "layered product shots", "soft depth", "high whitespace", "blurple accent system"],
    description: "SYNTHETIC TEST RECORD. The polished fintech landing tradition: a luminous mesh gradient crowns an otherwise disciplined white grid. Density is reserved for product UI screenshots that do the proving.",
    palette: ["#635bff", "#0a2540", "#ffffff", "#00d4ff", "#f6f9fc"],
    image_prompt: "SYNTHETIC TEST PROMPT: a softly animated mesh gradient in blurple, cyan and coral, flowing diagonally across a white ground, subtle grain, weightless and optimistic, wide composition.",
    brief: "# Design Brief: Gradient Fintech\n\nSYNTHETIC TEST BRIEF — replace with a real analysis.\n\n## Direction\nPolished, trustworthy fintech landing…",
  },
  "www.are.na": {
    design_type: "Index Minimalism",
    style_hint: "typographic archival calm",
    title: "Are.na",
    keywords: ["typographic index", "system grotesque", "hairline rules", "monochrome restraint", "content-as-interface", "dense list rhythm"],
    description: "SYNTHETIC TEST RECORD. The anti-design index tradition: the interface is a typographic list, chrome reduced to hairlines, letting collected content carry all color.",
    palette: ["#ffffff", "#000000", "#e5e5e5", "#6b6b6b"],
    image_prompt: "SYNTHETIC TEST PROMPT: a plain paper-white field with faint hairline grid lines and small black grotesque index numerals, extreme restraint, archival calm.",
    brief: "# Design Brief: Index Minimalism\n\nSYNTHETIC TEST BRIEF — replace with a real analysis.\n\n## Direction\nTypographic index restraint…",
  },
  "linear.app": {
    design_type: "Dark Product Noir",
    style_hint: "cinematic violet noir",
    title: "Linear",
    keywords: ["near-black ground", "glassy product frames", "violet glow accents", "tight grotesque", "keyboard-first cues", "cinematic gradients"],
    description: "SYNTHETIC TEST RECORD. The dark developer-tool noir: near-black surfaces, one violet glow, product UI floating in glassy frames like film stills.",
    palette: ["#08090a", "#5e6ad2", "#ffffff", "#26282d"],
    image_prompt: "SYNTHETIC TEST PROMPT: deep near-black field with a single soft violet aurora glow rising from the lower third, faint film grain, cinematic and precise.",
    brief: "# Design Brief: Dark Product Noir\n\nSYNTHETIC TEST BRIEF — replace with a real analysis.\n\n## Direction\nDark, cinematic developer tooling…",
  },
};

const update = db.prepare(
  "UPDATE items SET status='ready', error=NULL, design_type=@design_type, style_hint=@style_hint, title=@title, keywords=@keywords, description=@description, palette=@palette, image_prompt=@image_prompt, brief=@brief WHERE id=@id",
);

for (const row of rows) {
  const host = row.source_url ? new URL(row.source_url).hostname : null;
  const fixture = host ? fixtures[host] : null;
  if (!fixture) continue;
  update.run({
    id: row.id,
    ...fixture,
    keywords: JSON.stringify(fixture.keywords),
    palette: JSON.stringify(fixture.palette),
  });
  console.log(`seeded ${host}`);
}
