export function GET() {
  return new Response(
    "User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://keo-observatory.mossy-wren-4073.chatgpt.site/sitemap.xml\n",
  );
}
