import {getActiveCategories} from "@/api/category";
import {getAllAreasFrontend} from "@/api/area";
import {getAllPropertiesFrontend} from "@/api/property";
import {getAllCitiesFrontend} from "@/api/city";
import { slugify } from "@/lib/listingPath";

const getSiteUrl = () =>
  String(process.env.NEXT_PUBLIC_SITE_URL || "https://jameenwallah.akoodedemo.com").replace(/\/+$/, "");

const getArray = (data) => Array.isArray(data) ? data : (data?.data || data?.items || []);

const safeFetch = async (fetcher, fallback = []) => {
  try {
    return await fetcher();
  } catch (error) {
    console.warn("Sitemap properties fetch failed:", error?.message || error);
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
  
  const [categories, cities, locations, properties] = await Promise.all([
    safeFetch(() => getActiveCategories()),
    safeFetch(() => getAllCitiesFrontend(filter)),
    safeFetch(() => getAllAreasFrontend(filter)),
    safeFetch(() => getAllPropertiesFrontend(filter)),
  ]);

  // console.log("Sitemap Data:")
  // console.log("Sitemap Data:", {
  //   categories: getArray(categories),
  //   cities: getArray(cities),
  //   locations: getArray(locations),
  //   properties: getArray(properties)
  // });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${getArray(properties.items || properties).map(item => 
      item?.description?.slug ? createUrl(`property/${item?.description?.slug}`) : ''
    ).join('')}
    ${getArray(locations.data || locations).map(item => 
      item?.name ? createUrl(`location/${slugify(item?.name)}`) : ''
    ).join('')}
    ${getArray(cities.data || cities).map(item => 
      item?.name ? createUrl(`city/${slugify(item?.name)}`) : ''
    ).join('')}
    ${getArray(categories).map(item => 
      item?.slug ? createUrl(`category/${item?.slug}`) : ''
    ).join('')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
