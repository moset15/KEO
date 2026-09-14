# Review: KEO — 2026-09-14

Verdict: SHIP — reviewed no-paid-AI code and owner-only preview scope; not public-launch approval.

## Blocking issues

None remaining in the reviewed scope. The separate implementation pass fixed review findings: review consent placement, invalid unused URL blocking manual submission, imports overwriting manual edits, editable controls during lookup, stale image failures erasing newer input, failed imports destroying the existing claim, and HTML entity decoding. Regression checks now pass.

## Acceptance criteria results

| Criterion                        | Result                 | Evidence                                                                                                                                       |
| -------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| A1 Mobile routes/docs            | PASS for tested matrix | 17 browser tests; 360px primary and 21 documentation routes; keyboard/enlargement, tablet/desktop                                              |
| A2 Evidence/uncertainty          | PASS                   | Curated Ask flow, source/request dates and explicit evidence gaps                                                                              |
| A3 Input/failure/budget gate     | PASS                   | 89 unit tests; credentials without enable trigger no model call; bounded importer and rate limits                                              |
| A4 Image workflow                | PASS                   | Real local OCR, PNG/JPEG/WebP preview, review, text-only submission and missing-reader fallback                                                |
| A5 County map                    | PASS for data/list     | 47 licensed boundaries, 48 select options, empty state and no-JavaScript list                                                                  |
| A6 Threats/sources               | PASS                   | 14 reference techniques, hypothetical labels and attributed-research limits                                                                    |
| A7 Public documentation          | PASS                   | 21 shared Markdown routes; permanent light experience and future God’s Eye View plan                                                           |
| A8 Storage/privacy               | PASS locally           | SQLite migration/catalogue/limits, ownership, deletion and expiry tests                                                                        |
| A9 Build/security                | PASS                   | Typecheck clean; 89 units; native runtime check; 46-page build; secret-pattern scan; production audit zero                                     |
| A10 Metadata/performance         | PASS locally           | Semantic headings, title/meta/OG, sitemap/robots; latest LCP 460ms home, 396ms methodology under documented throttling                         |
| A11 Docs/delivery                | PASS for content       | README and Site share documentation; commit/push and deployment outcomes reported separately                                                   |
| A12 Inline screenshot/URL inputs | PASS                   | Article/image fixtures, review and plain-text rendering, cancellation/manual fallback, no stale overwrite; native parser/redirect/image checks |

## Security and correctness

Same-origin JSON endpoints bound input and use parameterised SQL. URL fetches require public-link consent and available rate limiting, validate exact HTTPS hosts on every redirect, and send fresh requests with no user cookies or authorisation. Bodies and deadlines are bounded. Native HTML parsing excludes scripts/navigation/hidden elements; imported HTML is never mounted in the browser. Raster headers/dimensions are checked before browser decoding. Imported material is not promoted to evidence or assigned a verdict.

The importer keeps retrieved material transient; only the separately reviewed claim follows existing private result retention. Local screenshot pixels are not uploaded. Native fixture tests verify redirects, entity decoding, image retrieval and no embedded-resource requests. Browser tests verify stale decoder failure, corrupt images and blocked links preserve current input.

## Fixed checklist

- Correctness: acceptance criteria evidenced above; error/empty/cancelled states tested.
- Security: current/history secret patterns clear, ignored credentials, parameterised queries, exact-host fetch restrictions and session-scoped deletion.
- Stack: static-first Astro; native Sites declarations; no separate production cloud deployment; no CMS/payments.
- Performance/accessibility: 360px, labelled controls, keyboard/focus, enlargement, no-JavaScript reading and lazy graphics/OCR. Main text remains readable; flag colours do not imply confidence or party alignment.
- SEO/hygiene: headings/metadata/sitemap; British English; documented setup, dependencies and conventional slice commits.

## Non-blocking issues and public-release gates

- A successful native hosted deployment must be verified separately from this source review. No public release is authorised by this verdict.
- Actual Android/iOS, assistive-technology and production-network checks remain launch gates. Emulation does not prove universal device support.
- Live vision/search is disabled and real-provider access is untested. English-only OCR needs human correction and cannot authenticate images.
- Link support is deliberately limited to listed hosts and formats; publishers can block retrieval. No arbitrary proxy, full-document/PDF parsing or independent truth verification is claimed.
- Four earlier moderate development-only audit findings concern Drizzle Kit’s legacy esbuild. Production audit reports zero. Five Zod deprecation hints and MapLibre’s lazy-loaded bundle warning remain.
- No 3D workspace, live ingestion or citizen-report service is claimed.

A short owner walkthrough should cover the unverified-import distinction, on-device versus server processing, and the enduring light/3D roadmap before public launch.
