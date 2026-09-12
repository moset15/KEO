# Spec: KEO Product Hunt MVP
Status: Approved for implementation by the supplied brief's instruction to proceed immediately
Date: 2026-09-12 · Client: internal · Type: tool

## Problem and users
Kenyan residents, journalists and researchers need to trace election claims to public evidence without voter profiling or unsupported accusations. Stage 1 supports the September 18 launch; Stage 2 is documentation only.

## Scope and interfaces
1. Static Astro landing page and Ask, Investigate, Verify, Map, Threats, Sources and About routes. Mobile bottom navigation, neutral ink/cream/teal design, accessible forms and evidence cards.
2. TypeScript/Zod domain schemas for sources, evidence, claims, investigations, events, locations, organisations, public figures, official notices, fact checks, media and election entities. Stable IDs and versioned JSON data.
3. Ask and Investigate POST to a Cloudflare Worker. Retrieve curated evidence deterministically; optional OpenAI Responses web search through Cloudflare AI Gateway followed by strict structured analysis. Provider selection uses server configuration; gpt-6-astra is documented but account access must be tested. No credential means an explicit curated-only result, never a simulated AI result.
4. Screenshot selection, local preview, browser re-encoding to remove metadata, clear transmission consent, structured vision extraction followed by investigation. No persisted uploads. Missing provider returns an actionable unavailable state with manual text alternative.
5. Fourteen threat technique detail pages distinguish observation, assessment and attribution. Research context does not imply observed Kenyan activity.
6. Lazy-loaded MapLibre county map with searchable county selection, evidence-linked curated records and accessible list fallback. Example records are visibly labelled, never current incidents.
7. Source registry with licence/redistribution status, methodology, privacy and open-source documentation; MIT code licence, separate third-party data terms.
8. Automated tests, mobile browser verification, security checks, conventional slice commits and push to GitHub. Cloudflare preview if account access is available.

## Non-goals
No Stage 2 database, live ingestion, citizen reporting, individual surveillance, voter targeting, autonomous attribution, result declarations, Cesium or campaign optimisation. No fabricated report dated September 2026. No claim that cached context verifies a new notice.

## Constraints and architecture
Near-zero idle cost. Astro static output served by Workers assets; only /api invokes server logic. Provider interface and repository functions remain independent of UI. Third-party map loads only on Map. Inputs are bounded, schema-validated and untrusted. Same-origin API, optional Cloudflare rate limit, no body logging or storage. Live paid provider requires configured abuse protection. Source search results are not automatically verified evidence.

## Acceptance criteria
- [ ] Landing and every route work at 360px with labelled controls and keyboard focus.
- [ ] Ask retrieves relevant evidence and shows assessment, confidence, provenance and last checked.
- [ ] Investigation handles unsupported claims, missing evidence, duplicate sources, invalid input and provider failure.
- [ ] Live provider uses strict structured output and rejects invented evidence references.
- [ ] Screenshot flow validates type/size, obtains consent, extracts claims with live vision and clears local state; provider absence is explicit.
- [ ] Map displays licensed 47-county boundaries, filters and evidence details with a list fallback.
- [ ] All 14 threat pages, source registry and methodology are accessible.
- [ ] Civic misuse prompts receive neutral redirection; unverified never becomes false by default.
- [ ] Typecheck, build and meaningful tests pass; no secrets in repository/history.
- [ ] Semantic HTML, unique titles, meta/OG, sitemap and robots; throttled mobile LCP target <2s measured and reported.
- [ ] Open-source docs, roadmap, two-minute demo, review report and commits pushed.
- [ ] Live screenshot → source search → assessment verified against configured provider; Cloudflare preview verified before production.

## Open questions and working assumptions
Credentials/model availability and Cloudflare account access are environmental unknowns. Continue all implementation and local checks; report any live validation blocker explicitly. Code is MIT; data licence permissions remain per source. The supplied detailed design direction is sufficient to build without a separate prototype round. App deploy uses an equivalent web application rather than assuming ChatGPT Sites supports the backend.
