import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";
import type { GeoJSONSource, Map as CountyMap, Popup } from "maplibre-gl";
import {
  boundaryCountyName,
  countyNames,
  eventsForCounty,
} from "../lib/events";
import { evidence } from "../lib/repository";
import type { Event } from "../lib/schemas";

type CountyProperties = { shapeName: string; shapeISO: string };
type Boundaries = FeatureCollection<Polygon | MultiPolygon, CountyProperties>;
const kenyaBounds: [number, number, number, number] = [33.8, -4.8, 42, 5.5];

function recordFeatures(records: Event[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: records.map((record) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [record.location.lon, record.location.lat],
      },
      properties: { id: record.id, title: record.title },
    })),
  };
}

function initialiseMapPage(): void {
  const canvas = document.querySelector<HTMLElement>("#map-canvas");
  const filter = document.querySelector<HTMLSelectElement>("#county-filter");
  const status = document.querySelector<HTMLElement>("#map-status");
  const list = document.querySelector<HTMLElement>("#map-records");
  if (!canvas || !filter || !status || !list) return;

  let map: CountyMap | undefined;
  let popup: Popup | undefined;
  let boundaries: Boundaries | undefined;
  let ready = false;
  let unavailable = false;
  let openRecord: ((record: Event) => void) | undefined;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (filter.options.length < 2) {
    filter.replaceChildren(new Option("All counties", ""));
    countyNames.forEach((county) => filter.add(new Option(county, county)));
  }

  function selectedRecords(): Event[] {
    return eventsForCounty(filter!.value);
  }

  function updateStatus(): void {
    const count = selectedRecords().length;
    const area = filter!.value || "Kenya";
    const mapState = unavailable
      ? "Interactive map unavailable. Use the evidence list below."
      : ready
        ? "47 county boundaries loaded."
        : "Interactive map loads when visible.";
    status!.textContent = `${mapState} ${count} illustrative ${count === 1 ? "record" : "records"} for ${area}. No current incidents are displayed.`;
  }

  function renderRecords(): void {
    const fragment = document.createDocumentFragment();
    const records = selectedRecords();
    if (!records.length) {
      const item = document.createElement("li");
      item.textContent =
        "No curated records for this county. An empty list does not establish that no events occurred.";
      fragment.append(item);
    }
    for (const record of records) {
      const item = document.createElement("li");
      const details = document.createElement("details");
      details.id = `record-${record.id}`;
      const summary = document.createElement("summary");
      summary.textContent = `Illustrative only · ${record.location.county}: ${record.title}`;
      const description = document.createElement("p");
      description.textContent = record.description;
      const assessment = document.createElement("p");
      assessment.textContent = `National context anchored for demonstration. Status: unverified; confidence: unknown. Source publication date: ${record.timestamp}.`;
      const links = document.createElement("p");
      links.append(document.createTextNode("Evidence: "));
      record.evidenceIds.forEach((id, index) => {
        const source = evidence.find((entry) => entry.id === id);
        if (!source) return;
        if (index) links.append(document.createTextNode(" · "));
        const link = document.createElement("a");
        link.href = source.url;
        link.textContent = `${source.publisher} — ${source.title}`;
        links.append(link);
      });
      details.append(summary, description, assessment, links);
      if (ready) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `Show ${record.location.county} demo pin on map`;
        button.addEventListener("click", () => {
          map?.easeTo({
            center: [record.location.lon, record.location.lat],
            zoom: 7,
            duration: reducedMotion ? 0 : 500,
          });
          openRecord?.(record);
          canvas!.scrollIntoView({
            behavior: reducedMotion ? "instant" : "smooth",
            block: "nearest",
          });
        });
        details.append(button);
      }
      item.append(details);
      fragment.append(item);
    }
    list!.replaceChildren(fragment);
    updateStatus();
  }

  function fitCounty(): void {
    if (!map || !ready || !boundaries) return;
    const county = boundaryCountyName(filter!.value);
    const feature = boundaries.features.find(
      (item) => item.properties.shapeName === county,
    );
    const bounds: [number, number, number, number] = [...kenyaBounds];
    if (feature) {
      const polygons =
        feature.geometry.type === "Polygon"
          ? [feature.geometry.coordinates]
          : feature.geometry.coordinates;
      const positions = polygons.flat(2);
      bounds[0] = Math.min(...positions.map((position) => position[0]!));
      bounds[1] = Math.min(...positions.map((position) => position[1]!));
      bounds[2] = Math.max(...positions.map((position) => position[0]!));
      bounds[3] = Math.max(...positions.map((position) => position[1]!));
    }
    map.fitBounds(bounds, {
      padding: 28,
      maxZoom: 9,
      duration: reducedMotion ? 0 : 500,
    });
    map.setPaintProperty(
      "counties-fill",
      "fill-color",
      county
        ? ["case", ["==", ["get", "shapeName"], county], "#6eac9d", "#dce6dd"]
        : "#dce6dd",
    );
    (map.getSource("records") as GeoJSONSource).setData(
      recordFeatures(selectedRecords()),
    );
  }

  filter.addEventListener("change", () => {
    popup?.remove();
    renderRecords();
    fitCounty();
  });
  renderRecords();

  async function loadMap(): Promise<void> {
    status!.textContent =
      "Loading the county map. Evidence records are available below.";
    try {
      const [
        { Map, NavigationControl, AttributionControl, Popup: MapPopup },
        ,
        response,
      ] = await Promise.all([
        import("maplibre-gl"),
        import("maplibre-gl/dist/maplibre-gl.css"),
        fetch("/data/counties.geojson"),
      ]);
      if (!response.ok) throw new Error("County data unavailable");
      const data = (await response.json()) as Boundaries;
      if (data.type !== "FeatureCollection" || data.features.length !== 47)
        throw new Error("Invalid county data");
      boundaries = data;
      map = new Map({
        container: canvas!,
        bounds: kenyaBounds,
        fitBoundsOptions: { padding: 28 },
        minZoom: 4,
        maxZoom: 12,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        scrollZoom: false,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: "background",
              type: "background",
              paint: { "background-color": "#f6f3eb" },
            },
          ],
        },
      });
      map.addControl(
        new NavigationControl({ showCompass: false }),
        "top-right",
      );
      map.addControl(
        new AttributionControl({
          compact: true,
          customAttribution: "geoBoundaries / RCMRD · Public Domain · 2020",
        }),
      );
      map.on("error", () => {
        unavailable = true;
        updateStatus();
      });
      openRecord = (record) => {
        if (!map) return;
        popup?.remove();
        const panel = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = `${record.location.county} · illustrative only`;
        const context = document.createElement("p");
        context.textContent =
          "National constitutional context. This pin does not represent a local incident.";
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Read evidence and context";
        button.addEventListener("click", () => {
          const details = document.getElementById(
            `record-${record.id}`,
          ) as HTMLDetailsElement | null;
          if (!details) return;
          popup?.remove();
          details.open = true;
          details.querySelector("summary")?.focus();
          details.scrollIntoView({
            behavior: reducedMotion ? "instant" : "smooth",
            block: "nearest",
          });
        });
        panel.append(title, context, button);
        popup = new MapPopup({ maxWidth: "260px" })
          .setLngLat([record.location.lon, record.location.lat])
          .setDOMContent(panel)
          .addTo(map);
      };
      map.on("load", () => {
        if (!map) return;
        map.addSource("counties", { type: "geojson", data: data });
        map.addLayer({
          id: "counties-fill",
          type: "fill",
          source: "counties",
          paint: { "fill-color": "#dce6dd", "fill-opacity": 0.94 },
        });
        map.addLayer({
          id: "counties-outline",
          type: "line",
          source: "counties",
          paint: { "line-color": "#688073", "line-width": 1 },
        });
        map.addSource("records", {
          type: "geojson",
          data: recordFeatures(selectedRecords()),
        });
        map.addLayer({
          id: "records-point",
          type: "circle",
          source: "records",
          paint: {
            "circle-color": "#0b655b",
            "circle-radius": 9,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        });
        map.on("click", "records-point", (event) => {
          const id: unknown = event.features?.[0]?.properties.id;
          const record = selectedRecords().find((item) => item.id === id);
          if (record) openRecord?.(record);
        });
        map.on("mouseenter", "records-point", () => {
          if (map) map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "records-point", () => {
          if (map) map.getCanvas().style.cursor = "";
        });
        ready = true;
        unavailable = false;
        renderRecords();
        fitCounty();
      });
    } catch {
      unavailable = true;
      ready = false;
      map?.remove();
      map = undefined;
      renderRecords();
    }
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void loadMap();
      },
      { rootMargin: "160px" },
    );
    observer.observe(canvas);
  } else {
    void loadMap();
  }
}

initialiseMapPage();
