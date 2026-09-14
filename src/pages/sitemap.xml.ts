import threats from "../../data/threats/taxonomy.json";
import documentation from "../../data/documentation.json";
export function GET() {
  const routes = [
    "",
    "ask",
    "investigate",
    "verify",
    "map",
    "threats",
    "sources",
    "about",
    "intelligence",
    "methodology",
    ...documentation.map((doc) => "methodology/" + doc.slug),
    ...threats.map((t) => "threats/" + t.id.toLowerCase()),
  ];
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      routes
        .map(
          (p) =>
            "<url><loc>https://keo-observatory.nya-onmoseti.chatgpt.site/" +
            p +
            (p ? "/" : "") +
            "</loc></url>",
        )
        .join("") +
      "</urlset>",
    { headers: { "Content-Type": "application/xml" } },
  );
}
