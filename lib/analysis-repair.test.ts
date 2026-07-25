import { describe, expect, it } from "vitest";
import { repairLeakedMarkup } from "./analysis-repair";

describe("repairLeakedMarkup", () => {
  it("leaves clean records untouched", () => {
    const clean = { description: "A tidy record.", palette: ["#fff"] };
    expect(repairLeakedMarkup(clean)).toEqual(clean);
  });

  it("truncates a polluted field and mines the swallowed fields (real leak shape)", () => {
    const json = {
      description:
        'Playful SaaS marketing with toy-like illustrated UI mockups.</description> <parameter name="palette">["#f6f1e7", "#111111", "#e8b923"]</palette> <parameter name="imagePrompt">warm cream ground with scattered toy-like UI cards</imagePrompt> <parameter name="brief"># Design Brief: Utilitarian Minimalism\n\n## Direction\nLight and dense.</brief>',
      palette: [],
    };
    const repaired = repairLeakedMarkup(json);
    expect(repaired.description).toBe("Playful SaaS marketing with toy-like illustrated UI mockups.");
    expect(repaired.palette).toEqual(["#f6f1e7", "#111111", "#e8b923"]);
    expect(repaired.imagePrompt).toBe("warm cream ground with scattered toy-like UI cards");
    expect(String(repaired.brief)).toContain("# Design Brief: Utilitarian Minimalism");
  });

  it("never overwrites a field that already has a clean value", () => {
    const json = {
      description: 'Text.</description> <parameter name="title">Mined Title</title>',
      title: "Real Title",
    };
    const repaired = repairLeakedMarkup(json);
    expect(repaired.title).toBe("Real Title");
    expect(repaired.description).toBe("Text.");
  });

  it("does not trip on legitimate HTML inside the brief", () => {
    const json = {
      brief: "# Design Brief\n\n## Components\nUse `<button class=\"pill\">` and `</div>` closes as usual.",
    };
    expect(repairLeakedMarkup(json)).toEqual(json);
  });
});
