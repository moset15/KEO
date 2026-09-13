import { describe, expect, it } from "vitest";
import { researchGuide } from "../src/lib/research-guide";
describe("no-model research guidance", () => {
  it("prioritises original notices for procedural claims", () => {
    const guide = researchGuide("IEBC changed the election date");
    expect(guide.sources[0].source_id).toBe("iebc");
    expect(guide.steps.join(" ")).toContain("original dated notice");
  });
  it("does not turn a technique into an attribution", () => {
    expect(researchGuide("coordinated bot accounts").steps.join(" ")).toContain(
      "Do not infer",
    );
  });
  it("gives unfamiliar claims public destinations, not a verdict", () => {
    const guide = researchGuide("An unfamiliar claim");
    expect(guide.sources.length).toBeGreaterThan(0);
    expect(guide.steps.join(" ")).toContain("unverified");
    expect(
      guide.sources.every((source) => source.url.startsWith("https://")),
    ).toBe(true);
  });
});
