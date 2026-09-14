import { loadImage } from "./image-editor";
import { publicImportURL, type ImportedSource } from "../lib/import-policy";
const form = document.querySelector<HTMLFormElement>("#keo-form");
const query = document.querySelector<HTMLTextAreaElement>("#query");
const url = document.querySelector<HTMLInputElement>("#source-url");
const consent = document.querySelector<HTMLInputElement>("#url-consent");
const read = document.querySelector<HTMLButtonElement>("#read-url");
const cancel = document.querySelector<HTMLButtonElement>("#cancel-url");
const status = document.querySelector<HTMLElement>("#url-status");
const note = document.querySelector<HTMLElement>("#import-note");
const review = document.querySelector<HTMLInputElement>("#text-review");
const reviewLabel = document.querySelector<HTMLElement>("#text-review-label");
let generation = 0;
let controller: AbortController | undefined;
function reviewRequired() {
  if (review) {
    review.required = true;
    review.checked = false;
  }
  if (reviewLabel) reviewLabel.hidden = false;
}
document.addEventListener("keo:review-required", reviewRequired);
query?.addEventListener("input", () => {
  if (review) review.checked = false;
  if (form?.dataset.importing === "true") {
    reset();
    if (status)
      status.textContent =
        "Import cancelled because you edited the claim. Your text has been kept.";
  }
});
function stop() {
  generation++;
  controller?.abort();
  controller = undefined;
  if (read) read.disabled = false;
  if (cancel) cancel.hidden = true;
  if (form) delete form.dataset.importing;
}
function reset() {
  stop();
  if (note) {
    note.hidden = true;
    note.replaceChildren();
  }
  if (status) status.textContent = "";
}
cancel?.addEventListener("click", () => {
  stop();
  if (status)
    status.textContent = "Import cancelled. You can paste the claim instead.";
});
url?.addEventListener("input", () => {
  reset();
  if (consent) consent.checked = false;
});
document.querySelector("#image-file")?.addEventListener("change", reset);
document.querySelector("#clear-image")?.addEventListener("click", reset);
document.querySelectorAll("[data-query]").forEach((button) =>
  button.addEventListener("click", () => {
    reset();
    if (review) review.checked = false;
  }),
);
window.addEventListener("pagehide", stop);
read?.addEventListener("click", async () => {
  if (!url || !consent || !query || !status || !note) return;
  reset();
  try {
    const target = publicImportURL(url.value.trim());
    if (!consent.checked)
      throw new Error("Confirm that this link is public and may be retrieved.");
    if (form?.getAttribute("aria-busy") === "true")
      throw new Error("Wait for the current source lookup to finish.");
    // Cancel any old OCR so it cannot overwrite imported text later.
    document.dispatchEvent(new Event("keo:ocr-cancel"));
    const current = generation;
    controller = new AbortController();
    const timer = window.setTimeout(() => controller?.abort(), 18000);
    read.disabled = true;
    cancel!.hidden = false;
    if (form) form.dataset.importing = "true";
    status.textContent = "Retrieving the public link. No AI is used…";
    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target.href, consent: true }),
        signal: controller.signal,
      });
      if (current !== generation) return;
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(
          body.error ?? "The link could not be read. Paste or upload instead.",
        );
      }
      const imported = (await response.json()) as ImportedSource;
      if (current !== generation) return;
      if (imported.kind === "image") {
        // Decode the server-returned raster bytes, never load the remote URL in the browser.
        const [header, payload] = imported.data_url.split(",");
        const bytes = Uint8Array.from(atob(payload), (character) =>
          character.charCodeAt(0),
        );
        await loadImage(
          new Blob([bytes], { type: header.slice(5, header.indexOf(";")) }),
          () => current === generation,
        );
        if (current !== generation) return;
        status.textContent =
          "Image imported. Choose ‘Read text on this device’, then review the claim. This does not authenticate the image.";
      } else {
        document.dispatchEvent(new Event("keo:image-complete"));
        query.value = imported.text;
        status.textContent =
          "Page text imported, not verified. Edit it down to the specific claim." +
          (imported.truncated
            ? " Only the first 2,000 characters are shown."
            : "");
        query.focus();
      }
      reviewRequired();
      const heading = document.createElement("strong");
      heading.textContent = "Imported material · unverified";
      const link = document.createElement("a");
      link.href = publicImportURL(imported.final_url).href;
      link.textContent =
        imported.kind === "text" && imported.title
          ? imported.title
          : "Open original source";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const provenance = document.createElement("p");
      provenance.className = "small";
      provenance.textContent =
        "Retrieved " +
        new Date(imported.retrieved_at).toLocaleString("en-GB") +
        ". Retrieval is not publication or verification. The source link is not added to KEO’s reviewed evidence.";
      note.replaceChildren(
        heading,
        document.createElement("br"),
        link,
        provenance,
      );
      note.hidden = false;
    } catch (error) {
      if (current === generation) throw error;
    } finally {
      clearTimeout(timer);
      if (current === generation) stop();
    }
  } catch (error) {
    if (status)
      status.textContent =
        error instanceof Error && error.name !== "AbortError"
          ? error.message
          : "Import stopped or timed out. Paste the claim or upload the image instead.";
  }
});
