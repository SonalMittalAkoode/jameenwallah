export async function GET() {
  const baseUrl = String(process.env.NEXT_PUBLIC_SITE_URL || 'https://jameenwallah.akoodedemo.com').replace(/\/+$/, "");
  
  const createUrl = (path, changefreq = 'weekly', priority = '0.8') => `
    <url>
      <loc>${baseUrl}/${String(path).replace(/^\/+/, "")}</loc>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;

  let allBlogs = [];
  try {
    const apiBase = String(process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
    if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
    const resblog = await fetch(`${apiBase}/frontend/api/blogs/all?limit=10000&skip=1`, {
      next: { revalidate: 3600 }
    });
    // if (resblog.ok) {
    // console.log("Fetched blogs for sitemap with status:", resblog);
      const blogData = await resblog.json();
      allBlogs = Array.isArray(blogData) ? blogData : (blogData?.data || []);
    // }
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${createUrl('blogs', 'weekly', '0.8')}
    ${allBlogs?.filter(item => item?.slug).map(item => 
      createUrl(`blog/${item.slug}`)
    ).join('')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
