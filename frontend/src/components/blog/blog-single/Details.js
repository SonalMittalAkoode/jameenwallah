import Image from 'next/image';
import React from 'react'
import ContactForm from "@/components/pages/contact/Form";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const resolveImageSrc = (image) => {
  if (!image || typeof image !== "string") return null;
  const t = image.trim();
  if (!t) return null;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/images/blog/")) return t;
  if (t.startsWith("/images/")) return null;
  if (t.startsWith("/")) return `${API_BASE}${t}`;
  return `${API_BASE}/${t}`;
};

const formatDate = (data) => {
  const month = data?.date?.month;
  const day = data?.date?.day;
  const year = data?.date?.year;
  if (month || day) {
    return `${month || ""} ${day || ""}, ${year || 2022}`.trim();
  }

  const createdAt = data?.createdAt || data?.publishedAt;
  if (!createdAt) return `${2022}`;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return `${2022}`;

  return `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}, ${d.getFullYear()}`;
};

export default function Details({ blog }) {
  const data = blog || {};

  const heroSrc = resolveImageSrc(data?.image) || "/images/blog/blog-single-1.jpg";
  const dateText = formatDate(data);
  const categoryText =
    data?.blogCategory?.title ||
    data?.category?.title ||
    data?.category ||
    "Uncategorized";
  return (
    <div className="container">
      <div className="row g-4 g-xl-5">
        {/* Left Column: Blog Content */}
        <div className="col-lg-8">
          <div className="row" data-aos="fade-up" data-aos-delay="100">
            <div className="col-lg-12">
              <h2 className="blog-title">
                {data.title || data.content || "Blog Details"}
              </h2>
              <div className="blog-single-meta">
                <div className="post-author d-sm-flex align-items-center">
                  <span className="pr15 bdrr1">{categoryText}</span>
                  <span className="ml15">{dateText}</span>
                </div>
              </div>
            </div>
          </div>
          {/* End Title & Meta */}

          <div className="mt60" data-aos="fade-up" data-aos-delay="300">
            <div className="blog-detail-hero">
              <Image
                width={1200}
                height={300}
                priority
                className="w-100 h-auto contain rounded-3"
                src={heroSrc}
                alt="blog"
              />
            </div>
          </div>
          {/* End Hero Image */}

          <div className="row" data-aos="fade-up" data-aos-delay="500">
            <div className="col-lg-12">
              <div
                className="ui-content mt40 mb60 blog-detail-content"
                dangerouslySetInnerHTML={{
                  __html:
                    data.description ||
                    "<p>No blog content is available for this article.</p>",
                }}
              />
            </div>
          </div>
          {/* End Content Body */}
        </div>

        {/* Right Column: Sidebar Enquiry Form */}
        <div className="col-lg-4">
          <div className="blog-sidebar" style={{ position: "sticky", top: "120px", zIndex: 5 }}>
            <div className="sidebar-widget mb30 pb20 bdrs12 p-4 bgc-white">
              <h6 className="widget-title mb20">Inquiry</h6>
              <ContactForm source="blog-details" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Restore Rich Text Formatting that gets stripped by UI reset frameworks */}
      <style>{`
        .blog-detail-content ul {
          list-style: disc !important;
          padding-left: 2.5rem !important;
          margin-bottom: 1rem !important;
        }
        .blog-detail-content ol {
          list-style: decimal !important;
          padding-left: 2.5rem !important;
          margin-bottom: 1rem !important;
        }
        .blog-detail-content li {
          margin-bottom: 0.5rem !important;
          display: list-item !important;
          list-style: inherit !important;
        }
        .blog-detail-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }
        .blog-detail-content table, 
        .blog-detail-content th, 
        .blog-detail-content td {
          border: 1px solid #ddd;
        }
        .blog-detail-content th, 
        .blog-detail-content td {
          padding: 12px;
          text-align: left;
        }
        .blog-detail-content th {
          background-color: #f7f7f7;
          font-weight: 600;
        }
        .blog-detail-content p {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
