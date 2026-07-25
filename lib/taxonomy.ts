/**
 * Design-type canonicalization: the model names types freely, but new names
 * merge into existing types when they clearly match, so trays stay clean
 * without a hand-maintained list.
 */

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[-\s]+/g, " ")
    .trim();
}

/** Word-level stem: "brutalism"/"brutalist" → "brutal". Cheap and deterministic. */
function stemWord(word: string): string {
  return word.replace(/(ism|ist|istic|istical)$/u, "").replace(/(s)$/u, "");
}

function stemmed(name: string): string {
  return normalize(name).split(" ").map(stemWord).join(" ");
}

/**
 * Returns the canonical existing type when the proposed name matches one
 * (case, punctuation, plural, and -ism/-ist variants), otherwise the proposed
 * name in clean Title Case as a new type.
 */
export function canonicalizeType(proposed: string, existing: readonly string[]): string {
  const proposedNorm = normalize(proposed);
  const proposedStem = stemmed(proposed);

  for (const type of existing) {
    if (normalize(type) === proposedNorm) return type;
  }
  for (const type of existing) {
    if (stemmed(type) === proposedStem && proposedStem.length > 0) return type;
  }
  return titleCase(proposedNorm) || "Unclassified";
}

function titleCase(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
