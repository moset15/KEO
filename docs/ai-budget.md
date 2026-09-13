# AI and zero-budget policy

Reviewed 13 September 2026. Quotas and account availability change; official links below are the reference. No provider entitlement has been tested for this project.

## Recommended approach

Launch useful evidence navigation without paid inference. Curated retrieval, source cards, threats and county filtering do not need a language model. KEO explicitly disables paid calls by default. New claims stay unverified when evidence is insufficient; a zero-cost service must not invent research.

Today, preview/redact screenshots locally and type or paste the claim into Investigate. Remote vision remains disabled. The next enhancement is on-device [Tesseract.js OCR](https://github.com/naptha/tesseract.js) with editable text review and evidence lookup. It is planned, not implemented. OCR reads text, not authenticity. Self-host assets to keep images on-device, load only on demand and retain manual entry on older phones.

## Models we could connect later

| Option                          | Useful role                                   | Constraint                                   | KEO status                                 |
| ------------------------------- | --------------------------------------------- | -------------------------------------------- | ------------------------------------------ |
| Curated retrieval + manual text | Known questions, source checks                | Small editorial catalogue, not live research | Implemented; no AI API calls               |
| Browser OCR                     | Screenshot transcription                      | Downloads and device work                    | Planned                                    |
| Gemini 2.5 Flash / Flash-Lite   | Public-text extraction and grounded summaries | Quotas and unpaid-service data terms         | Evaluated, not connected                   |
| Workers AI                      | Bounded classification or summaries           | Compute allowance; retrieval separate        | Evaluated, not connected                   |
| OpenAI model / Astra            | Complex synthesis and vision                  | Metered API/tools; approved budget required  | Adapter implemented; live untested and off |

Gemini pricing currently lists free-tier input/output for 2.5 Flash and Flash-Lite, with up to 500 daily Google Search grounding requests shared between them. Inference quotas are separate and account-specific. Newer versions do not necessarily include free grounding. [Pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

Google unpaid-service terms permit product improvement and human review and prohibit submitting sensitive, confidential or personal information. Unrestricted WhatsApp screenshots are a poor fit. Any experiment should use deliberately selected public text after a privacy decision. [Terms](https://ai.google.dev/gemini-api/terms).

Workers AI provides 10,000 free neurons daily, resetting at 00:00 UTC: a compute allowance, not a fixed number of investigations. Workers Free requests fail after quota; some larger models require a paid plan. [Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [model restrictions](https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/).

Cloudflare AI Gateway’s free controls do not cover upstream inference costs. [Gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/).

Browser language models are not the universal baseline. [WebLLM](https://webllm.mlc.ai/docs/user/get_started.html) needs WebGPU, substantial downloads and capable hardware. Do not impose it on low-end phones to claim “free AI”.

## Quality and spending gates

No model is “better than Astra” without a KEO-specific evaluation. Test citations, source independence, hallucinations, uncertainty, English/Kiswahili quality, adversarial prompts, latency and retrieval-plus-model cost. Choose the smallest model meeting the task’s requirements. Human review remains necessary for sensitive public attribution.

Before remote AI: get budget/provider approval, test a real complete request, set provider spend controls, prohibit automatic paid fallback, bound requests/output, rate-limit users, stop at quota and document processing terms. Distinguish curated from live results. A ChatGPT subscription is not blanket API credit.

With a budget of KSh 0, keep AI_ENABLED unset or false. Free tiers may support experiments; the product must still work when they are exhausted or withdrawn. Zero AI API billing does not mean unlimited free hosting, data or electricity.
