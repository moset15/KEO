const input = document.querySelector<HTMLInputElement>("#image-file");
const canvas = document.querySelector<HTMLCanvasElement>("#image-canvas");
const editor = document.querySelector<HTMLElement>("#image-editor");
const error = document.querySelector<HTMLElement>("#form-error");
let original: ImageBitmap | undefined;
let revision = 0;
function paint() {
  if (original && canvas) {
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#fff";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.drawImage(original, 0, 0, canvas.width, canvas.height);
  }
}
function clear() {
  revision++;
  original?.close();
  original = undefined;
  if (input) input.value = "";
  if (canvas) {
    canvas.width = 1;
    canvas.height = 1;
    delete canvas.dataset.ready;
  }
  if (editor) editor.hidden = true;
  const consent = document.querySelector<HTMLInputElement>("#image-consent");
  if (consent) consent.checked = false;
}
input?.addEventListener("change", async () => {
  const file = input.files?.[0];
  if (!file) return;
  const current = ++revision;
  try {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    )
      throw new Error("Choose a JPEG, PNG or WebP no larger than 8 MB.");
    const bitmap = await createImageBitmap(file);
    if (current !== revision) {
      bitmap.close();
      return;
    }
    if (bitmap.width * bitmap.height > 36000000) {
      bitmap.close();
      throw new Error(
        "This image is too large. Resize it to under 36 megapixels.",
      );
    }
    original?.close();
    original = bitmap;
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    canvas!.width = Math.round(bitmap.width * scale);
    canvas!.height = Math.round(bitmap.height * scale);
    paint();
    canvas!.dataset.ready = "true";
    editor!.hidden = false;
    error!.hidden = true;
  } catch (e) {
    clear();
    error!.textContent =
      e instanceof Error ? e.message : "Unable to read image.";
    error!.hidden = false;
  }
});
let start: { x: number; y: number } | undefined;
function point(event: PointerEvent) {
  const r = canvas!.getBoundingClientRect();
  return {
    x: ((event.clientX - r.left) * canvas!.width) / r.width,
    y: ((event.clientY - r.top) * canvas!.height) / r.height,
  };
}
canvas?.addEventListener("pointerdown", (event) => {
  if (!canvas.dataset.ready) return;
  canvas.setPointerCapture(event.pointerId);
  start = point(event);
});
canvas?.addEventListener("pointerup", (event) => {
  if (!start) return;
  const end = point(event);
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#182c30";
  context.fillRect(
    Math.min(start.x, end.x),
    Math.min(start.y, end.y),
    Math.max(12, Math.abs(end.x - start.x)),
    Math.max(12, Math.abs(end.y - start.y)),
  );
  start = undefined;
});
canvas?.addEventListener("pointercancel", () => {
  start = undefined;
});
document.querySelector("#reset-image")?.addEventListener("click", paint);
document.querySelector("#clear-image")?.addEventListener("click", clear);
window.addEventListener("pagehide", clear);
document.addEventListener("keo:image-complete", clear);
