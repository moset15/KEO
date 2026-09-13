import registry from "../../data/sources/registry.json";
// Suggested checks are never evidence or an automated verdict.
export function researchGuide(claim: string) {
  const q = claim.toLowerCase();
  const official =
    /iebc|notice|date|register|registration|poll|ballot|result|election/.test(
      q,
    );
  const research =
    /anthropic|bot|astroturf|coordina|influence|synthetic|deepfake/.test(q);
  const ids = research
    ? ["anthropic", "meta", "africa-check", "pesacheck"]
    : official
      ? ["iebc", "kenya-law", "africa-check", "pesacheck"]
      : ["africa-check", "pesacheck", "iebc"];
  const steps = official
    ? [
        "Find the original dated notice on the issuing authority’s website; a logo or screenshot is not enough.",
        "Compare exact wording, date and location, and check for later corrections.",
        "Look for independent fact checks linking to the original evidence.",
      ]
    : research
      ? [
          "Find the original report and distinguish its observations from attribution.",
          "Check scope, date, reach and alternative explanations; repeated wording alone does not prove coordination.",
          "Do not infer a private operator, party or government from a technique match.",
        ]
      : [
          "Identify the specific claim, publisher, date and location.",
          "Look for the original record and independent fact checks, not reposts.",
          "Leave the claim unverified when relevant evidence is missing.",
        ];
  return {
    steps,
    sources: ids.map((id) =>
      registry.find((source) => source.source_id === id)!,
    ),
  };
}
