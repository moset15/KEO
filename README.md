# KEO — Kenya Election Observatory

Turn election rumours into evidence. KEO is an independent, non-partisan, open-source evidence navigator, not an election authority.

## One project, two experiences

**The Product Hunt MVP is a lightweight ChatGPT Site.** It prioritises phones, slow connections and accessible public evidence. Sites is the intended host for pages, the small API, native data storage, temporary file storage and secrets. No Supabase, Vercel or separately deployed Cloudflare infrastructure is required. The local Worker simulator is a development tool, not a change of hosting plan.

**The final product is a full web application with an optional 3D God’s Eye View.** After Product Hunt, KEO will develop a reviewed evidence and geospatial core shared by the lightweight experience and an advanced 3D workspace. The light version is permanent, not a disposable demo. Every essential task must remain possible through text, lists and a 2D map.

| Experience                        | Status                             | Purpose                                                                      |
| --------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| KEO Light · ChatGPT Site          | Current MVP implementation         | Ask, investigate text, inspect sources, reference threats and county context |
| Shared evidence platform          | Planned after launch               | Reviewed ingestion, provenance, corrections, APIs and geographic queries     |
| KEO God’s Eye View · full web app | Final product direction, not built | Optional 3D layers, time navigation and evidence-linked exploration          |

Black, red, green and white reflect the Kenyan flag. They do not indicate party affiliation or evidential confidence.

## What works today — and its limits

- Ask and Investigate retrieve a small curated catalogue and show evidence, confidence, gaps and next checks. Two editorial records cover constitutional scheduling and attributed Anthropic research. These are not live news feeds.
- Fourteen threat techniques use hypothetical examples. They are reference material, not confirmed Kenyan incidents.
- The map has all 47 county boundaries, explicitly illustrative records, county filtering and a list fallback. There are no current incident feeds.
- Screenshot preview, manual redaction and on-device text extraction work without an LLM. Correct the extracted text before source lookup; only reviewed text is submitted. Manual entry remains available.
- Native storage can save results privately against a short-lived browser session, with deletion and expiry rules. Results and images are never automatically published.
- The public methodology hub renders the same documentation files as GitHub. See [progress](PROGRESS.md) and [review](REVIEW.md) for verified checks and deployment gaps.

## Zero-budget AI policy

**Astra is optional. Paid inference is off unless `AI_ENABLED=true` is explicitly set.** Pages, filters and curated investigations make no model calls. This means zero AI API spend, not unlimited free hosting or mobile data.

On-device OCR with human correction feeds curated retrieval. Unmatched claims receive a source-checking checklist and relevant publisher links, clearly separate from evidence. Optional free-tier models can assist with selected public text, but have quotas, privacy conditions and variable availability. None is established as universally better than Astra. Cloudflare AI Gateway routes and controls calls; it does not make upstream inference free. See [AI and cost policy](docs/ai-budget.md).

The optional adapter supports OpenAI Responses directly or through the user-selected Cloudflare AI Gateway. Gemini and Workers AI are candidates, **not connected providers**. ChatGPT subscription access is not an API credit balance.

## Full application development plan

1. **Launch KEO Light:** validate source quality, mobile access, honest uncertainty, privacy and the no-paid-AI baseline. Commit each working vertical slice.
2. **Strengthen the evidence core:** editorial review, corrections, source refresh ownership and public-text ingestion only where terms permit.
3. **Add geospatial services when needed:** migrate repositories to PostgreSQL/PostGIS, preserving stable source, claim, evidence, investigation and event IDs. Keep the Site as a client of a versioned API.
4. **Develop God’s Eye View:** prototype a lazy-loaded CesiumJS workspace with licensed county layers, reviewed events, a timeline and click-through evidence. Evaluate the [God’s Eye View reference project](https://github.com/bilawalsidhu/gods-eye-view), not as an existing KEO integration or blanket permission to reuse its datasets.
5. **Retain broad device access:** 2D/list parity, low-data controls, keyboard navigation, reduced motion and explicit graphics fallbacks. 3D will not be required or promised on every device.

No voter profiling, private-person tracking, face recognition, private-group scraping, targeted persuasion, automatic attribution, fraud accusations or independent winner declarations. Read the [full roadmap and gates](docs/roadmap.md).

## Run locally

Use Node.js 24 and npm. The lockfile pins dependencies.

```sh
npm ci
npm run check
npm test
npm run build
npx wrangler d1 migrations apply keo-local --local
npx wrangler dev --ip 127.0.0.1 --port 8787
```

Open the printed local URL. `npm run dev` previews static pages; the Worker preview also serves the API. Rebuild after static-page changes. Run `npx playwright test` against the running preview for browser checks.

## Hosting and configuration

ChatGPT Sites owns the runtime and native `DB`/`BUCKET` bindings in `.openai/hosting.json`. Build, validate, commit and push the source; use Sites to save and privately preview that exact version. Public release is a separate owner-approved step. Do not run a standalone production Wrangler deployment. See [architecture](docs/architecture.md).

No secret is needed for the zero-paid-AI baseline. Optional live mode needs `AI_ENABLED=true`, `AI_MODEL` and either `OPENAI_API_KEY` or all three `AI_GATEWAY_ACCOUNT_ID`, `AI_GATEWAY_ID`, `AI_GATEWAY_TOKEN` settings. Use ignored `.dev.vars` locally and Sites secrets when hosted. Never put keys in browser code, Git or public documentation. Rate limits do not replace a provider spending cap. Leave live mode off until a budget and real-provider test are approved.

## Documentation

- [Evidence](methodology/evidence.md), [confidence](methodology/confidence.md), [attribution](methodology/attribution.md), [privacy](methodology/privacy.md), [taxonomy](methodology/threat-taxonomy.md)
- [Architecture](docs/architecture.md), [roadmap](docs/roadmap.md), [AI budget](docs/ai-budget.md), [device support](docs/device-support.md), [implementation](docs/implementation-plan.md)
- [Data licences](data-sources/README.md), [map provenance](docs/map-data.md), [threat notes](docs/threat-content-notes.md)
- [Demo and release checks](docs/product-hunt.md), [specification](SPEC.md), [progress](PROGRESS.md), [review](REVIEW.md)
- [Contributing](CONTRIBUTING.md), [security](SECURITY.md), [code of conduct](CODE_OF_CONDUCT.md)

Code is [MIT licensed](LICENSE). Third-party data, models and publications retain separate terms; an open-source code licence does not grant redistribution rights to linked material.
