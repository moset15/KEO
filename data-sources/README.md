# Sources and third-party data terms

The MIT licence covers KEO's code and original associated documentation. It does not relicense external publications, maps, images or provider output. Public access is not permission to redistribute. Keep source-specific terms and attribution with imported data.

`data/sources/registry.json` records source ID, publisher URL, category, trust level, licence note, redistribution permission, API availability, intended refresh frequency and notes. A null permission or API value means unknown, not granted or available. A refresh frequency is a maintenance intention; the MVP has no scheduled ingestion process.

| Material                                         | MVP use                                                                | Terms and limitations                                                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Kenya Law Constitution                           | One short paraphrased Article 101 background record with original link | Check individual document terms; not evidence of a current announcement                                             |
| IEBC                                             | Registry and source-check destination                                  | Publisher terms; linked material is not bundled as a feed                                                           |
| Africa Check and PesaCheck                       | Registry and fact-check destinations                                   | Publisher terms; no bulk article redistribution                                                                     |
| OpenAI, Anthropic and Meta research              | Source directories for research context                                | Publisher terms; no specific report or Kenya finding implied                                                        |
| geoBoundaries / RCMRD Kenya ADM1                 | Locally served 47-county boundary file                                 | Source metadata states Public Domain; retain geoBoundaries attribution and its stated CC BY 4.0 attribution context |
| Threat definitions and map demonstration records | KEO-authored reference content and illustrative examples               | No observed incidents or current results represented                                                                |

The boundary source, pinned upstream download, retrieval date and geometry limitations are documented in [map-data.md](../docs/map-data.md). Source metadata states a 2020 boundary year; this is geographic reference geometry, not authoritative electoral boundaries. Preserve the upstream licence and attribution notes when redistributing the file.

The evidence catalogue also includes a short attributed paraphrase of Anthropic’s September 2026 Kenya case, linked to its original report. Its limitations are retained; KEO has not independently verified the operation.

Optional live search may yield links and model-generated summaries. Source pages are not mirrored; summaries may appear in temporarily saved private results under the privacy policy. They are not quotations unless expressly identified and do not automatically receive the code licence. Reputation and search citations do not remove the need to check the specific claim.

Before adding a source, record its exact terms, allowed use, attribution and API constraints. Link instead of copying when permission is unclear. Keep corrections in Git and preserve stable IDs. Any future ACLED, media, observer or citizen-report integration needs its own access and publication review before ingestion.

## On-device OCR

Tesseract.js and its core (7.0.0) are Apache-2.0. English trained data is the pinned @tesseract.js-data/eng 1.0.0 best-int file, 2,952,873 bytes compressed. Its npm wrapper metadata says MIT, but the [trained-data source](https://github.com/naptha/tessdata) and [upstream data licence](https://github.com/tesseract-ocr/tessdata_best/blob/main/LICENSE) are Apache-2.0. Preserve upstream rights and notices; do not describe the data as simply MIT. Public reader assets include licence copies and a provenance notice. They are served from KEO, not a third-party CDN. English OCR does not guarantee accurate transcription of mixed-language or poor-quality screenshots.
