"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getActiveCategories } from "@/api/category";
import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";
import { mergeSiteContent } from "@/lib/siteContentDefaults";

const categoryHref = (cat) => {
  const slug =
    cat.slug ||
    String(cat.name || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
  return `/properties/${encodeURIComponent(slug)}`;
};

const DEFAULT_CATEGORY_LINKS = [
  { label: "Residential", href: "/properties/residential" },
  { label: "Commercial", href: "/properties/commercial" },
  { label: "Plots", href: "/properties?propertyType=plots" },
];

const DEFAULT_SERVICE_LINKS = [
  { label: "Legal Services", href: "/lawyer" },
  { label: "Financial Services", href: "/financer" },
  { label: "Architecture & Design", href: "/architect" },
  { label: "Chartered Accountant", href: "/chartered-accountant" },
  { label: "Property Management Services", href: "/property-management-services" },
];

const cleanLinks = (links, fallback = []) => {
  const source = Array.isArray(links) && links.length ? links : fallback;
  return source.filter((link) => link?.label && link?.href);
};

const MenuWidget = () => {
  const [categoryLinks, setCategoryLinks] = useState([]);
  const [footerContent, setFooterContent] = useState(() => mergeSiteContent("footer", null));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getActiveCategories();
        if (response.status === "success" && Array.isArray(response.data)) {
          const links = response.data.map((cat) => ({
            label: cat.name,
            href: categoryHref(cat),
          }));
          setCategoryLinks(links);
        }
      } catch (error) {
        console.error("Failed to fetch categories for footer:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchFooterContent = async () => {
      try {
        const response = await getSiteContentByPageKeyFrontend("footer");
        if (!cancelled) {
          setFooterContent(mergeSiteContent("footer", response?.data));
        }
      } catch (error) {
        console.error("Failed to fetch footer site content:", error);
      }
    };

    fetchFooterContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const serviceSection = footerContent.sections?.services || {};
  const serviceLinks = cleanLinks(serviceSection.links, DEFAULT_SERVICE_LINKS);

  const menuSections = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", href: "/" },
        { label: "Properties", href: "/properties" },
        { label: "About Us", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact Us", href: "/contact" },
        { label: "Become A Partner", href: "/contact" },
      ],
    },
    {
      title: "Categories",
      links:
        categoryLinks.length > 0
          ? categoryLinks
          : DEFAULT_CATEGORY_LINKS,
    },
    {
      title: serviceSection.title || "Explore Other Services",
      links: serviceLinks,
    },
  ];

  return (
    <>
      {menuSections.map((section, index) => (
        <div
          className="col-sm-6 col-lg-3"
          key={index}
        >
          <div className="footer-widget mb-4 mb-lg-5 ps-0 ps-lg-5">
            <div className="link-style1 mb-3">
              <h6 className="text-white mb25">{section.title}</h6>
              <ul className="ps-0">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default MenuWidget;
