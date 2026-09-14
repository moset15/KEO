# Device support and accessible access

KEO targets the widest practical access, not every device ever made. The lightweight Site remains the baseline for phones, tablets and desktops alongside optional future 3D.

## Current baseline

Static sources, methodology and threat pages are readable without JavaScript. Investigations and client-side filtering require it. The interactive 2D map needs WebGL, but its records/list remain available when graphics fail. Manually transcribe screenshots if decoding or remote extraction is unavailable.

Ask and Investigate expose screenshot and article/image URL inputs inside the form; Verify opens the screenshot picker by default. URL retrieval requires a connection and supports only listed public hosts. PDFs and blocked/private pages need manual copy or screenshot upload. Imported text and English OCR both require human correction; neither proves authenticity. Local and imported raster images are limited to 36 megapixels and 16,000 pixels per side; only the first animation frame is used.

Design starts at 360px with labelled controls, keyboard focus, readable text and written statuses. Kenyan flag colours communicate identity, not party alignment. Test 200% enlargement, keyboard access and horizontal overflow.

## Test matrix and targets

- Mobile: 360px and 390px. Actual Android Chrome and iOS Safari checks are required before public launch, not only desktop emulation.
- Tablet: 768px. Desktop: 1280px and 1440px.
- Reduced capability: no WebGL, JavaScript-disabled reading, reduced motion, interrupted requests and slow data.
- Performance target: largest contentful paint below two seconds on a documented throttled mobile profile. Report the measurement and limitations, not an unmeasured success.

Only Map loads geometry and graphics code; no external basemap is requested. OCR loads only on demand with a data-use warning and manual alternative. Its English reader is not guaranteed for mixed-language or poor-quality screenshots. Offline/PWA access is planned and needs visible stale-data dates.

## Full product and 3D

God’s Eye View is progressive enhancement, not a replacement. Every essential record/source must remain accessible through lists and 2D using the same filters. Detect unsupported graphics/context loss and retain a light-view switch. Do not load 3D assets on the light route. Respect reduced motion and keyboard access.

Benchmark representative low-end Kenyan phones before choosing defaults. A desktop demonstration does not prove universal support. Record tested devices and remaining gaps in the release review.
