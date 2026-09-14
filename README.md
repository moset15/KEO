# KEO — Kenya Election Observatory

Turn election rumours into evidence. KEO is an independent, non-partisan, open-source evidence navigator, not an election authority.

[Open the private ChatGPT Site preview](https://keo-observatory.nya-onmoseti.chatgpt.site). Public access is not enabled yet.

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
- Ask, Investigate and Verify include visible screenshot controls: preview, manual redaction and on-device text extraction without an LLM. Correct the extracted text before source lookup; only reviewed text is submitted. Manual entry remains available.
- Article/official-notice and direct image URLs can be imported from the exact supported public hosts listed beside the input. Pages yield editable plain text; images use the same local reader. Imported material is unverified, never automatically added to the evidence catalogue.
- Native storage can save results privately against a short-lived browser session, with deletion and expiry rules. Results and images are never automatically published.
- The public methodology hub renders the same documentation files as GitHub. See [progress](PROGRESS.md) and [review](REVIEW.md) for verified checks and deployment gaps.

## Zero-budget AI policy

### Screenshot and URL workflow

Open **Add screenshot or photograph** in Ask/Investigate (already expanded on Verify), choose JPEG/PNG/WebP, select **Read text on this device**, correct the claim and tick the review box. Local files stay in the browser. Animated images use the first frame. The first English OCR download needs several MB; typing is always available.

For a link, open **Add article or image URL**, enter a public HTTPS URL, confirm permission and select **Read link**. KEO’s server retrieves the link with no user cookies or credentials, within time/byte limits. The browser never executes imported HTML. Text is limited to the first 2,000 characters for human editing; a linked original and retrieval time are shown. Direct JPEG/PNG/WebP links (up to 3 MB) become a local preview for OCR. This is retrieval, not authentication or fact-checking.

Supported exact hosts cover IEBC, Kenya Law, Africa Check, PesaCheck, Anthropic, Meta’s newsroom, X’s public image CDN and Wikimedia uploads; the UI and `src/lib/import-policy.ts` contain the complete list. There is no arbitrary proxy, link crawling or login access. Redirects are rechecked against the same allowlist. PDFs, unsupported/blocked sites and JavaScript-only pages require opening the original yourself, then pasting the claim or uploading a screenshot. The original URL is not saved with the investigation; only the reviewed claim is submitted for lookup.

The native HTML reader uses the existing `entities` package as an explicit server dependency to decode named/numeric HTML characters correctly. This adds no external service. Run `node scripts/test-import-runtime.mjs` for the native parser/redirect/image checks with local publisher fixtures.

**Two-tier AI strategy: Build-time vs Production.** Frontier models (**GPT-6 Astra** and **Gemini 3.8**) are leveraged during development for engineering, architecture, refactoring, and test synthesis under fixed workstation subscriptions, incurring KSh 0 in runtime traffic costs. For the public production runtime, KEO deploys a zero-to-low-cost fleet: on-device Tesseract.js OCR and native D1/SQLite matching as the zero-spend baseline, with highly cost-effective models (such as Gemini 2.5 Flash/Flash-Lite or Cloudflare Workers AI) evaluated as lightweight production candidates. Paid runtime inference is off by default (`AI_ENABLED=false`).

On-device OCR with human correction feeds curated retrieval. Unmatched claims receive a source-checking checklist and relevant publisher links, clearly separate from evidence. Cloudflare AI Gateway routes and controls calls; it does not make upstream inference free. See [AI and cost policy](docs/ai-budget.md).

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
