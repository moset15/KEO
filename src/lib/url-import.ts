import { publicImportURL, type ImportedSource } from "./import-policy";
import { validateImage } from "./images";
import { checkRasterSize } from "./raster-size";
import { decodeHTML } from "entities";
import type { HTMLRewriter as WorkerRewriter } from "@cloudflare/workers-types";

export class ImportError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const tidy = (text: string) => text.replace(/\s+/g, " ").trim();

// Parse remotely supplied markup in the Worker, never in the browser.
// Two passes ensure removed descendants cannot leak scripts or navigation text.
export async function extractHTML(html: string) {
  const Rewriter = (
    globalThis as unknown as {
      HTMLRewriter: new () => WorkerRewriter;
    }
  ).HTMLRewriter;
  // Worker and DOM Response types differ; these are native Worker responses.
  const native = (body: string) =>
    new Response(body, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }) as unknown as Parameters<WorkerRewriter["transform"]>[0];
  const cleaned = await new Rewriter()
    .on(
      "script,style,noscript,template,nav,header,footer,form,iframe,svg,[hidden],[aria-hidden=true]",
      {
        element(element) {
          element.remove();
        },
      },
    )
    .transform(native(html))
    .text();
  let title = "",
    article = "",
    main = "",
    body = "",
    all = "";
  const reader = new Rewriter()
    .on("title", {
      text(chunk) {
        title += chunk.text;
      },
    })
    .on("article", {
      text(chunk) {
        article += chunk.text + (chunk.lastInTextNode ? " " : "");
      },
    })
    .on("main", {
      text(chunk) {
        main += chunk.text + (chunk.lastInTextNode ? " " : "");
      },
    })
    .on("body", {
      text(chunk) {
        body += chunk.text + (chunk.lastInTextNode ? " " : "");
      },
    })
    .onDocument({
      text(chunk) {
        all += chunk.text + (chunk.lastInTextNode ? " " : "");
      },
    });
  await reader.transform(native(cleaned)).arrayBuffer();
  return {
    title: tidy(decodeHTML(title)).slice(0, 200),
    text:
      [article, main, body, all]
        .map((text) => tidy(decodeHTML(text)))
        .find((text) => text.length >= 5) ?? "",
  };
}

async function boundedBody(
  response: Response,
  max: number,
  signal: AbortSignal,
) {
  if (Number(response.headers.get("content-length")) > max) {
    await response.body?.cancel();
    throw new ImportError(
      "This file is too large. Paste the claim or upload a smaller image.",
      413,
    );
  }
  const reader = response.body?.getReader();
  if (!reader) throw new ImportError("This link returned an empty file.", 422);
  const chunks: Uint8Array[] = [];
  let total = 0;
  const cancel = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    while (true) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      total += value.length;
      if (total > max)
        throw new ImportError(
          "This file is too large. Paste the claim or upload a smaller image.",
          413,
        );
      chunks.push(value);
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    await reader.cancel().catch(() => {});
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

export async function importPublicURL(
  input: string,
  fetcher: typeof fetch = fetch,
  htmlReader = extractHTML,
  deadlineMs = 12000,
): Promise<ImportedSource> {
  let url = publicImportURL(input);
  const requested_url = url.href;
  const visited = new Set<string>();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), deadlineMs);
  try {
    for (let redirects = 0; redirects <= 3; redirects++) {
      if (visited.has(url.href))
        throw new ImportError(
          "This link redirects in a loop. Open it yourself and paste the claim.",
          422,
        );
      visited.add(url.href);
      const response = await fetcher(url.href, {
        method: "GET",
        redirect: "manual",
        headers: {
          Accept: "text/html, text/plain, image/png, image/jpeg, image/webp",
        },
        signal: controller.signal,
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        await response.body?.cancel();
        const location = response.headers.get("location");
        if (!location || redirects === 3)
          throw new ImportError(
            "This link has too many or invalid redirects. Paste the claim instead.",
            422,
          );
        url = publicImportURL(new URL(location, url).href);
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new ImportError(
          "The publisher blocked this request or the page is unavailable. Open the link yourself, then paste or upload.",
          502,
        );
      }
      const type = (response.headers.get("content-type") ?? "")
        .split(";")[0]
        .trim()
        .toLowerCase();
      const image = ["image/png", "image/jpeg", "image/webp"].includes(type);
      if (!image && !["text/html", "text/plain"].includes(type)) {
        await response.body?.cancel();
        throw new ImportError(
          "Use an HTML article, text page, JPEG, PNG or WebP. For PDFs or other documents, paste the claim or upload a screenshot.",
          415,
        );
      }
      const bytes = await boundedBody(
        response,
        image ? 3000000 : 1000000,
        controller.signal,
      );
      const provenance = {
        requested_url,
        final_url: url.href,
        retrieved_at: new Date().toISOString(),
      };
      if (image) {
        let binary = "";
        for (let offset = 0; offset < bytes.length; offset += 8192) {
          binary += String.fromCharCode(
            ...bytes.subarray(offset, offset + 8192),
          );
        }
        const data_url = "data:" + type + ";base64," + btoa(binary);
        try {
          validateImage(data_url);
          checkRasterSize(bytes, type);
        } catch {
          throw new ImportError(
            "The file is not a supported image. Upload a readable screenshot instead.",
            415,
          );
        }
        return { ...provenance, kind: "image", data_url };
      }
      const decoded = new TextDecoder().decode(bytes);
      const extracted =
        type === "text/html"
          ? await htmlReader(decoded)
          : { title: "", text: tidy(decoded) };
      if (extracted.text.length < 5)
        throw new ImportError(
          "No readable text was found. This page may need JavaScript or sign-in. Paste the claim instead.",
          422,
        );
      return {
        ...provenance,
        kind: "text",
        title: extracted.title,
        text: extracted.text.slice(0, 2000),
        truncated: extracted.text.length > 2000,
      };
    }
    throw new ImportError("Unable to read this link.", 502);
  } catch (error) {
    if (error instanceof ImportError) throw error;
    if (controller.signal.aborted)
      throw new ImportError(
        "The publisher took too long to respond. Paste the claim or upload the image instead.",
        504,
      );
    throw new ImportError(
      "This link could not be read safely. Check the supported sources, or paste/upload instead.",
      400,
    );
  } finally {
    clearTimeout(timer);
  }
}
