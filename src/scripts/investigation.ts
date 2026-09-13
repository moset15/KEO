import { InvestigationSchema, type Investigation } from "../lib/schemas";
const form = document.querySelector<HTMLFormElement>("#keo-form");
const query = document.querySelector<HTMLTextAreaElement>("#query");
const target = document.querySelector<HTMLDivElement>("#result");
const error = document.querySelector<HTMLParagraphElement>("#form-error");
const trace = document.querySelector<HTMLOListElement>("#trace");
function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
) {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  if (className) e.className = className;
  return e;
}
export function renderResult(result: Investigation) {
  if (!target) return;
  target.replaceChildren();
  const panel = element("section", undefined, "result panel");
  panel.setAttribute("aria-label", "Investigation result");
  const head = element("div", undefined, "result-header");
  head.append(
    element("span", result.status.replaceAll("_", " "), "tag amber"),
    element("span", "Confidence: " + result.confidence, "result-label"),
  );
  panel.append(
    head,
    element("h2", "Assessment"),
    element("p", result.summary),
    element("blockquote", result.claim),
  );
  panel.append(
    element(
      "p",
      result.mode === "live"
        ? "Live analysis · " + result.provider
        : result.mode === "redirect"
          ? "Neutral research only"
          : "Curated context · live verification not completed",
      "notice",
    ),
  );
  for (const [heading, items] of [
    ["What the evidence says", result.observations],
    ["Contradictions", result.contradictions],
    ["Evidence missing", result.information_gaps],
    ["Next checks", result.recommended_next_checks],
  ] as const) {
    if (items.length) {
      panel.append(element("h3", heading));
      const list = element("ul");
      items.forEach((item) => list.append(element("li", item)));
      panel.append(list);
    }
  }
  panel.append(element("h3", "Evidence & provenance"));
  if (!result.evidence.length)
    panel.append(
      element(
        "p",
        "No relevant evidence was found in the available sources.",
        "empty",
      ),
    );
  result.evidence.forEach((e) => {
    const card = element("a", undefined, "evidence-card");
    card.href = e.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.append(
      element(
        "span",
        e.source_type.replace("_", " ") + " · " + e.publisher,
        "eyebrow",
      ),
      element("strong", e.title + " ↗"),
      element("p", e.excerpt),
      element(
        "small",
        "Published: " +
          (e.published_at ?? "not established") +
          " · Retrieved: " +
          new Date(e.retrieved_at).toLocaleDateString("en-GB"),
      ),
      element("p", e.notes),
    );
    panel.append(card);
  });
  panel.append(
    element(
      "p",
      "Request checked: " +
        new Date(result.last_checked).toLocaleString("en-GB") +
        ". Source retrieval dates are shown above.",
      "small muted",
    ),
  );
  if (result.storage_note)
    panel.append(element("p", result.storage_note, "small muted"));
  if (result.stored) {
    const remove = element("button", "Delete saved result", "btn");
    remove.type = "button";
    remove.addEventListener("click", async () => {
      remove.disabled = true;
      try {
        const response = await fetch(
          "/api/investigations/" + encodeURIComponent(result.id),
          { method: "DELETE" },
        );
        if (!response.ok) throw new Error();
        remove.textContent = "Saved result deleted";
      } catch {
        remove.textContent = "Deletion failed — try again";
        remove.disabled = false;
      }
    });
    panel.append(remove);
  }
  const next = element("a", "Explore the Threat Observatory →", "btn");
  next.href = "/threats/";
  panel.append(next);
  target.append(panel);
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
if (form && query && target && error && trace) {
  fetch("/api/status")
    .then((r) => r.json())
    .then((s: { live: boolean }) => {
      document.querySelector("#service-state")!.textContent = s.live
        ? "Live AI investigations available."
        : "No paid AI · curated evidence only. New claims need sufficient evidence.";
    })
    .catch(() => {
      document.querySelector("#service-state")!.textContent =
        "The live service is temporarily unavailable. Please try again shortly.";
    });
  document
    .querySelectorAll<HTMLButtonElement>("[data-query]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        query.value = button.dataset.query ?? "";
        query.focus();
      }),
    );
  const initial = new URL(location.href).searchParams.get("q");
  if (initial) query.value = initial.slice(0, 2000);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.hidden = true;
    trace.replaceChildren();
    target.replaceChildren();
    const button = form.querySelector<HTMLButtonElement>(
      "button[type=submit]",
    )!;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    try {
      const mode = form.dataset.mode ?? "ask";
      let image: string | undefined;
      let consent: boolean | undefined;
      if (mode === "verify") {
        const canvas =
          document.querySelector<HTMLCanvasElement>("#image-canvas");
        if (!canvas?.dataset.ready) throw new Error("Choose an image first.");
        consent =
          document.querySelector<HTMLInputElement>("#image-consent")?.checked;
        if (!consent)
          throw new Error("Please agree to send the image before continuing.");
        image = canvas.toDataURL("image/jpeg", 0.82);
        if (image.length > 4000000)
          throw new Error(
            "This image is too large after compression. Please resize it.",
          );
      }
      const response = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query:
            query.value.trim() ||
            (mode === "verify" ? "Verify the visible election claim." : ""),
          mode,
          image,
          consent,
        }),
        signal: AbortSignal.timeout(150000),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "The service is unavailable.");
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response received.");
      let pending = "";
      let received = false;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        pending += done
          ? decoder.decode()
          : decoder.decode(value, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const message = JSON.parse(line) as {
            type: string;
            message?: string;
            result?: unknown;
          };
          if (message.type === "step")
            trace.append(element("li", message.message));
          if (message.type === "error") throw new Error(message.message);
          if (message.type === "result") {
            renderResult(InvestigationSchema.parse(message.result));
            received = true;
          }
        }
        if (done) break;
      }
      if (!received)
        throw new Error(
          "The response ended before the investigation finished. Please try again.",
        );
      if (mode === "verify")
        document.dispatchEvent(new Event("keo:image-complete"));
    } catch (e) {
      error.textContent =
        e instanceof Error ? e.message : "Unable to complete the request.";
      error.hidden = false;
    } finally {
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
}
