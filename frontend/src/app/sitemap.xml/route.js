export async function GET() {
  const baseUrl = String(process.env.NEXT_PUBLIC_SITE_URL || 'https://jameenwallah.akoodedemo.com').replace(/\/+$/, "");
  
  const createSitemap = (loc, lastmod = new Date().toISOString()) => `
    <sitemap>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
    </sitemap>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${createSitemap(`${baseUrl}/sitemap-properties.xml`)}
    ${createSitemap(`${baseUrl}/sitemap-blogs.xml`)}
    ${createSitemap(`${baseUrl}/sitemap-pages.xml`)}
    ${createSitemap(`${baseUrl}/sitemap-propertypage.xml`)}
  </sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
