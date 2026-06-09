 "use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getLatestBlogs } from "@/api/blog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const BLOG_FALLBACK_IMAGES = [
  "/images/blog/blog-1.jpg",
  "/images/blog/blog-2.jpg",
  "/images/blog/blog-3.jpg",
];

const getFallbackBlogImage = (seed = 0) =>
  BLOG_FALLBACK_IMAGES[Math.abs(Number(seed) || 0) % BLOG_FALLBACK_IMAGES.length];

const resolveImageSrc = (image, fallback = "/images/blog/blog-1.jpg") => {
  if (!image || typeof image !== "string") return fallback;
  const t = image.trim();
  if (!t) return fallback;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/images/blog/")) return t;
  if (t.startsWith("/images/")) return fallback;
  if (t.startsWith("/")) return `${API_BASE_URL}${t}`;
  return `${API_BASE_URL}/${t}`;
};

const formatSidebarDate = (post) => {
  const d = post?.date || {};
  if (d?.day || d?.month || d?.year) {
    return {
      day: d.day || "",
      month: d.month || "",
      year: d.year || "",
    };
  }

  const createdAt = post?.createdAt || post?.publishedAt || post?.updatedAt;
  if (!createdAt) return { day: "", month: "", year: "" };

  const dt = new Date(createdAt);
  if (Number.isNaN(dt.getTime())) return { day: "", month: "", year: "" };

  return {
    day: String(dt.getDate()),
    month: dt.toLocaleString("en-US", { month: "short" }),
    year: String(dt.getFullYear()),
  };
};

const LatestPost = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const res = await getLatestBlogs();

        const normalized = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];

        if (!cancelled) setLatestPosts(normalized.slice(0, 3));
      } catch {
        if (!cancelled) setLatestPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const postsToRender = useMemo(() => latestPosts || [], [latestPosts]);

  return (
    <div className="sidebar-widget mb30">
      <h6 className="widget-title">Latest Posts</h6>
      {loading ? (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="list-news-style d-flex align-items-center mt20 mb20"
              key={`placeholder-${index}`}
              style={{ opacity: 0.6 }}
            >
              <div className="news-img flex-shrink-0">
                <Image
                  width={90}
                  height={80}
                  src="/images/blog/blog-1.jpg"
                  alt="blog"
                />
              </div>
              <div className="news-content flex-shrink-1 ms-3">
                <p className="new-text mb0 fz14">Loading...</p>
                <a className="body-light-color" href="#">
                  &nbsp;
                </a>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {postsToRender.map((post, index) => {
            const { day, month, year } = formatSidebarDate(post);
            const text =
              post?.content || post?.excerpt || post?.text || post?.title || "";

            return (
              <div
                className="list-news-style d-flex align-items-center mt20 mb20"
                key={post?._id || post?.id || post?.slug || index}
              >
                <div className="news-img flex-shrink-0">
                  <Image
                    width={90}
                    height={80}
                    src={resolveImageSrc(post?.image || post?.coverImage, getFallbackBlogImage(index))}
                    alt={post?.title || "Latest blog article"}
                  />
                </div>
                <div className="news-content flex-shrink-1 ms-3">
                  <p className="new-text mb0 fz14">
                    <Link href={`/blog/${post.slug}`}>
                      {text}
                    </Link>
                  </p>
                  <a className="body-light-color" href="#">
                    {day} {month}, {year}
                  </a>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default LatestPost;
