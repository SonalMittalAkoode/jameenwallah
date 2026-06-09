import Details from "@/components/blog/blog-single/Details";
import Blog from "@/components/common/Blog";
import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const BLOG_SECTION_DESCRIPTION =
  "Latest real estate insights, investment tips, and market trends across Gurgaon, Noida, and Delhi NCR.";

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const fetchBlog = async (slugOrId) => {
  const encoded = encodeURIComponent(String(slugOrId || "").trim());
  if (!encoded) return null;
  const url = new URL(`/frontend/api/blogs/${encoded}`, API_BASE_URL);
  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) return null;
  const result = await response.json();
  return result?.data || null;
};

export async function generateMetadata(props) {
  const params = await props.params;
  const slugOrId = params?.slug;
  const blog = await fetchBlog(slugOrId);

  if (!blog) {
    return {
      title: "Blog | JameenWallah Real Estate Insights",
      description: BLOG_SECTION_DESCRIPTION,
    };
  }

  const title =
    blog.metaTitle ||
    `${blog.title || "Blog"} | JameenWallah Real Estate Insights`;
  const description =
    blog.metaDescription ||
    stripHtml(blog.description).slice(0, 160) ||
    BLOG_SECTION_DESCRIPTION;

  return { title, description };
}

export default async function BlogSinglePage(props) {
  const params = await props.params;
  const slugOrId = params?.slug;

  const blog = await fetchBlog(slugOrId);
  if (!blog) notFound();

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <section className="our-blog pt50">
        <Details blog={blog} id={slugOrId} />
      </section>

      {/* ── Related Posts ── */}
      <section className="related-posts-section">
        <div className="container">

          {/* Header */}
          <div className="rp-header">
            
            <h2 className="rp-title">
              Related <em>Posts</em>
            </h2>
            <p className="rp-description">{BLOG_SECTION_DESCRIPTION}</p>
            
          </div>

          {/* Cards grid — Blog renders .rp-grid__col + .rp-card internally */}
          <div className="rp-row" data-aos="fade-up" data-aos-delay="200">
            <Blog />
          </div>

          {/* CTA */}
          <div className="rp-cta-wrap" data-aos="fade-up" data-aos-delay="300">
            <a href="/blogs" className="rp-cta-btn">
              View All Articles
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

        </div>
      </section>

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}