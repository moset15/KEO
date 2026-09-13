# Contributing to KEO

Useful contributions include reproducible bug reports, accessible interface improvements, source corrections and carefully sourced election background. KEO supports neutral public-interest research. Voter profiling, targeted persuasion, private-person surveillance, automatic fraud accusations and private-message collection are outside the project.

## Development workflow

Read [SPEC.md](SPEC.md) and the [architecture](docs/architecture.md). Agree a short spec or acceptance change before building a new feature. Work on a branch and keep each change a working vertical slice with a small conventional commit, for example `fix: preserve source dates in evidence cards`. Preserve unrelated work.

Run `npm ci`, then `npm run check`, `npm test` and `npm run build`. Use the full Wrangler preview described in the README for API checks. For interface changes, check 360px before desktop, keyboard access, labels, focus, readable contrast and empty/error states. Run tests proportionate to the behaviour changed. Include the observed checks and any unverified live dependency in the pull request.

Use strict TypeScript, small functions and British English in authored comments and copy. Do not commit secrets, `.env` or `.dev.vars` files, credentials, personal screenshots or generated provider responses containing personal information. Inspect the staged diff before committing. Commit each completed slice and keep `main` deployable.

## Evidence and data contributions

Provide an exact source URL, publisher, publication date where known, retrieval time and a concise explanation of what the source establishes. Preserve stable IDs. Record corrections through Git instead of silently rewriting a claim's history. A missing source or a broken link is an evidence gap, not a false verdict.

Check redistribution terms before adding external content. Prefer links and short, accurate paraphrases when permission is unclear. Do not add unlicensed bulk data, full articles, private messages, personal phone numbers or inferred political affiliations. Maps and research reports require their own source and licence records.

Threat examples must remain explicitly hypothetical until a documented case has its own reviewed evidence. Do not infer Kenyan activity from an overseas report. Ordinary shared language or a political benefit cannot establish coordination or attribution. See [methodology](methodology/evidence.md).

For a pull request, explain the problem, resulting behaviour, evidence or licence changes, and validation. Use the project's reviewer workflow before merging. Security concerns belong in the private process described in [SECURITY.md](SECURITY.md).
