# AI and zero-budget policy

Reviewed 13 September 2026. Quotas and account availability change; official links below are the reference. No provider entitlement has been tested for this project.

## Two-tier model strategy: Build-time vs Production

KEO maintains a strict operational distinction between the models used to engineer the software and the models used to serve public requests:

1. **Build-Time Fleet (Frontier Engineering):**
   - **Models:** **GPT-6 Astra** (via Codex & ChatGPT Work) and **Gemini 3.8** (via Antigravity / Google Developer tooling).
   - **Role:** System architecture, codebase refactoring, security audits, test synthesis, prompt validation, and dataset curation.
   - **Cost profile:** Fixed developer workstation and subscription access. It incurs **KSh 0 in runtime API traffic costs**, allowing maximum model intelligence during engineering without financial exposure.

2. **Production Runtime Fleet (Cost-Effective & Zero-Budget):**
   - **Models:** **On-device Tesseract.js (WASM)**, **Native D1/SQLite**, with **Gemini 2.5 Flash / Flash-Lite** or **Cloudflare Workers AI (Llama 3.1 8B)** as production candidate models.
   - **Role:** Anonymous citizen queries, claim decomposition, on-device OCR, and deterministic source matching.
   - **Cost profile:** Zero or near-zero per-request cost. Ensures KEO remains permanently resilient against traffic spikes (such as Product Hunt launches or election news cycles) without credit exhaustion.

## Recommended approach

Launch useful evidence navigation without paid inference. Curated retrieval, source cards, threats and county filtering do not need a language model. KEO explicitly disables paid calls by default. New claims stay unverified when evidence is insufficient; a zero-cost service must not invent research.

