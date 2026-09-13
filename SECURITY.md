# Security policy

KEO's MVP handles untrusted election claims and may send consented text or images to an AI provider through Cloudflare AI Gateway. Maintainers welcome reports of exposed credentials, data leakage, injection, unsafe rendering, source-reference bypasses, cost-control failures or unintended political profiling.

## Reporting

Use the repository's **Security → Report a vulnerability** facility if private vulnerability reporting is enabled. If it is unavailable, ask the repository maintainer for a private reporting channel without posting exploit details or personal data publicly. No dedicated security email or response-time guarantee has been established for this MVP.

Include the affected commit, reproducible steps, expected and observed behaviour, impact and a minimal sanitised example. Do not include live tokens, private screenshots or real people's sensitive information. Do not test against other users, disrupt a deployed service or run paid-provider load tests without the operator's authorisation.

## Implemented boundaries and limits

- Requests are same-origin JSON with schema and size checks; provider credentials stay on the Worker.
- Live paid calls require configuration and a rate-limit binding. The binding reduces request volume; it is not a complete budget cap or identity system.
- Model output is validated and evidence references must resolve. Model summaries and citations still require editorial scrutiny.
- KEO has no prompt, image or investigation database. Gateway request logging and caching are disabled by request headers, and Responses storage is disabled in the payload. Infrastructure metadata and provider policies remain separate.
- UI text must be rendered as text, not trusted HTML. Screenshot metadata removal does not remove identifiers visible in the pixels.

The keyword civic guardrail is an additional control, not proof that every adversarial prompt is detected. Review model behaviour, dependency updates and abuse controls before a public release. The current development branch is the supported code line; no production support or historical-version policy is promised.
