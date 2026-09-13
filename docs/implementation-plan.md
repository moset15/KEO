# MVP implementation plan

Build working vertical slices and commit each one. The launch target does not expand scope into Stage 2.

1. Foundation and Ask: strict schemas, source registry, curated retrieval and cautious evidence responses.
2. Investigate: ranking, deduplication, confidence, gaps and failure paths.
3. Native runtime and images: Sites-compatible server, native migrations, private temporary results, local preview/redaction and optional consented remote extraction.
4. Threats and map: 14 reference techniques, licensed 47-county geometry, explicit illustrative records and a list fallback.
5. Documentation and identity: a public hub generated from GitHub Markdown, full application roadmap, zero-budget policy and Kenyan flag colours.
6. Release: tests, mobile checks, security review, native private preview and owner-approved public launch.

The no-budget decision supersedes a mandatory paid Astra launch dependency. Browser OCR is a separate no-LLM slice with text review, local asset hosting and a manual alternative. Optional remote models require real-provider validation before activation.

## Repository structure

- src/pages, layouts, components, styles: static-first mobile interface.
- src/scripts: investigations, image preview, map and optional WebMCP form staging.
- src/lib: domain schemas, repositories, safeguards, model adapter and native storage.
- worker: Site API transport and security boundaries.
- data: versioned public evidence, sources, threats, illustrative events and documentation index.
- db and drizzle: native schema and generated migrations.
- public: static assets and licensed geometry.
- prompts: separate civic, ranking, extraction and analysis instructions.
- tests: domain, provider, transport, storage and browser checks.
- methodology, docs, data-sources: shared website/GitHub documentation.

## Acceptance discipline

Do not confuse an adapter with a tested live integration, a reference technique with an incident, or a planned feature with a working one. Record actual checks in PROGRESS and REVIEW. Preserve stable IDs and repository boundaries for later PostGIS migration. Keep paid calls off by default; no automatic paid fallback.
