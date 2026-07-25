import { describe, expect, it } from "vitest";
import { canonicalizeType } from "./taxonomy";

describe("canonicalizeType", () => {
  it("returns the proposed name in Title Case when the library is empty", () => {
    expect(canonicalizeType("neo-brutalism", [])).toBe("Neo Brutalism");
  });

  it("reuses an existing type on exact match regardless of case", () => {
    expect(canonicalizeType("swiss editorial", ["Swiss Editorial"])).toBe("Swiss Editorial");
  });

  it("merges -ism/-ist variants into the existing type", () => {
    expect(canonicalizeType("Brutalist", ["Brutalism"])).toBe("Brutalism");
    expect(canonicalizeType("Minimalism", ["Minimalist"])).toBe("Minimalist");
  });

  it("merges plural and punctuation variants", () => {
    expect(canonicalizeType("bento grids", ["Bento Grid"])).toBe("Bento Grid");
    expect(canonicalizeType("Neo-Brutalism", ["Neo Brutalism"])).toBe("Neo Brutalism");
  });

  it("keeps genuinely different types separate", () => {
    expect(canonicalizeType("Glassmorphism", ["Brutalism", "Swiss Editorial"])).toBe("Glassmorphism");
  });

  it("falls back to Unclassified for empty input", () => {
    expect(canonicalizeType("   ", [])).toBe("Unclassified");
  });
});
