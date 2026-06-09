import {getAllBuildersFrontend} from "@/api/builder";

const getSiteUrl = () =>
  String(process.env.NEXT_PUBLIC_SITE_URL || "https://jameenwallah.akoodedemo.com").replace(/\/+$/, "");

const getArray = (data) => Array.isArray(data) ? data : (data?.data || data?.items || []);

const safeFetch = async (fetcher, fallback = []) => {
  try {
    return await fetcher();
  } catch (error) {
    console.warn("Sitemap pages fetch failed:", error?.message || error);
    return fallback;
  }
};

export async function GET() {
  const baseUrl = getSiteUrl();
  
  const createUrl = (path, changefreq = 'monthly', priority = '0.8') => `
    <url>
      <loc>${baseUrl}/${String(path).replace(/^\/+/, "")}</loc>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;

  const builders = await safeFetch(getAllBuildersFrontend);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${createUrl('about', 'monthly', '0.6')}
    ${createUrl('contact', 'monthly', '0.8')}
    ${getArray(builders).map(item => 
      item?.slug ? createUrl(`builders/${item.slug}`) : ''
    ).join('')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
