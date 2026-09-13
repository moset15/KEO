# Privacy and retention

No account is required to read the public catalogue. It is editorial content, not a submission archive. Avoid sending unnecessary names, phone numbers, faces, addresses or private conversations.

## Text and stored results

Text investigations go to the Site API. Paid AI is disabled by default; curated mode makes no model calls. If an operator explicitly enables live mode, text and evidence go to the configured model and its search tools. Pattern-based redaction is not comprehensive anonymisation.

When native storage is available, KEO stores the claim and result privately against a hash of a random browser session. An HttpOnly, same-site cookie associates requests with that session. “Delete saved result” removes a result immediately from the active database. Records expire after 24 hours and are purged on subsequent investigations; this is not a guaranteed physical-deletion deadline while the service is idle. No public history or automatic publication exists. This session design is not strong authentication for highly sensitive reports.

## Screenshots

Selection, preview and manual redaction happen locally. Re-encoding removes embedded metadata, not identifying information visible in pixels. In no-paid-AI mode, transcribe the claim manually; local OCR is planned, not active.

Optional remote extraction requires explicit consent. If enabled, the redacted image goes to the configured model. Native storage holds a private temporary copy, deleted after processing including handled failures. After interruption, cleanup removes originals older than one hour on later verification requests. This is opportunistic cleanup, not a guaranteed one-hour deadline. No image is automatically archived publicly. Future archival preservation needs separate consent and review.

Clearing an image or leaving the page removes application preview state. It cannot recall transmitted data. Do not send sensitive screenshots to a free provider merely because it has no monetary charge.

## Operational records

Optional Responses requests set `store: false`; Gateway calls disable content logs and caching. KEO does not log request bodies. These controls do not guarantee zero provider retention, deletion from backups or absence of operational records. Review [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data) and actual provider settings before activation.

Rate limiting uses a time-bounded hash derived from the connection identifier; local bindings may process the IP transiently. It is not added to evidence or a voter profile. Maps serve local geometry without external tiles/geocoding. External source links contact publishers under their policies.

## Future collection rules

Citizen reports require consent, access, retention, deletion and triage design before collection. Precise locations and private identifiers must not enter public map layers by default. No face recognition, private-person tracking, voter profiling or private-group scraping. Never commit private material or credentials into Git; removing a file does not erase its history.
