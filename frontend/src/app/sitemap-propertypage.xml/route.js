import {getLimitedPropertyPages} from "@/api/propertyPage";

const getSiteUrl = () =>
  String(process.env.NEXT_PUBLIC_SITE_URL || "https://jameenwallah.akoodedemo.com").replace(/\/+$/, "");

const getArray = (data) => Array.isArray(data) ? data : (data?.data || data?.items || []);

const safeFetch = async (fetcher, fallback = []) => {
  try {
    return await fetcher();
  } catch (error) {
    console.warn("Sitemap property pages fetch failed:", error?.message || error);
    return fallback;
  }
};

export async function GET() {
  const baseUrl = getSiteUrl();
  
  const createUrl = (path, changefreq = 'weekly', priority = '0.8') => `
    <url>
      <loc>${baseUrl}/${String(path).replace(/^\/+/, "")}</loc>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;

  const filter = { limit: 10000, page: 1 };
  
  const [propertypage] = await Promise.all([
    safeFetch(() => getLimitedPropertyPages(10000))
  ]);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
    ${getArray(propertypage).map(item => 
      item?.slug ? createUrl(`propertypage/${item.slug}`) : ''
    ).join('')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
