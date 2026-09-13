export {};
type Tool = {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: Tool,
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}
const lifecycle = new AbortController();
const context = document.modelContext;
if (context?.registerTool) {
  try {
    void Promise.resolve(
      context.registerTool(
        {
          name: "stage_election_claim",
          description:
            "Place a claim in KEO’s visible investigation composer for the user to review. Does not submit it or call AI.",
          inputSchema: {
            type: "object",
            properties: {
              claim: { type: "string", minLength: 5, maxLength: 2000 },
            },
            required: ["claim"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: true },
          execute(input) {
            if (
              !input ||
              typeof input !== "object" ||
              !("claim" in input) ||
              typeof input.claim !== "string" ||
              input.claim.trim().length < 5 ||
              input.claim.length > 2000 ||
              Object.keys(input).length !== 1
            )
              throw new Error("Provide one claim of 5–2,000 characters.");
            const field = document.querySelector<HTMLTextAreaElement>("#query");
            if (!field) throw new Error("Open Ask or Investigate first.");
            field.value = input.claim;
            field.focus();
            return { staged: true, submitted: false, claim: field.value };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
  } catch {}
}
window.addEventListener("pagehide", () => lifecycle.abort());
