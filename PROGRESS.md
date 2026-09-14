# Progress: KEO

Updated 14 September 2026.

## Implemented

- Initial Ask evidence slice: fdabb58; Investigate/source search: 6e41ef1.
- Native Sites-compatible pages, API, catalogue/result storage, generated migrations, owner-session deletion and expiry tests: 58b252b.
- On-device OCR and no-LLM research guidance: 84252d9.
- Inline screenshot controls in Ask, Investigate and Verify, plus supported public article/official-notice and direct image URL imports. Imported material remains unverified. Both flows require human text review before source lookup.
- Restricted server retrieval: exact HTTPS hosts, checked redirects, no forwarded user credentials, deadline/byte bounds, raster header/dimension checks and transient responses. Manual entry survives blocked/corrupt imports, cancellation and stale image failures.
- Fourteen reference threat pages, licensed 47-county geometry, illustrative map records and text/list fallback.
- Public/GitHub documentation, full God’s Eye View roadmap, permanent lightweight access and Kenyan flag colours.
- Explicit AI enable switch; credentials alone cannot activate paid requests.

## User-directed scope and deviations

The original standalone hosting plan is superseded by ChatGPT Sites. The zero-budget preference makes paid inference optional and off by default. No paid model was configured or called.

URL import is a restricted public-source reader, not an arbitrary proxy or web crawler. Unsupported, private, PDF, blocked and JavaScript-only pages need pasted text or a screenshot. The existing entities package is now explicitly declared for correct HTML character decoding; no external service was added. English OCR is on demand and uses mobile data.

PostGIS, ingestion, citizen reports and the optional 3D full application remain post-launch work. The light version is permanent.

## Validation

- Type checking: zero errors/warnings; five pre-existing deprecation hints.
- 89 unit tests and 17 browser tests passed.
- Native Worker fixture checks passed for HTML text/entity extraction, safe redirects, raster import, no embedded tracker requests and no forwarded cookies/authorisation.
- Browser coverage includes PNG/JPEG/WebP, real on-device OCR, text-only submission, review consent, failed/cancelled imports, manual fallback, preserved newer images/claims and disabled controls during lookup.
- All 21 public documentation routes and primary routes passed 360px checks. Keyboard, text enlargement, tablet/desktop and no-JavaScript reading were checked.
- Latest cold-cache local LCP: 460ms home and 396ms methodology at 360px, 1.6Mbps, 150ms latency, CPU ×4. These are emulator measurements, not production or real-device proof.
- Compatible 46-page build passed. Production dependency audit: zero known vulnerabilities. Secret-pattern checks of source/history found no credentials.

## Release status

The registered native Site is owner-only. At this source review, hosting publication is the next delivery step, not a verified public launch. Record the exact deployment outcome separately. Real Android/iOS testing, production-network checks and owner public-release approval remain gates. The approval service briefly interrupted validation with a usage-limit error; work resumed after it cleared.

## Next development priorities

Expand reviewed evidence coverage and validate the launch device matrix. Begin the shared core and optional 3D workspace only after Product Hunt feedback.
