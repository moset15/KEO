# County map data and records

The map ships with all 47 Kenyan first-level administrative boundaries and three explicitly illustrative records. It contains no current incident feed. Empty counties mean that this seed has no record there; they do not establish that no events occurred.

## Boundary provenance

- Publisher: geoBoundaries; source credited by its metadata: RCMRD.
- Dataset: `gbOpen`, Kenya (`KEN`), `ADM1`, simplified GeoJSON.
- Boundary year stated by the metadata: 2020.
- Licence stated by the metadata: Public Domain. The repository's MIT licence applies to code, not third-party data.
- Retrieved: 12 September 2026.
- Metadata: <https://www.geoboundaries.org/api/current/gbOpen/KEN/ADM1/>.
- Pinned download: <https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/KEN/ADM1/geoBoundaries-KEN-ADM1_simplified.geojson>.
- Local file: `public/data/counties.geojson`; 47 features, 861,584 bytes before HTTP compression.

The upstream file is preserved without geometry or property edits. The UI displays upstream `Tharaka` as `Tharaka-Nithi`; filtering maps this display alias back to the source name. County boundaries provide geographic context, not authoritative electoral ward or constituency boundaries. They should not be used to decide jurisdictional disputes.

No external map tiles, fonts or geocoding services are requested. MapLibre and the county file load when the map approaches the viewport. The hosting layer can compress the GeoJSON for transfer. The county selector and evidence list work independently of WebGL, and the initial list is rendered as HTML.

## Illustrative record policy

`data/events/seed.json` contains three demo anchors: Nairobi, Mombasa and Kisumu. Every record has `isDemo: true`, `status: unverified`, `confidence: unknown` and the known evidence reference `keo-e-constitution-101`. The referenced Constitution is national legal context, not evidence of county-specific activity. Coordinates demonstrate navigation only. Each timestamp is the source publication date, 27 August 2010, and is explicitly labelled as such.

These records must not appear in an incident count, live ticker, current-event claim or alert. The seed loader rejects non-demo records and unknown evidence IDs. Replacing this seed with real observations requires a separately reviewed provenance, refresh and correction workflow.

## Page integration

Import `events` and `countyNames` from `src/lib/events.ts` for the static initial HTML. Include a labelled `select#county-filter`, with an empty value for all counties and one option per county; `div#map-canvas` with an explicit responsive height; a polite live region `#map-status`; and `ul#map-records` with server-rendered evidence details. Include the bundled `src/scripts/map.ts` only on the Map route.

The client updates the list using DOM text nodes, filters records and county fill together, zooms to the selected county, and opens evidence context from either map pins or list controls. It honours reduced motion, leaves wheel scrolling available to the page and provides standard keyboard map controls. Map errors leave the filter and evidence list available.
