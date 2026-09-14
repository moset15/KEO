# Spec: KEO Product Hunt MVP

Status: approved by the supplied brief and subsequent user directions.
Updated: 14 September 2026. Internal product. Product Hunt target: 18 September.

## Purpose and scope

Help Kenyan residents, journalists and researchers trace election claims to public evidence. The MVP is a lightweight ChatGPT Site; full application development happens after launch. Keep a permanent light version alongside a future optional 3D God’s Eye View.

1. Mobile-first Ask, Investigate, Verify, Map, Threats, Sources and methodology routes. Kenyan flag colours: black, red, green and white.
2. Stable validated domain contracts, source provenance and explicit uncertainty.
3. Curated investigations with no paid AI calls by default. Optional provider adapters must reject invalid evidence references and fail honestly.
4. Local screenshot preview/redaction and on-device OCR, editable text with explicit review before submission, and manual entry fallback. No screenshot pixels leave the browser in the default workflow.
5. Fourteen reference threat techniques and licensed 47-county geometry with illustrative records and list fallback.
6. Native Sites hosting, data, temporary file storage and secrets. No external production infrastructure without a demonstrated requirement and written reason.
7. Public documentation hub built from the repository Markdown, including methodology, privacy, architecture, zero-budget policy, device support, governance, setup and the full roadmap.
8. Tests, review, atomic conventional commits and push to GitHub.
9. Visible screenshot controls inside Ask and Investigate, plus public article/official-notice and direct raster-image URL import. Use a bounded, exact-host allowlisted fetcher, plain-text extraction and on-device OCR, with review before source lookup. Unsupported, private, PDF and blocked pages must explain the paste/upload fallback. Imported material is not verified evidence.

## Acceptance criteria

| ID  | Criterion                                                                                                                                                                                                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Primary routes and documentation work at 360px, with labelled controls, keyboard focus and no horizontal page overflow.                                                                                                                |
| A2  | Ask/Investigate show evidence, confidence, gaps and separate source/request dates; unknown claims are not false by default.                                                                                                            |
| A3  | Input, provider failures, duplicate sources and invented references are handled; credentials alone cannot enable paid calls.                                                                                                           |
| A4  | Image preview/redaction, local OCR, reviewed text-only submission and missing-asset/manual fallback work without an LLM.                                                                                                               |
| A5  | Map has 47 licensed county boundaries, filters, explicit illustrative records and a list fallback.                                                                                                                                     |
| A6  | All 14 threat pages and source registry distinguish reference material from verified incidents.                                                                                                                                        |
| A7  | Methodology renders the GitHub documentation, including future God’s Eye View, enduring light access and no-budget AI policy.                                                                                                          |
| A8  | Native persistence, expiry and owner-session deletion are tested; privacy explains actual limits.                                                                                                                                      |
| A9  | Typecheck, build and meaningful tests pass; no secrets enter code/history.                                                                                                                                                             |
| A10 | Semantic headings, titles, metadata, sitemap and robots are present; throttled mobile LCP is measured against the under-two-second target.                                                                                             |
| A11 | README and roadmap match the Site; review records evidence and code is committed/pushed.                                                                                                                                               |
| A12 | Ask, Investigate and Verify expose screenshot and URL inputs; supported article/image imports, review, cancellation and fallback work without paid AI. Server fetches reject unsafe hosts, redirects, formats and excessive responses. |

## Release gates and deferred work

A working native hosted preview and owner approval are required before public launch. Actual Android/iOS checks supplement emulation. These operational gates must be reported separately from a local code review.

The user’s KSh 0 preference supersedes mandatory live Astra acceptance. Keep paid calls off. Real-provider screenshot/search/assessment tests are required before enabling optional live AI, not a prerequisite for the free curated baseline. Free-tier alternatives are candidates, not connected integrations.

No Stage 2 PostGIS, ingestion, citizen reporting, API/MCP service, Cesium workspace, private-person surveillance, voter targeting, autonomous attribution or winner declarations. Do not build the full application now or claim universal hardware compatibility. Plan 3D as progressive enhancement with equivalent essential text/list/2D access.

## Delivery

Implement working slices and commit them independently. Use Sites-compatible output and native resource declarations. Retain stable IDs and repository interfaces for future migration. Track real validation results in PROGRESS and REVIEW; do not convert deployment or account unknowns into success claims.
