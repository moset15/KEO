import { civicRedirect, redactIdentifiers } from "./guardrails";
import { searchEvidence } from "./repository";
import type { Investigation } from "./schemas";
import type { AIProvider } from "./gateway";
export async function investigateClaim(
  query: string,
  provider?: AIProvider,
  step: (message: string) => void = () => {},
): Promise<Investigation> {
  const base: Investigation = {
    id: crypto.randomUUID(),
    claim: redactIdentifiers(query),
    status: "insufficient_evidence",
    confidence: "unknown",
    summary: "I don’t have enough evidence to verify this claim yet.",
    observations: [],
    evidence_ids: [],
    evidence: [],
    contradictions: [],
    information_gaps: [],
    recommended_next_checks: [
      "Check dated primary notices and independent fact checks.",
    ],
    last_checked: new Date().toISOString(),
    mode: "curated",
    trace: [],
    provider: null,
  };
  const report = (s: string) => {
    base.trace.push(s);
    step(s);
  };
  if (civicRedirect(query))
    return {
      ...base,
      mode: "redirect",
      summary:
        "KEO supports neutral election research. I can help compare public records and explain election procedures, but cannot provide political persuasion, voter targeting or private-person tracking.",
      recommended_next_checks: [
        "Ask about public policies, official records or election procedures.",
      ],
    };
  report("Searching the curated evidence library");
  base.evidence = searchEvidence(query);
  base.evidence_ids = base.evidence.map((e) => e.id);
  base.observations = base.evidence.map((e) => e.excerpt);
  base.information_gaps = [
    "No live source check has been completed. Curated background cannot establish whether a new claim is true.",
  ];
  const knownQuestion = query.toLowerCase().replace(/[?’?]/g, "").trim();
  if (
    !provider &&
    knownQuestion === "when does the constitution schedule a general election"
  )
    return {
      ...base,
      status: "supported",
      confidence: "high",
      summary: base.evidence[0]?.excerpt ?? base.summary,
      information_gaps: [
        "This is a summary of the archived constitutional provision, not a check of current notices or amendments.",
      ],
    };
  if (
    !provider &&
    knownQuestion ===
      "what does the september 2026 anthropic report say about kenya"
  )
    return {
      ...base,
      status: "supported",
      confidence: "medium",
      summary: base.evidence[0]?.excerpt ?? base.summary,
      information_gaps: [
        "This summarises Anthropic’s published assessment. KEO has not independently verified the operation or checked subsequent developments.",
      ],
    };
  if (!provider) return base;
  try {
    const result = await provider.investigate(
      base.claim,
      base.evidence,
      report,
    );
    return {
      ...base,
      ...result.analysis,
      evidence: result.evidence,
      mode: "live",
      provider: "Configured AI provider",
    };
  } catch {
    return {
      ...base,
      mode: "unavailable",
      summary:
        "The live investigation could not be completed. This claim remains unverified.",
      information_gaps: [
        "The AI or search service was unavailable, timed out or returned invalid evidence. No live verdict was accepted.",
      ],
      recommended_next_checks: [
        "Try again shortly, or open the primary sources below.",
      ],
    };
  }
}
