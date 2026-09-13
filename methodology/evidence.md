# Evidence and claim assessments

KEO helps users inspect public evidence. A result must identify what the evidence establishes and what remains unknown. Its current curated library contains one paraphrased Constitution excerpt, useful as legal background. It does not contain current notices or a continuously refreshed election feed.

Each evidence record has a stable ID, source-registry ID, publisher, title, original URL, source type, publication date when known, retrieval time and notes. Optional archive and hash fields are null when unavailable. A null publication date is unknown, not the retrieval date. The response's request time is not a claim that every linked document was fetched again at that time.

Live web-search citations are candidate evidence. Their excerpts may be model-produced summaries rather than direct quotations; the UI must retain that warning. A citation's presence does not prove authenticity, accuracy or current applicability. Domain restrictions narrow the search but do not make every page authoritative for every question.

Prefer applicable primary records, then independent fact checks and corroborating reporting. Research can explain a pattern without documenting a local incident. Deduplicate copied or syndicated material; ten copies of one report are not ten independent confirmations. The MVP uses conservative URL/source independence keys, so it may omit useful material from the same publisher and cannot identify every cross-publisher copy.

| Status                | Meaning                                                                              |
| --------------------- | ------------------------------------------------------------------------------------ |
| Supported             | Relevant evidence supports the material claim                                        |
| Likely supported      | Evidence points towards support with material uncertainty                            |
| Misleading            | Presentation, scope or omitted context creates a materially inaccurate impression    |
| Unsupported           | The available material does not substantiate the claim; this is not proof of falsity |
| False                 | Reliable relevant evidence directly contradicts the material claim                   |
| Unverified            | The necessary verification has not been completed                                    |
| Insufficient evidence | The available evidence cannot support an assessment                                  |

Structured live responses must cite existing evidence IDs. Unknown references and malformed responses are rejected. Missing evidence never becomes a false verdict by default. Current procedural claims require current applicable official evidence, including relevant changes; cached legal context alone is insufficient. If a source or provider fails, disclose the gap and leave the claim unresolved.

Correction requests should provide the disputed statement, exact source, date and proposed correction. Preserve stable IDs and record changes through Git. Third-party content retains its own terms, regardless of whether it is publicly accessible.
