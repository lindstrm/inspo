import { describe, expect, it } from "vitest";
import { pickFeatured, type ImageCandidate } from "./featured-image";

const VW = 1440;
const VH = 900;
const BIG_AREA = VW * VH * 0.5;

function candidate(overrides: Partial<ImageCandidate>): ImageCandidate {
  return {
    src: "https://cdn.example.com/shot.png",
    area: BIG_AREA,
    top: 100,
    naturalWidth: 1600,
    order: 0,
    ...overrides,
  };
}

describe("pickFeatured", () => {
  it("picks a dominant in-viewport image", () => {
    expect(pickFeatured([candidate({})], VW, VH)?.src).toBe("https://cdn.example.com/shot.png");
  });

  it("returns null when no image is big enough on screen (normal product site)", () => {
    const small = candidate({ area: VW * VH * 0.1 });
    expect(pickFeatured([small], VW, VH)).toBeNull();
  });

  it("rejects low-resolution images regardless of rendered size", () => {
    expect(pickFeatured([candidate({ naturalWidth: 400 })], VW, VH)).toBeNull();
  });

  it("rejects images far below the shown viewport", () => {
    expect(pickFeatured([candidate({ top: VH * 3 })], VW, VH)).toBeNull();
  });

  it("takes the FIRST big image in document order, not the biggest", () => {
    const first = candidate({ order: 2, src: "https://cdn.example.com/first.png" });
    const bigger = candidate({ order: 5, area: BIG_AREA * 1.5, src: "https://cdn.example.com/bigger.png" });
    expect(pickFeatured([bigger, first], VW, VH)?.src).toBe("https://cdn.example.com/first.png");
  });

  it("ignores svg and non-http sources", () => {
    const svg = candidate({ src: "https://cdn.example.com/logo.svg?v=2" });
    const data = candidate({ src: "data:image/png;base64,xyz" });
    expect(pickFeatured([svg, data], VW, VH)).toBeNull();
  });

  it("accepts a dominant video's poster (landing.love-style preview)", () => {
    const poster = candidate({
      src: "https://cdn.landing.love/images/yutaabe.webp",
      area: VW * VH * 0.75,
      naturalWidth: 1920,
      top: 468,
    });
    expect(pickFeatured([poster], VW, VH)?.src).toContain("yutaabe.webp");
  });
});
