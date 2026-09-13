# KEO on-device text reader

Tesseract.js 7.0.0 and tesseract.js-core 7.0.0 are Apache-2.0 licensed.
Their licence copies are included as TESSERACT-LICENSE and CORE-LICENSE.

English data comes from @tesseract.js-data/eng 1.0.0, specifically
4.0.0_best_int/eng.traineddata.gz (2,952,873 bytes).
The npm wrapper metadata says MIT; the trained-data source and upstream
tessdata_best are Apache-2.0. The data is not relicensed by KEO.

Sources:
- https://github.com/naptha/tesseract.js
- https://github.com/naptha/tesseract.js-core
- https://github.com/naptha/tessdata
- https://github.com/tesseract-ocr/tessdata_best

Assets are served from this Site and loaded only on request. The selected
LSTM wrapper embeds its WebAssembly; only one device-compatible variant
loads. Images stay in the browser worker, which is terminated after use.
