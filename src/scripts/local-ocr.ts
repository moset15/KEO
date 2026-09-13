import type { Worker } from "tesseract.js";
const button = document.querySelector<HTMLButtonElement>("#read-image");
const cancel = document.querySelector<HTMLButtonElement>("#cancel-ocr");
const canvas = document.querySelector<HTMLCanvasElement>("#image-canvas");
const query = document.querySelector<HTMLTextAreaElement>("#query");
const status = document.querySelector<HTMLElement>("#ocr-status");
const submit = document.querySelector<HTMLButtonElement>(
  "#keo-form button[type=submit]",
);
let generation = 0;
let worker: Worker | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
function busy(value: boolean) {
  if (button) button.disabled = value;
  if (cancel) cancel.hidden = !value;
  if (query) query.readOnly = value;
  if (submit) submit.disabled = value;
}
function stop() {
  generation++;
  clearTimeout(timer);
  const previous = worker;
  worker = undefined;
  void previous?.terminate().catch(() => {});
  busy(false);
}
cancel?.addEventListener("click", () => {
  stop();
  if (status)
    status.textContent =
      "Reading cancelled. You can type the visible claim instead.";
});
document.addEventListener("keo:image-changed", () => {
  stop();
  if (query) query.value = "";
  const review = document.querySelector<HTMLInputElement>("#text-review");
  if (review) review.checked = false;
  if (status)
    status.textContent = "Read the current image, or type its claim below.";
});
window.addEventListener("pagehide", stop);
button?.addEventListener("click", async () => {
  if (!canvas?.dataset.ready || !query || !status) {
    if (status)
      status.textContent = "Choose an image first, or type the claim below.";
    return;
  }
  stop();
  const current = generation;
  busy(true);
  status.textContent =
    "Loading the private text reader. The first download uses mobile data; no image is uploaded.";
  timer = setTimeout(() => {
    if (generation !== current) return;
    stop();
    status.textContent =
      "Reading took too long. Try a clearer crop or type the claim.";
  }, 120000);
  try {
    const { createWorker } = await import("tesseract.js");
    if (current !== generation) return;
    const created = await createWorker("eng", 1, {
      workerPath: "/ocr/worker.min.js",
      corePath: "/ocr/core",
      langPath: "/ocr/lang",
      workerBlobURL: false,
      cacheMethod: "none",
      logger: (message) => {
        if (current !== generation) return;
        status.textContent =
          message.status === "recognizing text"
            ? "Reading on this device: " +
              Math.round(message.progress * 100) +
              "%"
            : "Preparing the on-device text reader…";
      },
    });
    if (current !== generation) {
      await created.terminate();
      return;
    }
    worker = created;
    const result = await created.recognize(canvas);
    if (current !== generation) return;
    const text = result.data.text.replace(/\s+/g, " ").trim();
    query.value = text.slice(0, 2000);
    const review = document.querySelector<HTMLInputElement>("#text-review");
    if (review) review.checked = false;
    status.textContent =
      text.length < 5
        ? "Not enough readable text. Try a clearer image or type the claim."
        : "Text extracted locally. Correct errors and remove private details before checking sources." +
          (text.length > 2000
            ? " Only the first 2,000 characters are shown; keep the specific claim."
            : "");
    query.focus();
  } catch {
    if (current === generation)
      status.textContent =
        "This image could not be read on this device. Type the claim below; no image was uploaded.";
  } finally {
    if (current === generation) stop();
  }
});
