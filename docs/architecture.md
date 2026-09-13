# Architecture and deployment

KEO Light targets ChatGPT Sites. Astro builds static pages; a small Workers-compatible server handles investigations and native storage. Runtime compatibility does not mean a separate Cloudflare production deployment: Sites owns the hosting and actual storage resources.

```text
Browser → Site pages, documentation and local map assets
      └→ Site API → validation, civic safeguards and rate limits
                  ├→ curated repository (no model calls)
                  ├→ native DB: catalogue and temporary private results
                  └→ optional enabled AI: search → assessment → validation
```

## Domain and storage

Zod contracts define sources, claims, investigations, evidence, events, locations, threats and related public records. Publication, retrieval and request timestamps are separate. Repository functions rank and deduplicate curated records; they are not an unrestricted crawler.

Versioned JSON is the editorial seed. Native SQLite-compatible tables cover sources, evidence, events, threats, claims, investigations, rate limits and catalogue metadata. Drizzle owns schema and migrations. Published migrations are append-only. A hashed random browser session owns temporary private results; it is not a public account. Native object storage is used only by optional remote image extraction. See [privacy](../methodology/privacy.md).

## Transport and optional models

The status endpoint reports readiness, not a provider health check. Investigation requests validate bounded JSON, origin and schema, check civic misuse and stream performed operations plus a result. Public progress is not private model reasoning. Result deletion requires the owning session and same origin.

Paid inference requires `AI_ENABLED=true`, model/credentials and native or local rate limiting. The adapter supports OpenAI Responses directly or through Cloudflare AI Gateway. Gemini and Workers AI require separate adapters; neither is connected.

Live search restricts registry domains, labels generated summaries and rejects invalid evidence IDs or malformed output. A URL is not proof. Failures return explicit limited results, never simulated live success. Rate limits cannot guarantee a zero bill; leave AI off without budget approval, provider spending controls and a real end-to-end test.

## Public content and device access

The 14 techniques are reference material. MapLibre and local 47-county geometry load only on the map route; no external basemap or geocoder is used. Records are illustrative and a list remains available without WebGL. The methodology hub renders repository Markdown at build time so GitHub and the Site share the documentation.

The Kenyan flag palette uses written status labels. Static pages require no AI. Image preview/redaction is local; optional remote extraction is consented. Browser OCR is planned, not shipped. See [device support](device-support.md) and [AI policy](ai-budget.md).

## Native Sites release

1. Install and check the project using the README. Apply generated migrations to the local simulator before testing saved results.
2. Build assets into `dist/client`, the compatible server into `dist/server/index.js` and hosting metadata/migrations into `dist/.openai`.
3. Validate the preview, review the exact source, commit working slices and push to GitHub.
4. Use Sites to save that exact committed source and packaged build to the existing registered Site. Manage hosted credentials through Sites secrets.
5. Deploy an owner-only preview and verify it. Public release and custom domains are separate owner-controlled steps; availability is account-specific.

`wrangler.toml` reproduces the runtime locally. Do not use it to provision an external MVP host. The hosting manifest declares logical DB and BUCKET bindings; Sites supplies actual resources. No external database or AI account is needed for the no-paid-AI baseline.

## Dependency decisions

| Dependency           | Concrete reason                             | Limit / exit path                                  |
| -------------------- | ------------------------------------------- | -------------------------------------------------- |
| Astro                | Static-first crawlable pages                | Portable Markdown/JSON                             |
| Zod                  | Validate records, requests and AI output    | Model-independent contracts                        |
| MapLibre             | Interactive 2D county view                  | Lazy loading; HTML list; no paid tiles             |
| Drizzle              | Reproducible native schema/migrations       | Repository boundary for later migration            |
| AI Gateway, optional | User-selected inference routing/control     | Off by default; not free inference or another host |
| Build/test tools     | Repeatable validation and compatible output | Development-only                                   |

Future PostGIS, queues and Cesium need a written requirement and cost/licence review. They are not MVP dependencies.
