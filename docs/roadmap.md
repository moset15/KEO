# Roadmap: KEO Light to God’s Eye View

The Product Hunt target is 18 September 2026. This is a development plan, not a claim that launch, funding or future capabilities are complete. Full application development begins after the MVP launch and feedback.

## Permanent light experience

KEO Light is the ChatGPT Site MVP and the enduring low-data version. The final product is a full web application with an optional 3D God’s Eye View. Both must share source records, verification labels and corrections. Visual detail must never imply stronger evidence.

```text
                     Shared evidence core
                sources · claims · evidence
               investigations · events · review
                       /             \
              KEO Light              Full KEO web app
            ChatGPT Site              God’s Eye View
          text · lists · 2D          optional 3D · timeline
```

## Phase 1 — launch the lightweight Site

Keep Ask, Investigate, reference threats, source cards, methodology and the 47-county map useful without paid inference. New claims stay unverified when the catalogue cannot answer them. Review source coverage and privacy wording. Manual screenshot transcription is the current free route; browser OCR with editable text is a separate planned slice, never a claim of image authentication.

Release gates: passing checks, 360px browser testing, keyboard access, measured performance, licence and security review, a working hosted preview and pushed code. Owner approval controls public release. Real-provider acceptance is required before enabling or advertising optional live AI, not for the no-paid-AI baseline.

## Phase 2 — reviewed evidence core

Add draft, review, publish, correct and withdraw states. Record original URLs, publication/retrieval dates, lawful content hashes, source independence, uncertainty and revision history. Separate private submissions from public records.

Start source-specific ingestion only with permitted sources and an accountable refresh owner. Candidates include IEBC, Kenya Law, official gazettes, fact-checkers, licensed media, observer reports, GDELT and ACLED subject to terms. A candidate is neither an integration nor a licence grant. Add stale-data labels, health checks and correction channels before increasing volume.

## Phase 3 — shared API and geospatial storage

Introduce PostgreSQL/PostGIS when reviewed volume or spatial queries exceed native storage. Preserve stable IDs and version the API. Migrate through export, backfill, count/hash checks, geographic validation, read-only comparison and a rollback checkpoint. Keep the Site usable throughout; no big-bang replacement.

Add queues only for measured asynchronous workloads, with bounded jobs and retries. A read-only public API and MCP tools must expose the same reviewed records, enforce access and never leak private uploads. Every external service needs a concrete requirement, expected cost, limits and exit path.

## Phase 4 — the 3D God’s Eye View

Prototype a separately loaded CesiumJS workspace after the shared evidence API is stable. The public [God’s Eye View reference](https://github.com/bilawalsidhu/gods-eye-view) uses CesiumJS, Vite and JavaScript. Its [MIT code licence](https://github.com/bilawalsidhu/gods-eye-view/blob/main/LICENSE) does not cover every dataset or service. Audit assets, costs and compatibility before reuse. It has not been integrated into KEO.

First slice: Kenya → county → reviewed event → original evidence. Then add a time window, layer toggles, verification filters and evidence panels. Candidate layers include administrative boundaries, reviewed notices, observer reports and appropriately generalised civic events. Label approximate coordinates and dates; do not invent missing precision. Aggregate or omit sensitive locations.

No terrain, satellite imagery, buildings, live feeds or paid API access is assumed free. Start with bounded licensed datasets. Load 3D only after user action, detect unsupported graphics and context loss, and keep a persistent light-view switch. Every essential record, filter and evidence link must also work through lists and 2D.

Release gates: useful analyst testing, data rights, privacy review, fallback parity, keyboard access, device/network benchmarks, bounded tile costs, operational ownership and rollback. There is no committed 3D delivery date.

## Phase 5 — carefully expand workflows

Citizen reporting and possible Ushahidi interoperability need consent, private intake, human triage, verification and a separate publication decision. Submission is not verification. Result-form workflows may preserve lawful originals, hash files, extract text and check arithmetic, but discrepancies go to human review. Do not automatically allege fraud or declare winners.

PWA/offline reading requires visible stale-data dates. English/Kiswahili support needs editorial testing. Aggregate narrative analysis must not identify or target voters, ethnic/religious groups or private people. No surveillance feeds, face recognition or private-group scraping.

## Delivery discipline

Build a working vertical slice, test it, review it, commit it and push it before expanding. Keep main deployable and work on focused branches. Reassess after Product Hunt feedback. No Stage 2 ingestion, PostGIS, citizen reporting, public API or 3D workspace is implemented in this MVP.
