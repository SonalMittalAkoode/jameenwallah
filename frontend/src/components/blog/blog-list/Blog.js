 "use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { getAllBlogsPaginated } from "@/api/blog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const BLOG_FALLBACK_IMAGES = [
  "/images/blog/blog-1.jpg",
  "/images/blog/blog-2.jpg",
  "/images/blog/blog-3.jpg",
  "/images/blog/blog-4.jpg",
  "/images/blog/blog-5.jpg",
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

const formatMonthDay = (date, createdAt) => {
  const month = date?.month;
  const day = date?.day;
  if (month || day) return { month: month || "", day: day || "" };

  const fallback = createdAt || date;
  if (!fallback) return { month: "", day: "" };

  const d = new Date(fallback);
  if (Number.isNaN(d.getTime())) return { month: "", day: "" };

  return {
    month: d.toLocaleString("en-US", { month: "short" }),
    day: String(d.getDate()),
  };
};

const truncateWords = (text, wordLimit = 20) => {
  if (text === null || text === undefined) return "";
  const strippedText = String(text).replace(/<\/?[^>]+(>|$)/g, "");
  const s = strippedText.replace(/\s+/g, " ").trim();
  if (!s) return "";
  const words = s.split(" ");
  if (words.length <= wordLimit) return s;
  return `${words.slice(0, wordLimit).join(" ")}...`;
};

const BlogContent = ({ initialBlogs = [] }) => {
  const PAGE_LIMIT = 3; 
  const INITIAL_VISIBLE = 7;
  const INCREMENT = 3;

  const searchParams = useSearchParams();
  const searchQ = searchParams?.get("search") || "";
  const categoryQ = searchParams?.get("category") || "";
  const tagQ = searchParams?.get("tag") || "";

  // If there are search parameters, we ignore the predefined initialBlogs
  const hasQueryParams = Boolean(searchQ || categoryQ || tagQ);

  const [blogs, setBlogs] = useState(
    hasQueryParams ? [] : Array.isArray(initialBlogs) ? initialBlogs : []
  );
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [hasMore, setHasMore] = useState(!hasQueryParams && Array.isArray(initialBlogs) && initialBlogs.length > 0);
  const [loading, setLoading] = useState(hasQueryParams || !(Array.isArray(initialBlogs) && initialBlogs.length > 0));
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(hasQueryParams ? 1 : initialBlogs?.length ? 4 : 1);

  const normalizeBlogs = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const fetchPage = useCallback(
    async (page) => {
      const res = await getAllBlogsPaginated(page, PAGE_LIMIT, searchQ, categoryQ, tagQ);
      return normalizeBlogs(res);
    },
    [PAGE_LIMIT, searchQ, categoryQ, tagQ]
  );

  useEffect(() => {
    // If not using search parameters and we already have built-in initialBlogs, skip initial load
    if (!hasQueryParams && Array.isArray(initialBlogs) && initialBlogs.length > 0) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setHasMore(true);

        let page = 1;
        let accumulated = [];

        // Fetch just one page initially if using search params to prevent multiple waterfalls
        // Or 3 pages if it's the default loading mode
        const pagesToLoad = hasQueryParams ? 1 : 3;

        while (page <= pagesToLoad) {
          const items = await fetchPage(page);
          if (cancelled) return;
          if (!items?.length) {
            setHasMore(false);
            break;
          }
          accumulated = accumulated.concat(items);
          page += 1;
        }

        setBlogs(accumulated);
        setVisibleCount(accumulated.length >= INITIAL_VISIBLE ? INITIAL_VISIBLE : accumulated.length || PAGE_LIMIT);
        setNextPage(page);
      } catch {
        setBlogs([]);
        setHasMore(false);
        setNextPage(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [fetchPage, initialBlogs, hasQueryParams]);

  const ensureCount = useCallback(
    async (count) => {
      if (!hasMore) return;

      setLoadingMore(true);
      try {
        let page = nextPage;
        let current = blogs;

        while (current.length < count && hasMore) {
          const items = await fetchPage(page);
          if (!items?.length) {
            setHasMore(false);
            break;
          }

          current = current.concat(items);
          page += 1;

          setBlogs(current);
        }

        setNextPage(page);
      } finally {
        setLoadingMore(false);
      }
    },
    [blogs, fetchPage, hasMore, nextPage]
  );

  const onViewMore = useCallback(async () => {
    const desired = visibleCount + INCREMENT;
    await ensureCount(desired);
    setVisibleCount(desired);
  }, [ensureCount, visibleCount]);

  const visibleBlogs = useMemo(
    () => (Array.isArray(blogs) ? blogs.slice(0, visibleCount) : []),
    [blogs, visibleCount]
  );

  const showButton =
    !loading &&
    visibleBlogs.length > 0 &&
    (hasMore || visibleCount < blogs.length);

  if (loading && (!blogs || blogs.length === 0)) return (
    <div className="text-center py-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (!loading && (!blogs || blogs.length === 0)) {
    return (
      <div className="text-center py-5">
        <h4>No blogs found matching your criteria.</h4>
      </div>
    );
  }

  return (
    <>
      {visibleBlogs.map((item, index) => {
        const { month, day } = formatMonthDay(
          item?.date,
          item?.createdAt || item?.publishedAt || item?.updatedAt
        );

        const tagLabel =
          item?.category?.title ||
          item?.category?.name ||
          item?.category ||
          item?.tags?.[0] ||
          "";

        const href = item?.slug ? `/blog/${item.slug}` : null;
        const text =
          item?.text ||
          item?.excerpt ||
          item?.content ||
          item?.description ||
          "";
        const shortText = truncateWords(text, 20);

        return (
          <div
            className="blog-style1 list-style bgc-white d-block d-md-flex align-items-xl-center"
            key={item?._id || item?.id || item?.slug || index}
          >
            <div
              className="blog-img flex-shrink-0"
              style={{
                width: "220px",
                height: "140px",
                overflow: "hidden",
                borderRadius: "12px",
              }}
            >
              <Image
                width={280}
                height={240}
                priority={index < 2}
                className="w-100 h-100"
                style={{ objectFit: "cover", objectPosition: "center" }}
                src={resolveImageSrc(item?.image || item?.coverImage, getFallbackBlogImage(index))}
                alt={item?.title || "Blog article"}
              />
              <div className="date">
                <span className="month">{month}</span>
                <span className="day">{day}</span>
              </div>
            </div>
            <div className="blog-content pl30 pb20 flex-grow-1">
              <a className="tag" href="#">
                {typeof tagLabel === "string" ? tagLabel : (tagLabel?.title || "")}
              </a>
              <h4 className="title mt-1 mb20">
                {href ? (
                  <Link href={href}>{item?.title || "Untitled"}</Link>
                ) : (
                  <span>{item?.title || "Untitled"}</span>
                )}
              </h4>
              <p className="text mb0">{shortText}</p>
            </div>
          </div>
        );
      })}

      {showButton && (
        <div className="row">
          <div className="mbp_pagination text-center mt20">
            <button
              type="button"
              className="ud-btn btn-thm"
              onClick={onViewMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "View More"}
              <i className="fal fa-arrow-right-long" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const Blog = ({ initialBlogs = [] }) => {
  return (
    <Suspense fallback={<div className="text-center py-5"><div className="spinner-border" role="status"></div></div>}>
      <BlogContent initialBlogs={initialBlogs} />
    </Suspense>
  );
};

export default Blog;
