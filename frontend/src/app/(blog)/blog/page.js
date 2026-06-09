import Blog from "@/components/blog/blog-list/Blog";
import BlogSidebar from "@/components/blog/sidebar";
import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";
import { getAllBlogsPaginated } from "@/api/blog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

  export const metadata = {
    title: "Blog | JameenWallah Real Estate Insights",
    description:
      "Read Gurgaon, Noida, and Delhi NCR property insights, investment guides, and market updates from JameenWallah.",
  };

  export default async function BlogPage() {
    // Prefetch enough posts for the initial "7 blogs" view.
    const PAGE_LIMIT = 3; // must match the Blog component
    let initialBlogs = [];

    try {
      const [r1, r2, r3] = await Promise.all([
        getAllBlogsPaginated(1, PAGE_LIMIT),
        getAllBlogsPaginated(2, PAGE_LIMIT),
        getAllBlogsPaginated(3, PAGE_LIMIT),
      ]);

      const normalize = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        return [];
      };

      initialBlogs = [...normalize(r1), ...normalize(r2), ...normalize(r3)];
    } catch {
      initialBlogs = [];
    }

    return (
      <div className="bgc-f7">
        <DefaultHeader />
        <MobileMenu />

        <section className="breadcumb-section2 breadcumb-blog p-0">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="breadcumb-style1">
                  <h1 className="title">Blog</h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="our-blog pt-30">
          <div className="container">
          <div className="row mb20">
              <div className="col-lg-12">
                <div className="breadcumb-list">
                  <a href="/">Home</a>
                  <span className="title"> {'>'} </span>
                  <a href="/blog">Blog</a>
                </div>
              </div>
            </div>
            
            {/* Mobile Search - Shows only on small screens */}
            <div className="row d-lg-none mb-4">
              <div className="col-12">
                <BlogSidebar.MobileSearch />
              </div>
            </div>
            
            <div className="row blog-layout-wrapper" data-aos="fade-up" data-aos-delay="300">
              {/* Main Content */}
              <div className="col-lg-8 blog-main-content">
                <Blog initialBlogs={initialBlogs} />
              </div>

              {/* Sidebar - Hidden on mobile, shown on lg+ */}
              <div className="col-lg-4 blog-sidebar-wrapper d-none d-lg-block">
                <BlogSidebar />
              </div>
            </div>
          </div>
        </section>

        <section className="footer-style1 pt60 pb-0">
          <Footer />
        </section>
      </div>
    );
  }
