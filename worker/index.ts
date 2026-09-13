import { RequestSchema } from "../src/lib/schemas";
import {
  GatewayProvider,
  gatewayReady,
  type GatewayConfig,
} from "../src/lib/gateway";
import { investigateClaim } from "../src/lib/investigate";
import { extractImageClaim, validateImage } from "../src/lib/images";
import { civicRedirect } from "../src/lib/guardrails";
import {
  ensureCatalogue,
  nativeRateLimit,
  saveInvestigation,
  deleteInvestigation,
  hash,
  cleanTemporaryImages,
  type StorageEnv,
} from "../src/lib/storage";
export interface Env extends GatewayConfig, StorageEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  RATE_LIMITER?: {
    limit: (input: { key: string }) => Promise<{ success: boolean }>;
  };
}
const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export async function readBounded(
  request: Request,
  max = 4200000,
): Promise<string> {
  if (Number(request.headers.get("content-length")) > max)
    throw new Error("Too large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty body");
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > max) throw new Error("Too large");
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    await reader.cancel();
  }
}
export async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const live = gatewayReady(env) && !!(env.RATE_LIMITER || env.DB);
  if (url.pathname === "/api/status") {
    if (env.DB) {
      try {
        await ensureCatalogue(env.DB);
      } catch {
        return json({
          live: false,
          provider: "AI service",
          storage_available: false,
        });
      }
    }
    return json({
      live,
      provider: env.OPENAI_API_KEY ? "OpenAI" : "Cloudflare AI Gateway",
    });
  }
  if (url.pathname.startsWith("/api/investigations/")) {
    if (request.method !== "DELETE") return json({ error: "Use DELETE" }, 405);
    if (request.headers.get("origin") !== url.origin)
      return json({ error: "Same-origin requests only" }, 403);
    const session = request.headers
      .get("cookie")
      ?.match(/(?:^|;\s*)keo_session=([a-f0-9-]{36})(?:;|$)/)?.[1];
    if (!session || !env.DB)
      return json({ error: "Record not available" }, 404);
    try {
      return (await deleteInvestigation(
        env.DB,
        await hash(session),
        url.pathname.split("/").pop() ?? "",
      ))
        ? json({ deleted: true })
        : json({ error: "Record not available" }, 404);
    } catch {
      return json(
        { error: "Deletion could not be completed. Please try again." },
        503,
      );
    }
  }
  if (url.pathname !== "/api/investigate")
    return url.pathname.startsWith("/api/")
      ? json({ error: "Not found" }, 404)
      : env.ASSETS.fetch(request);
  if (request.method !== "POST") return json({ error: "Use POST" }, 405);
  if (request.headers.get("origin") !== url.origin)
    return json({ error: "Same-origin requests only" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "JSON required" }, 415);
  let input;
  try {
    input = RequestSchema.parse(JSON.parse(await readBounded(request)));
  } catch {
    return json(
      {
        error:
          "Enter 5–2,000 characters. The request must be valid JSON within the size limit.",
      },
      400,
    );
  }
  if (input.mode === "verify") {
    if (!input.image || !input.consent)
      return json(
        { error: "Choose an image and agree to send it for analysis." },
        400,
      );
    try {
      validateImage(input.image);
    } catch (e) {
      return json(
        { error: e instanceof Error ? e.message : "Invalid image" },
        400,
      );
    }
    if (!live)
      return json(
        {
          error:
            "Live image analysis is not connected yet. Paste the visible claim into Investigate to explore the available evidence.",
        },
        503,
      );
  } else if (input.image)
    return json(
      { error: "Images are accepted only in the verification flow." },
      400,
    );
  if (
    (env.DB || env.RATE_LIMITER) &&
    (input.mode === "verify" || !civicRedirect(input.query))
  ) {
    try {
      const caller = request.headers.get("cf-connecting-ip") ?? "anonymous";
      const allowed = env.DB
        ? await nativeRateLimit(env.DB, caller)
        : (await env.RATE_LIMITER!.limit({ key: caller })).success;
      if (!allowed)
        return json(
          {
            error:
              "Request limit reached. Please wait a minute before trying again.",
          },
          429,
        );
    } catch {
      return json(
        {
          error: "The request limit service is unavailable. Please try again.",
        },
        503,
      );
    }
  }
  const session =
    request.headers
      .get("cookie")
      ?.match(/(?:^|;\s*)keo_session=([a-f0-9-]{36})(?:;|$)/)?.[1] ??
    crypto.randomUUID();
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let connected = true;
      const emit = (value: unknown) => {
        if (connected) {
          try {
            controller.enqueue(encoder.encode(JSON.stringify(value) + "\n"));
          } catch {
            connected = false;
          }
        }
      };
      let imageKey: string | undefined;
      try {
        const steps: string[] = [];
        const step = (message: string) => {
          steps.push(message);
          emit({ type: "step", message });
        };
        let claim = input.query;
        const provider = live ? new GatewayProvider(env) : undefined;
        if (input.mode === "verify") {
          if (env.BUCKET) {
            await cleanTemporaryImages(env.BUCKET);
            imageKey = "temporary/" + Date.now() + "-" + crypto.randomUUID();
            const image = validateImage(input.image!);
            await env.BUCKET.put(imageKey, image.bytes, {
              httpMetadata: { contentType: image.type },
            });
          }
          step("Extracting the visible election claim");
          const extraction = await extractImageClaim(provider!, input.image!);
          claim = extraction.claim;
          emit({
            type: "extracted",
            claim,
            limitations: extraction.limitations,
          });
        }
        const result = await investigateClaim(claim, provider, step);
        if (result.mode === "live")
          result.provider = env.AI_MODEL ?? "Configured AI provider";
        result.trace = steps;
        if (input.mode === "verify")
          result.information_gaps.push(
            "This assessment concerns the visible claim. It does not authenticate the image or identify its creator.",
          );
        if (env.DB && result.mode !== "redirect") {
          try {
            await saveInvestigation(env.DB, await hash(session), result);
            result.stored = true;
            result.storage_note =
              "Saved privately for 24 hours. Expired records are purged on subsequent investigations.";
          } catch {
            result.stored = false;
            result.storage_note =
              "Your result is shown here, but could not be saved. You can copy it before leaving.";
          }
        }
        emit({ type: "result", result });
      } catch (e) {
        emit({
          type: "error",
          message:
            input.mode === "verify" &&
            e instanceof Error &&
            /legible|format|image data|incomplete/.test(e.message)
              ? e.message
              : "The investigation could not be completed. Please try again or paste the visible claim.",
        });
      } finally {
        if (imageKey && env.BUCKET) {
          try {
            await env.BUCKET.delete(imageKey);
          } catch {
            emit({
              type: "step",
              message:
                "Temporary image cleanup will be retried on a later verification request.",
            });
          }
        }
        if (connected) controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Set-Cookie":
        "keo_session=" +
        session +
        "; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400" +
        (url.protocol === "https:" ? "; Secure" : ""),
    },
  });
}
export default {
  async fetch(request: Request, env: Env) {
    try {
      const response = await handle(request, env);
      const headers = new Headers(response.headers);
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      headers.set("Permissions-Policy", "geolocation=(), microphone=()");
      return new Response(response.body, { status: response.status, headers });
    } catch {
      return json(
        { error: "KEO is temporarily unavailable. Please try again." },
        503,
      );
    }
  },
};