The screenshot flow uses self-hosted [Tesseract.js OCR](https://github.com/naptha/tesseract.js) on the device, followed by editable text review and curated evidence lookup. No LLM is used and screenshot pixels are not uploaded. It loads only on demand, with a manual alternative. OCR reads text, not authenticity. The initial English reader downloads roughly 4.5 MB when HTTP compression is available; hosting and mobile-data costs are separate. Remote vision remains disabled.

## Models we could connect later

| Option                          | Useful role                                   | Constraint                                   | KEO status                                 |
| ------------------------------- | --------------------------------------------- | -------------------------------------------- | ------------------------------------------ |
| Curated retrieval + manual text | Known questions, source checks                | Small editorial catalogue, not live research | Implemented; no AI API calls               |
| Browser OCR                     | Screenshot transcription                      | Downloads and device work                    | Implemented, on-device; no LLM             |
| Gemini 2.5 Flash / Flash-Lite   | Public-text extraction and grounded summaries | Quotas and unpaid-service data terms         | Evaluated, not connected                   |
| Workers AI                      | Bounded classification or summaries           | Compute allowance; retrieval separate        | Evaluated, not connected                   |
| OpenAI model / Astra            | Complex synthesis and vision                  | Metered API/tools; approved budget required  | Adapter implemented; live untested and off |

Gemini pricing currently lists free-tier input/output for 2.5 Flash and Flash-Lite, with up to 500 daily Google Search grounding requests shared between them. Inference quotas are separate and account-specific. Newer versions do not necessarily include free grounding. [Pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

Google unpaid-service terms permit product improvement and human review and prohibit submitting sensitive, confidential or personal information. Unrestricted WhatsApp screenshots are a poor fit. Any experiment should use deliberately selected public text after a privacy decision. [Terms](https://ai.google.dev/gemini-api/terms).

Workers AI provides 10,000 free neurons daily, resetting at 00:00 UTC: a compute allowance, not a fixed number of investigations. Workers Free requests fail after quota; some larger models require a paid plan. [Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [model restrictions](https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/).

Cloudflare AI Gateway’s free controls do not cover upstream inference costs. [Gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/).

Browser language models are not the universal baseline. [WebLLM](https://webllm.mlc.ai/docs/user/get_started.html) needs WebGPU, substantial downloads and capable hardware. Do not impose it on low-end phones to claim “free AI”.

## Must we use Astra 6?

**No. GPT-6 Astra is not required.** In KEO, paid inference is disabled by default (`AI_ENABLED=false`).

1. **Subscription vs API access:** A ChatGPT Pro or Student Pro subscription provides access to ChatGPT in the web, desktop, and Work interface; it does **not** grant unlimited free API credits for background application inference in a hosted Site. Running Astra via programmatic API or tool calls incurs metered usage billed against an OpenAI platform account.
2. **Cost risk:** Using a large frontier model for continuous public traffic on Product Hunt would quickly exhaust credits or generate unexpected costs if traffic spikes.
3. **Overkill for core tasks:** Claim decomposition, structured keyword extraction, and evidence matching do not require a massive multimodal frontier model. Small specialized models and deterministic pipelines perform these tasks faster, cheaper, and more reliably.

## Which models can do the function better and cheaper?

If external inference is ever optionally connected with an approved budget, several alternative models provide superior cost-to-performance tradeoffs:

| Provider & Model | Role & Strength | Free Tier & Pricing | Privacy & Tradeoffs |
| ---------------- | --------------- | ------------------- | ------------------- |
| **On-device Tesseract.js (Active)** | Screenshot transcription | 100% free; 0 API calls; runs in browser WASM | Maximum privacy; sensitive WhatsApp screenshots never leave the device. |
| **Curated D1 / SQLite (Active)** | Evidence matching & threat tagging | Included in native Sites hosting; 0 AI cost | High precision; no hallucinations; deterministic sources. |
| **Google Gemini 2.5 Flash / Flash-Lite** | Fast claim decomposition & live web grounding | Free tier on Google AI Studio (up to 15 RPM, 1M TPM, 500 daily Google Search grounding queries) | Best free search grounding option. Unpaid tier allows human review/training, so unredacted private messages must not be submitted. |
| **Cloudflare Workers AI (Llama 3.1 8B)** | Structured extraction & classification | 10,000 free neurons daily (~hundreds of requests/day at 0 cost) | Runs directly at edge in the Workers runtime; no egress latency. Bounded by daily compute allowance. |
| **Groq (Llama 3.1 8B / 70B)** | Sub-second extraction & Kiswahili reasoning | Free tier with high rate limits (RPM/TPM) | Extremely fast (~500 tokens/sec), but requires external API key management. |
| **OpenAI Astra / GPT-4o** | Complex multimodal reasoning & synthesis | Metered pay-per-token API; no free tier | Highest capability, but requires an active funded account and hard billing caps. |

## The zero-spend approach: How KEO spends KSh 0 on AI

To maintain complete independence and zero operating bills, KEO implements a **four-pillar zero-spend architecture**:

1. **On-Device Local OCR:** Instead of paying for cloud vision APIs, screenshots are processed entirely in the user's browser using Tesseract.js compiled to WebAssembly. The image pixels never leave the phone or laptop.
2. **Native Deterministic Search:** KEO matches extracted claims against vetted Kenyan election datasets (IEBC regulations, Kenya Law statutes, gazette notices, and verified fact-checks from PesaCheck and Africa Check) stored locally in SQLite/D1.
3. **Structured Research Assist:** When a claim is not yet in the curated catalogue, KEO generates direct deep-links to official public archives and fact-checkers alongside an investigative checklist, instead of paying an LLM to guess.
4. **Honest Uncertainty:** If a claim cannot be verified against verified public records, KEO returns "Unverified" or "Insufficient Evidence" with clear gaps, rather than paying an AI model to hallucinate certainty.

## Quality and spending gates

No model is “better than Astra” without a KEO-specific evaluation. Test citations, source independence, hallucinations, uncertainty, English/Kiswahili quality, adversarial prompts, latency and retrieval-plus-model cost. Choose the smallest model meeting the task’s requirements. Human review remains necessary for sensitive public attribution.

Before remote AI: get budget/provider approval, test a real complete request, set provider spend controls, prohibit automatic paid fallback, bound requests/output, rate-limit users, stop at quota and document processing terms. Distinguish curated from live results. A ChatGPT subscription is not blanket API credit.

With a budget of KSh 0, keep `AI_ENABLED` unset or `false`. Free tiers may support experiments; the product must still work when they are exhausted or withdrawn. Zero AI API billing does not mean unlimited free hosting, data or electricity.
