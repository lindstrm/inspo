/**
 * Repair for a recurring model failure mode: the tool call is serialized with
 * malformed XML closes (`…text</description> <parameter name="palette">…`),
 * which makes the parser swallow every later parameter into the current string
 * field. The swallowed tail still contains the real data, so instead of
 * failing, truncate the polluted field at the bogus close tag and mine the
 * tail for the missing fields.
 */

const FIELD_NAMES = [
  "designType",
  "styleHint",
  "title",
  "keywords",
  "description",
  "palette",
  "imagePrompt",
  "brief",
] as const;

const FIELDS = FIELD_NAMES.join("|");
/** Only field-name closes and parameter openers count as leaks — a brief's own HTML snippets never match. */
const LEAK_START = new RegExp(`</(?:${FIELDS})>|<parameter\\s+name="`);
const PARAM_BLOCK = new RegExp(
  `<parameter\\s+name="(${FIELDS})">([\\s\\S]*?)(?=</(?:${FIELDS}|parameter)>|<parameter\\s+name="|$)`,
  "g",
);

function parseMinedValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** Returns a cleaned copy: polluted string fields truncated, swallowed fields recovered. */
export function repairLeakedMarkup(json: Record<string, unknown>): Record<string, unknown> {
  const repaired: Record<string, unknown> = { ...json };
  for (const field of FIELD_NAMES) {
    const value = repaired[field];
    if (typeof value !== "string") continue;
    const leakAt = value.search(LEAK_START);
    if (leakAt === -1) continue;

    repaired[field] = value.slice(0, leakAt).trim();
    const tail = value.slice(leakAt);
    for (const match of tail.matchAll(PARAM_BLOCK)) {
      const [, minedField, minedRaw] = match;
      if (isMissing(repaired[minedField])) {
        repaired[minedField] = parseMinedValue(minedRaw);
      }
    }
  }
  return repaired;
}
