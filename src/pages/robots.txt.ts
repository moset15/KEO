export function GET() {
  return new Response(
    "User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://keo-observatory.nya-onmoseti.chatgpt.site/sitemap.xml\n",
  );
}
