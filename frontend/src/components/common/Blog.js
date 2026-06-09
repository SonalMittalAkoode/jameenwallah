
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { getLimitedBlogs } from "@/api/blog";
import { getAllPropertiesFrontend } from "@/api/property";
import { getCleanPrimaryPropertyImage, resolveImageSrc } from "@/utils/resolveImage";

const formatMonthDay = (date, createdAt) => {
  // API sometimes returns ISO string; original static data used {month, day}.
  const month = date?.month ?? "";
  const day = date?.day ?? "";
  if (month || day) return { month, day };

  const fallback = createdAt || date;
  if (!fallback) return { month: "", day: "" };
  const d = new Date(fallback);
  if (Number.isNaN(d.getTime())) return { month: "", day: "" };

  return {
    month: d.toLocaleString("en-US", { month: "short" }),
    day: String(d.getDate()),
  };
};

const BlogCard = ({ blog, priority, listingImage }) => {
  const { month, day } = formatMonthDay(blog.date, blog.createdAt);
  const src = resolveImageSrc(
    listingImage || blog.image,
    "/images/listings/g1-1.jpg"
  );
  const href = blog?.slug ? `/blog/${blog.slug}` : null;

  return (
    <div className="blog-style1 blog-style1--feed h-100">
      <div className="blog-img blog-img--feed">
        <Image
          fill
          className="blog-feed-img contain"
          src={src}
          alt={blog.title || "Blog post"}
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
          priority={!!priority}
        />
      </div>
      <div className="blog-content">
        <div className="date">
          <span className="month">{month}</span>
          <span className="day">{day}</span>
        </div>
        <a className="tag" href="#">
          {blog.category || blog.tag || ""}
        </a>
        <h6 className="title mt-1">
          {href ? <Link href={href}>{blog.title}</Link> : <span>{blog.title}</span>}
        </h6>
      </div>
    </div>
  );
};

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [listingImages, setListingImages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [blogRes, propertyRes] = await Promise.all([
          getLimitedBlogs(3),
          getAllPropertiesFrontend({ limit: 12, page: 1 }),
        ]);
        const propertyRows = Array.isArray(propertyRes?.items)
          ? propertyRes.items
          : Array.isArray(propertyRes?.data)
            ? propertyRes.data
            : [];
        const images = propertyRows
          .map((property) => getCleanPrimaryPropertyImage(property, ""))
          .filter(Boolean);
        if (!cancelled) setBlogs(blogRes?.data ?? []);
        if (!cancelled) setListingImages(images);
      } catch {
        if (!cancelled) setBlogs([]);
        if (!cancelled) setListingImages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const safeBlogs = useMemo(() => blogs || [], [blogs]);
  if (!safeBlogs.length) return null;

  return (
    <>
      {safeBlogs.map((blog, index) => (
        <div
          className="col-sm-6 col-lg-4 blog-desktop-item"
          key={blog.slug || blog._id}
        >
          <BlogCard
            blog={blog}
            priority={index < 3}
            listingImage={listingImages[index % Math.max(listingImages.length, 1)]}
          />
        </div>
      ))}

      <div className="blog-mobile-slider">
        <Swiper
          className="blog-swiper"
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          pagination={{ clickable: true }}
        >
          {safeBlogs.map((blog, index) => (
            <SwiperSlide key={blog.slug || blog._id}>
              <BlogCard
                blog={blog}
                priority={index < 2}
                listingImage={listingImages[index % Math.max(listingImages.length, 1)]}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
