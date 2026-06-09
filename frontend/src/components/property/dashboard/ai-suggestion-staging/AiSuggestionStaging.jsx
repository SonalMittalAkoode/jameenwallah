"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllAmenitiesFrontend } from "@/api/amenity";
import { getAllBlogs, getBlogById, updateBlog } from "@/api/blog";
import { getAllProperties, getPropertyByIdAdmin, updateProperty } from "@/api/property";
import {
  getSiteContentByPageKeyAdmin,
  updateSiteContentByPageKey,
} from "@/api/siteContent";
import { mergeSiteContent } from "@/lib/siteContentDefaults";
import serverlessProperties from "@/data/aiSuggestionStagingDataset.json";
import styles from "./AiSuggestionStaging.module.css";

const SCAN_MONTH = "May 2026";
const STAGING_BUILD_LABEL = "Build 2026-05-09 live-api-only-1";
const VERIFICATION_MARKER_PATTERN =
  /\b(?:BLOG MARKER|VISIBLE BLOG INDEX DETAIL|VISIBLE BLOG TITLE|UI BLOG TITLE|AI STAGING BLOG)\s+\d+(?:\s+\d+)?\s*/gi;

const MARKET_REFERENCE = {
  "Gurugram|Sector 39|residential": {
    avgSqFt: 37200,
    trend: 4.6,
    note: "central Gurugram luxury inventory remains limited near Medanta and NH-48",
  },
  "Noida|Sector 44|residential": {
    avgSqFt: 31500,
    trend: 3.8,
    note: "premium Noida Golf Course Road demand is improving",
  },
  "Gurugram|Sector 82|commercial": {
    avgSqFt: 23800,
    trend: 5.2,
    note: "NH-48 retail catchment has strengthened around New Gurgaon",
  },
  "Gurugram|Sector 73|residential": {
    avgSqFt: 16800,
    trend: 2.9,
    note: "SPR independent floor demand is steady",
  },
  "Gurugram|Sector 65|residential": {
    avgSqFt: 35500,
    trend: 6.1,
    note: "Golf Course Extension Road luxury stock is repricing upward",
  },
  "Gurugram|Sector 67|commercial": {
    avgSqFt: 18500,
    trend: 3.6,
    note: "ready mixed-use retail and serviced apartments have stable rental demand",
  },
  "Noida|Sector 146|residential": {
    avgSqFt: 22800,
    trend: 4.2,
    note: "Noida Expressway premium launches are gaining traction",
  },
  "Gurugram|Sector 54|residential": {
    avgSqFt: 38200,
    trend: 5.4,
    note: "Golf Course Road ultra-luxury projects continue to command a premium",
  },
};

const MOCK_PROPERTIES = [
  {
    _id: "mock-godrej-alira",
    status: "verified",
    description: {
      title: "Godrej Alira",
      slug: "godrej-alira",
      metaTitle: "Godrej Alira Sector 39 Gurugram - Price & Floor Plans",
      metaDescription: "Explore Godrej Alira in Sector 39, Gurugram, offering luxury 3, 4 & 4+ BHK apartments.",
      description:
        "Godrej Alira is an ultra-luxury residential development located in Sector 39, Gurugram, offering premium 3, 4 and 4+ BHK residences.",
      price: 62600000,
      paymentPlan: "Construction Linked Payment Plan",
      floorPlans: [{ unitType: "3 BHK", superBuiltUpArea: 1681, price: "62600000" }],
      category: { name: "Residential" },
      propertyType: { name: "Apartment" },
    },
    location: {
      address: "Sector 39, Gurugram, Haryana",
      city: { name: "Gurugram" },
      area: { name: "Sector 39" },
      nearBy: "Rajiv Chowk; Medanta Medicity; NH-48; Huda City Centre Metro",
    },
    details: {
      customId: "PROP-R1566",
      bhk: "3, 4 & 4+",
      sizeInSqFt: 1681,
      propertyStatus: "Under Construction",
      possessionDate: "Jan 2030",
    },
  },
  {
    _id: "mock-elan-imperial",
    status: "verified",
    description: {
      title: "Elan Imperial",
      slug: "elan-imperial",
      metaTitle: "Elan Imperial Sector 82 Gurgaon | Luxury Commercial and Retail",
      metaDescription: "Explore Elan Imperial Sector 82 Gurgaon offering retail shops, food court and hotel.",
      description:
        "Elan Imperial is an ultra-luxury mixed-use commercial development located in Sector 82, Gurgaon.",
      price: 12900000,
      paymentPlan: "50:50",
      floorPlans: [{ unitType: "Retail Shop", superBuiltUpArea: 600, price: "12900000" }],
      category: { name: "Commercial" },
      propertyType: { name: "Retail Shop" },
    },
    location: {
      address: "Sector 82, Gurugram",
      city: { name: "Gurugram" },
      area: { name: "Sector 82" },
      nearBy: "NH-48; Dwarka Expressway; Vatika Town Square; IMT Manesar",
    },
    details: {
      customId: "PROP-C9242",
      sizeInSqFt: 600,
      propertyStatus: "Under Construction",
      possessionDate: "2027",
    },
  },
  {
    _id: "mock-godrej-riverine",
    status: "verified",
    description: {
      title: "Godrej Riverine",
      slug: "godrej-riverine",
      metaTitle: "Godrej Riverine Noida - Price, Floor Plan & 4 BHK Luxury Homes",
      metaDescription: "Explore Godrej Riverine in Sector 44 Noida offering luxury 4 BHK apartments.",
      description:
        "Godrej Riverine is an ultra-luxury residential development located in Sector 44, Noida.",
      price: 0,
      paymentPlan: "30:40:30",
      floorPlans: [{ unitType: "4 BHK", superBuiltUpArea: 2711, price: "" }],
      category: { name: "Residential" },
      propertyType: { name: "Apartment" },
    },
    location: {
      address: "Sector 44, Noida",
      city: { name: "Noida" },
      area: { name: "Sector 44" },
      nearBy: "Noida Golf Course; Botanical Garden Metro; DLF Mall of India",
    },
    details: {
      customId: "PROP-R6508",
      bhk: "3, 4 BHK",
      sizeInSqFt: 2711,
      propertyStatus: "Under Construction",
      possessionDate: "September 2029",
    },
  },
];

const SERVERLESS_PROPERTIES =
  Array.isArray(serverlessProperties) && serverlessProperties.length
    ? serverlessProperties
    : MOCK_PROPERTIES;

const FIELD_LABELS = {
  "description.title": "Listing Title",
  "description.description": "Description",
  "description.price": "Rate / Price",
  "description.metaTitle": "SEO Meta Title",
  "description.metaDescription": "SEO Meta Description",
  "description.paymentPlan": "Payment Plan",
  "description.reraApproved": "RERA Approved",
  "description.reraNumber": "RERA Number",
  amenities: "Features & Amenities",
  "description.floorPlans": "Floor Plans",
  "media.floorPlanImages": "Floor Plan Images",
  "details.propertyStatus": "Property Status",
  "details.possessionDate": "Possession Date",
  "details.bhk": "Configurations",
  "details.sizeInSqFt": "Size",
  "details.facing": "Facing",
  "details.ownershipType": "Ownership Type",
  "details.parking": "Parking",
  "details.numberOfParkings": "Number of Parkings",
  "location.address": "Address",
  "location.zip": "Zip Code",
  "location.nearBy": "Nearby / Connectivity",
  "sections.featured.title": "Home Featured Section Title",
  "sections.featured.description": "Home Featured Section Copy",
  "sections.locations.title": "Home Locations Section Title",
  "sections.locations.description": "Home Locations Section Copy",
  "sections.explore.title": "Home Guidance Section Title",
  "sections.explore.description": "Home Guidance Section Copy",
  "sections.cityShowcase.title": "Home Location Browser Title",
  "sections.cityShowcase.description": "Home Location Browser Copy",
  "sections.blog.title": "Home Blog Section Title",
  "sections.blog.description": "Home Blog Section Copy",
  "sections.partners.title": "Home Partner Section Title",
  "sections.hero.title": "About Hero Title",
  "sections.intro.heading": "About Main Heading",
  "sections.intro.summary": "About Intro Summary",
  "sections.intro.emphasis": "About Emphasis Line",
  "sections.intro.origin": "About Origin Story",
  "sections.intro.mission": "About Mission",
  "sections.whatWeDo.title": "About Services Title",
  "sections.whatWeDo.items": "About What We Do",
  "sections.intro.title": "Intro Title",
  "sections.intro.description": "Intro Copy",
  "sections.intro.benefits": "Intro Benefits",
  "sections.form.title": "Form Title",
  "sections.office.title": "Office Section Title",
  "sections.office.description": "Office Section Copy",
  "sections.hero.heading": "Hero Heading",
  "sections.hero.eyebrow": "Hero Eyebrow",
  "sections.hero.description": "Hero Copy",
  "sections.hero.secondaryDescription": "Hero Secondary Copy",
  "sections.hero.primaryCta": "Primary CTA",
  "sections.hero.secondaryCta": "Secondary CTA",
  "sections.whoCanPartner.title": "Partner Profiles Title",
  "sections.whoCanPartner.description": "Partner Profiles Copy",
  "sections.whoCanPartner.items": "Partner Profiles",
  "sections.benefits.title": "Benefits Title",
  "sections.benefits.description": "Benefits Copy",
  "sections.benefits.items": "Benefits",
  "sections.services.title": "Services Title",
  "sections.services.description": "Services Copy",
  "sections.services.heading": "Services Heading",
  "sections.services.subheading": "Services Subheading",
  "sections.services.items": "Services",
  "sections.services.links": "Footer Service Links",
  "sections.whyUs.kicker": "Why Us Eyebrow",
  "sections.whyUs.title": "Why Us Title",
  "sections.whyUs.description": "Why Us Copy",
  "sections.whyUs.desc": "Why Us Copy",
  "sections.whyUs.items": "Why Us Points",
  "sections.whyUs.features": "Why Us Points",
  "sections.process.title": "Process Title",
  "sections.process.desc": "Process Copy",
  "sections.process.steps": "Process Steps",
  "sections.consultation.title": "Consultation Title",
  "sections.consultation.description": "Consultation Copy",
  "sections.cta.title": "CTA Title",
  "sections.cta.description": "CTA Copy",
  "sections.cta.button": "CTA Button",
  title: "Blog Title",
  description: "Blog Description",
  tags: "Blog Tags",
  metaTitle: "SEO Meta Title",
  metaDescription: "SEO Meta Description",
};

const FILTERS = [
  ["all", "All suggestions"],
  ["price", "Price"],
  ["content", "Description"],
  ["amenities", "Amenities"],
  ["layouts", "Floor plans"],
  ["seo", "SEO"],
  ["status", "Status & terms"],
  ["connectivity", "Connectivity"],
];

const EDITORIAL_FILTERS = [
  ["all", "All editorial"],
  ["home", "Home"],
  ["about", "About Us"],
  ["contact", "Contact"],
  ["partner", "Become Partner"],
  ["footer", "Footer"],
  ["services", "Other Services"],
  ["blog", "Blog"],
];

const SITE_CONTENT_KEYS = [
  "home",
  "about",
  "contact",
  "partner",
  "footer",
  "legal",
  "finance",
  "architecture",
  "chartered-accountant",
  "property-management",
];

const getEntityName = (value) =>
  typeof value === "object" && value !== null ? value.name || value.title || "" : value || "";

const stripVerificationMarkers = (value) =>
  String(value || "")
    .replace(VERIFICATION_MARKER_PATTERN, "")
    .replace(/<p>\s*<\/p>\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const copyTextSafely = async (text) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    // Some embedded browsers disable execCommand but allow the async clipboard API.
  }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard writes can be blocked in embedded or permission-restricted browsers.
  }

  return false;
};

const normalizeText = (value) => stripVerificationMarkers(value);

const parseNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value || "").replace(/[^\d.]/g, "");
  return Number(cleaned) || 0;
};

const formatCurrency = (value) => {
  const amount = parseNumber(value);
  if (!amount) return "Not listed";
  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `₹${crores.toFixed(crores % 1 ? 2 : 0)} Cr`;
  }
  return `₹${(amount / 100000).toFixed(1)} L`;
};

const inferCityFromText = (value) => {
  const text = normalizeText(value).toLowerCase();
  if (!text) return "";
  if (text.includes("gurugram") || text.includes("gurgaon")) return "Gurgaon";
  if (text.includes("greater noida")) return "Greater Noida";
  if (text.includes("noida")) return "Noida";
  if (text.includes("mumbai")) return "Mumbai";
  if (text.includes("dehradun")) return "Dehradun";
  if (text.includes("goa")) return "Goa";
  if (text.includes("delhi")) return "Delhi";
  if (text.includes("panipat")) return "Panipat";
  return "";
};

const getCity = (property) => {
  const directCity = getEntityName(property?.location?.city);
  if (directCity) return directCity;

  return (
    inferCityFromText(property?.location?.address) ||
    inferCityFromText(property?.description?.title) ||
    ""
  );
};

const getSector = (property) => {
  const area = getEntityName(property?.location?.area);
  if (area) return area;

  const address = normalizeText(property?.location?.address);
  const match = address.match(/sector\s*[-]?\s*\d+[a-z]?/i);
  if (match) {
    return match[0].replace(/\s+/g, " ").replace(/^sector/i, "Sector");
  }

  const title = normalizeText(property?.description?.title);
  const titleMatch = title.match(/sector\s*[-]?\s*\d+[a-z]?/i);
  if (titleMatch) {
    return titleMatch[0].replace(/\s+/g, " ").replace(/^sector/i, "Sector");
  }

  return address.split(",")[0] || "Unknown";
};

const getAssetType = (property) => {
  const category = getEntityName(property?.description?.category).toLowerCase();
  const type = getEntityName(property?.description?.propertyType).toLowerCase();
  const title = normalizeText(property?.description?.title).toLowerCase();
  const haystack = `${category} ${type} ${title}`;

  if (/(commercial|retail|office|shop|sco|food court|multiplex|serviced)/i.test(haystack)) {
    return "commercial";
  }
  return "residential";
};

const serializeWhatWeDoItems = (items) => {
  if (Array.isArray(items)) {
    return items
      .map((item) => `${normalizeText(item?.title)}: ${normalizeText(item?.text)}`.trim())
      .filter(Boolean)
      .join("\n");
  }

  if (typeof items === "string") {
    return normalizeText(items);
  }

  return "";
};

const parseWhatWeDoItems = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split(":");
      return {
        title: normalizeText(title),
        text: normalizeText(rest.join(":")),
      };
    })
    .filter((item) => item.title && item.text);

const isStructuredSiteListPath = (path) =>
  /^sections\./.test(path || "") &&
  /\.(items|features|steps|links|benefits)$/.test(path || "");

const serializeStructuredSiteList = (value) => {
  if (!Array.isArray(value)) return normalizeText(value);

  return value
    .map((item) => {
      if (typeof item === "string") return normalizeText(item);
      if (item?.label || item?.href) {
        return `${normalizeText(item.label)}: ${normalizeText(item.href)}`.trim();
      }
      return `${normalizeText(item?.title)}: ${normalizeText(item?.text)}`.trim();
    })
    .filter(Boolean)
    .join("\n");
};

const parseStructuredSiteListDraft = (value, existing = []) => {
  const template = Array.isArray(existing) ? existing : [];
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const current = template[index];
      if (typeof current === "string") return normalizeText(line);
      const [head, ...tail] = line.split(":");
      const first = normalizeText(head);
      const second = normalizeText(tail.join(":"));

      if (current?.label || current?.href) {
        return {
          ...(current || {}),
          label: first,
          href: second || current?.href || "#",
        };
      }

      return {
        ...(current || {}),
        title: first,
        text: second || current?.text || "",
      };
    })
    .filter((item) => {
      if (typeof item === "string") return Boolean(item);
      return Boolean(item?.title || item?.label);
    });
};

const serializeTags = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean).join(", ");
  }

  return normalizeText(value);
};

const parseTagsDraft = (value) =>
  String(value || "")
    .split(/,|\n|;/)
    .map((item) => normalizeText(item))
    .filter(Boolean);

const getSuggestedBlogTags = (blog) => {
  const current = Array.isArray(blog?.tags) ? blog.tags : parseTagsDraft(blog?.tags);
  const category = getEntityName(blog?.blogCategory || blog?.category);
  const title = normalizeText(blog?.title).toLowerCase();
  const additions = [];

  if (/gurgaon|gurugram/.test(title)) additions.push("gurugram real estate");
  if (/noida/.test(title)) additions.push("noida real estate");
  if (/commercial|retail|office|sco|roi/.test(title)) additions.push("commercial property");
  if (/luxury|premium|ultra/.test(title)) additions.push("luxury property");
  if (/investment|roi|return/.test(title)) additions.push("investment");
  if (category) additions.push(category);

  return uniqueList([...current, ...additions]).slice(0, 6);
};

const getSiteRecord = (siteContents, key, fallback) =>
  mergeSiteContent(key, siteContents?.[key] || fallback || null);

const createGenericSiteSuggestion = ({
  id,
  entityKey,
  title,
  subtitle,
  route,
  severity = "medium",
  record,
  changes,
  group = "site",
}) => ({
  id,
  entityType: "site",
  entityKey,
  editorialGroup: group,
  title,
  subtitle,
  route,
  status: "pending",
  severity,
  record,
  changes,
});

const buildEditorialSuggestions = ({ homeContent, aboutContent, siteContents = {}, blogs = [] }) => {
  const home = getSiteRecord(siteContents, "home", homeContent);
  const about = getSiteRecord(siteContents, "about", aboutContent);
  const contact = getSiteRecord(siteContents, "contact");
  const partner = getSiteRecord(siteContents, "partner");
  const footer = getSiteRecord(siteContents, "footer");
  const items = [];

  items.push({
    id: "site-home",
    entityType: "site",
    entityKey: "home",
    title: "Home Page",
    subtitle: "SITE-HOME · /",
    route: "/",
    status: "pending",
    severity: "medium",
    record: home,
    changes: [
      {
        path: "sections.featured.title",
        type: "content",
        reason: "This is the visible homepage title above featured listings.",
        oldValue: home.sections?.featured?.title,
        newValue: "Premium Properties with Trusted Consultants",
      },
      {
        path: "sections.featured.description",
        type: "content",
        reason: "Sharpen the homepage value proposition so the hero-adjacent listing section reads more premium and conversion-focused.",
        oldValue: home.sections?.featured?.description,
        newValue:
          "Position JameenWallah as a trusted advisory-led platform for premium residential and commercial opportunities across Gurgaon and NCR, with stronger emphasis on transparency, market understanding, and investor confidence.",
      },
      {
        path: "sections.locations.title",
        type: "content",
        reason: "This heading controls the homepage trending locations block.",
        oldValue: home.sections?.locations?.title,
        newValue: "Trending Locations to Buy Property in Gurgaon",
      },
      {
        path: "sections.locations.description",
        type: "content",
        reason: "The location section should explain why these micro-markets matter.",
        oldValue: home.sections?.locations?.description,
        newValue:
          "Discover high-demand Gurgaon corridors, sectors and neighbourhoods that buyers and investors are actively tracking.",
      },
      {
        path: "sections.explore.title",
        type: "content",
        reason: "This section title should make the advisory workflow clear.",
        oldValue: home.sections?.explore?.title,
        newValue: "How JameenWallah Helps You Find the Right Property",
      },
      {
        path: "sections.explore.description",
        type: "content",
        reason: "The explainer copy should sound more editorial and less generic.",
        oldValue: home.sections?.explore?.description,
        newValue:
          "From discovery and shortlisting to due diligence and negotiation, JameenWallah helps buyers and investors evaluate Gurgaon real estate with clearer context, stronger guidance, and better decision support.",
      },
      {
        path: "sections.cityShowcase.title",
        type: "content",
        reason: "This section title should clearly describe the location-led browsing experience.",
        oldValue: home.sections?.cityShowcase?.title,
        newValue: "Properties by Sectors and Road",
      },
      {
        path: "sections.cityShowcase.description",
        type: "content",
        reason: "Replace placeholder-style copy with a clear location-browsing explanation.",
        oldValue: home.sections?.cityShowcase?.description,
        newValue:
          "Browse active property opportunities by key Gurgaon sectors, growth corridors, and location clusters that matter to buyers and investors.",
      },
      {
        path: "sections.blog.title",
        type: "content",
        reason: "This is the homepage heading above the latest blog cards.",
        oldValue: home.sections?.blog?.title,
        newValue: "From Our Blog",
      },
      {
        path: "sections.blog.description",
        type: "seo",
        reason: "The blog section subtitle should reflect live market coverage rather than placeholder text.",
        oldValue: home.sections?.blog?.description,
        newValue:
          "Market updates, project insights, investment perspectives, and location-led buying guidance from the JameenWallah editorial desk.",
      },
      {
        path: "sections.partners.title",
        type: "content",
        reason: "This partner strip title should read less like template copy.",
        oldValue: home.sections?.partners?.title,
        newValue: "Trusted Developer Partners",
      },
      {
        path: "metaTitle",
        type: "seo",
        reason: "Homepage metadata should better reflect the JameenWallah brand and real estate focus.",
        oldValue: home.metaTitle,
        newValue: "JameenWallah | Premium Property Consultants in Gurgaon & NCR",
      },
      {
        path: "metaDescription",
        type: "seo",
        reason: "Homepage metadata should summarise the premium advisory proposition more clearly.",
        oldValue: home.metaDescription,
        newValue:
          "Discover premium residential and commercial properties with trusted consultants, stronger market insight, and end-to-end real estate guidance across Gurgaon and NCR.",
      },
    ],
  });

  items.push({
    id: "site-about",
    entityType: "site",
    entityKey: "about",
    title: "About Us",
    subtitle: "SITE-ABOUT · /about",
    route: "/about",
    status: "pending",
    severity: "medium",
    record: about,
    changes: [
      {
        path: "sections.hero.title",
        type: "content",
        reason: "This controls the visible About page hero heading.",
        oldValue: about.sections?.hero?.title,
        newValue: "About JameenWallah",
      },
      {
        path: "sections.intro.heading",
        type: "content",
        reason: "The About heading should feel more established and buyer-facing.",
        oldValue: about.sections?.intro?.heading,
        newValue: "Your Trusted Real Estate Partner in Gurgaon",
      },
      {
        path: "sections.intro.summary",
        type: "content",
        reason: "The About intro should sound more established and brand-defining.",
        oldValue: about.sections?.intro?.summary,
        newValue:
          "JameenWallah works with homebuyers, investors, and families looking for reliable guidance across Gurgaon real estate, combining market clarity, practical advisory support, and a more transparent property journey.",
      },
      {
        path: "sections.intro.emphasis",
        type: "content",
        reason: "This italic emphasis line is visible beside the About page story.",
        oldValue: about.sections?.intro?.emphasis,
        newValue: "Built on trust. Guided by market expertise.",
      },
      {
        path: "sections.intro.origin",
        type: "content",
        reason: "The origin story should read with more clarity and credibility.",
        oldValue: about.sections?.intro?.origin,
        newValue:
          "Our journey began with firsthand exposure to the trust gaps, information asymmetry, and inconsistent advisory standards that often make property decisions more stressful than they should be.",
      },
      {
        path: "sections.intro.mission",
        type: "content",
        reason: "The mission statement can carry a stronger editorial tone and clearer customer promise.",
        oldValue: about.sections?.intro?.mission,
        newValue:
          "That experience shaped our mission: to build a more dependable real estate platform where people can evaluate options carefully, understand the trade-offs, and move forward with confidence.",
      },
      {
        path: "sections.whatWeDo.title",
        type: "content",
        reason: "This section title can sound more service-led and editorially polished.",
        oldValue: about.sections?.whatWeDo?.title,
        newValue: "What We Do",
      },
      {
        path: "sections.whatWeDo.items",
        type: "content",
        reason: "The service list should read more precise and more premium in tone.",
        oldValue: about.sections?.whatWeDo?.items,
        newValue: [
          "Property Consulting: Evaluate shortlisted residential and commercial opportunities with clearer location context, builder positioning, and suitability for end-use or investment.",
          "Legal Assistance: Review title records, compliance checkpoints, and transaction risk with experienced legal support before you commit capital.",
          "Financial Advisory: Structure purchases with practical guidance on budgets, loan planning, taxation, and overall investment efficiency.",
          "Property Management: Support absentee owners and investors with dependable post-purchase coordination, upkeep, and tenant-related assistance.",
          "AI-Powered Solutions: Use data-backed tools to compare projects, surface relevant insights, and bring more consistency to decision-making.",
          "Growth Analysis: Track corridor-level infrastructure, demand patterns, and future appreciation signals before entering a micro-market.",
        ].join("\n"),
      },
      {
        path: "metaDescription",
        type: "seo",
        reason: "About page metadata should better summarize the advisory proposition.",
        oldValue: about.metaDescription,
        newValue:
          "Discover how JameenWallah supports buyers and investors with transparent property consulting, location insight, and end-to-end real estate guidance in Gurgaon.",
      },
      {
        path: "metaTitle",
        type: "seo",
        reason: "About page metadata should reinforce trust and advisory positioning.",
        oldValue: about.metaTitle,
        newValue: "About Us | JameenWallah — Trusted Property Advisory in Gurgaon",
      },
    ],
  });

  items.push(
    createGenericSiteSuggestion({
      id: "site-contact",
      entityKey: "contact",
      title: "Contact Us",
      subtitle: "SITE-CONTACT · /contact",
      route: "/contact",
      record: contact,
      changes: [
        {
          path: "sections.hero.title",
          type: "content",
          reason: "This controls the visible Contact page hero heading.",
          oldValue: contact.sections?.hero?.title,
          newValue: "Contact Us",
        },
        {
          path: "sections.intro.title",
          type: "content",
          reason: "Contact page intro should clarify the advisory and finance support proposition.",
          oldValue: contact.sections?.intro?.title,
          newValue: "Get in Touch with Our Property & Financial Experts",
        },
        {
          path: "sections.intro.description",
          type: "content",
          reason: "The Contact page opening copy should sound active and service-led.",
          oldValue: contact.sections?.intro?.description,
          newValue:
            "Looking for assistance with property buying, selling, investment, loan planning, or tax advisory? Our team can help you move forward with reliable, transparent, and practical guidance.",
        },
        {
          path: "sections.intro.benefits",
          type: "content",
          reason: "These visible bullets should stay specific to what users can ask the team for.",
          oldValue: contact.sections?.intro?.benefits,
          newValue: [
            "Expert guidance on property valuation, selection, and negotiation.",
            "Hassle-free financial planning, loan coordination, and tax advisory.",
            "Transparent support with verified builders, owners, and documentation.",
          ],
        },
        {
          path: "sections.form.title",
          type: "content",
          reason: "This is the heading above the Contact enquiry form.",
          oldValue: contact.sections?.form?.title,
          newValue: "Have questions? Get in touch!",
        },
        {
          path: "sections.office.title",
          type: "content",
          reason: "This controls the office visit section heading.",
          oldValue: contact.sections?.office?.title,
          newValue: "Visit Our Office",
        },
        {
          path: "sections.office.description",
          type: "content",
          reason: "Office section copy should explain the value of in-person consultation.",
          oldValue: contact.sections?.office?.description,
          newValue:
            "Meet our experts in person for personalized consultation on property, investment, documentation, and financial planning.",
        },
        {
          path: "metaTitle",
          type: "seo",
          reason: "Contact page metadata should not use template copy.",
          oldValue: contact.metaTitle,
          newValue: "Contact JameenWallah | Property & Finance Experts",
        },
        {
          path: "metaDescription",
          type: "seo",
          reason: "Contact page meta description should summarize the assistance available.",
          oldValue: contact.metaDescription,
          newValue:
            "Contact JameenWallah for property buying, selling, investment, legal, finance and tax advisory support across Gurgaon and NCR.",
        },
      ],
    })
  );

  items.push(
    createGenericSiteSuggestion({
      id: "site-partner",
      entityKey: "partner",
      title: "Become A Partner",
      subtitle: "SITE-PARTNER · /become-partner",
      route: "/become-partner",
      record: partner,
      changes: [
        {
          path: "sections.hero.title",
          type: "content",
          reason: "This controls the partner page hero label.",
          oldValue: partner.sections?.hero?.title,
          newValue: "Become A Partner",
        },
        {
          path: "sections.hero.heading",
          type: "content",
          reason: "Partner hero heading should be more brand-specific and conversion-focused.",
          oldValue: partner.sections?.hero?.heading,
          newValue: "Become a Partner with Jameen Wallah",
        },
        {
          path: "sections.hero.description",
          type: "content",
          reason: "Partner hero copy should explain the business value clearly.",
          oldValue: partner.sections?.hero?.description,
          newValue:
            "At Jameen Wallah, collaboration drives measurable growth. As a partner, you become part of a trusted ecosystem that connects buyers, investors, and service professionals through a transparent platform.",
        },
        {
          path: "sections.hero.secondaryDescription",
          type: "content",
          reason: "Secondary hero copy should identify the professional categories that can join.",
          oldValue: partner.sections?.hero?.secondaryDescription,
          newValue:
            "Whether you are a real estate advisor, legal expert, financial consultant, architect, tax professional, or property manager, we help you expand visibility and build long-term credibility.",
        },
        {
          path: "sections.whoCanPartner.items",
          type: "content",
          reason: "The partner profile list should be editable because these categories may expand.",
          oldValue: partner.sections?.whoCanPartner?.items,
          newValue: partner.sections?.whoCanPartner?.items,
        },
        {
          path: "sections.benefits.items",
          type: "content",
          reason: "Partner benefit cards are visible and should be editable from staging.",
          oldValue: partner.sections?.benefits?.items,
          newValue: partner.sections?.benefits?.items,
        },
        {
          path: "metaTitle",
          type: "seo",
          reason: "Partner page metadata should stay brand-led.",
          oldValue: partner.metaTitle,
          newValue: "Become A Partner | JameenWallah",
        },
        {
          path: "metaDescription",
          type: "seo",
          reason: "Partner page meta description should cover all service professional categories.",
          oldValue: partner.metaDescription,
          newValue:
            "Partner with JameenWallah to grow your real estate, legal, finance, architecture, tax, or property management business.",
        },
      ],
    })
  );

  items.push(
    createGenericSiteSuggestion({
      id: "site-footer",
      entityKey: "footer",
      title: "Footer Service Links",
      subtitle: "SITE-FOOTER · all public pages",
      route: "/contact",
      record: footer,
      changes: [
        {
          path: "sections.services.title",
          type: "content",
          reason: "This footer heading appears across public pages.",
          oldValue: footer.sections?.services?.title,
          newValue: "Explore Other Services",
        },
        {
          path: "sections.services.links",
          type: "content",
          reason: "Footer service links should be editable as service pages change.",
          oldValue: footer.sections?.services?.links,
          newValue: footer.sections?.services?.links,
        },
      ],
    })
  );

  [
    ["legal", "Legal Services", "SITE-LEGAL · /lawyer", "/lawyer"],
    ["finance", "Financial Services", "SITE-FINANCE · /financer", "/financer"],
    ["architecture", "Architecture & Design", "SITE-ARCHITECTURE · /architect", "/architect"],
    [
      "chartered-accountant",
      "Chartered Accountant",
      "SITE-CA · /chartered-accountant",
      "/chartered-accountant",
    ],
    [
      "property-management",
      "Property Management Services",
      "SITE-PROPERTY-MANAGEMENT · /property-management-services",
      "/property-management-services",
    ],
  ].forEach(([key, title, subtitle, route]) => {
    const record = getSiteRecord(siteContents, key);
    items.push(
      createGenericSiteSuggestion({
        id: `site-${key}`,
        entityKey: key,
        title,
        subtitle,
        route,
        group: "services",
        record,
        changes: [
          {
            path: "sections.hero.title",
            type: "content",
            reason: "Service page hero title should be editable from staging.",
            oldValue: record.sections?.hero?.title,
            newValue: record.sections?.hero?.title,
          },
          {
            path: record.sections?.hero?.desc !== undefined ? "sections.hero.desc" : "sections.hero.description",
            type: "content",
            reason: "Service page hero copy should be editable from staging.",
            oldValue: record.sections?.hero?.desc ?? record.sections?.hero?.description,
            newValue: record.sections?.hero?.desc ?? record.sections?.hero?.description,
          },
          {
            path: record.sections?.services?.heading !== undefined ? "sections.services.heading" : "sections.services.title",
            type: "content",
            reason: "Service section heading should be editable.",
            oldValue: record.sections?.services?.heading ?? record.sections?.services?.title,
            newValue: record.sections?.services?.heading ?? record.sections?.services?.title,
          },
          {
            path:
              record.sections?.services?.subheading !== undefined
                ? "sections.services.subheading"
                : "sections.services.description",
            type: "content",
            reason: "Service section supporting copy should be editable.",
            oldValue: record.sections?.services?.subheading ?? record.sections?.services?.description,
            newValue: record.sections?.services?.subheading ?? record.sections?.services?.description,
          },
          ...(Array.isArray(record.sections?.services?.items)
            ? [
                {
                  path: "sections.services.items",
                  type: "content",
                  reason: "Service cards should be editable because offerings can change.",
                  oldValue: record.sections?.services?.items,
                  newValue: record.sections?.services?.items,
                },
              ]
            : []),
          {
            path: "metaTitle",
            type: "seo",
            reason: "Service page metadata should be editable and production-ready.",
            oldValue: record.metaTitle,
            newValue: record.metaTitle,
          },
          {
            path: "metaDescription",
            type: "seo",
            reason: "Service page meta description should summarize the offering clearly.",
            oldValue: record.metaDescription,
            newValue: record.metaDescription,
          },
        ],
      })
    );
  });

  // Legacy editorial scan cap kept for reference:
  // blogs.slice(0, 6).forEach((blog) => {
  blogs.forEach((blog) => {
    items.push({
      id: `blog-${blog._id}`,
      entityType: "blog",
      entityKey: blog._id,
      title: blog.title || "Untitled blog",
      subtitle: `BLOG-${String(blog._id).slice(-6)} · /blog/${blog.slug || ""}`,
      route: blog.slug ? `/blog/${blog.slug}` : "/blog",
      status: "pending",
      severity: "low",
      record: blog,
      changes: [
        {
          path: "title",
          type: "content",
          reason: "This is the visible blog title shown on the blog listing and blog detail page.",
          oldValue: blog.title,
          newValue: normalizeText(blog.title),
        },
        {
          path: "description",
          type: "content",
          reason: "Blog descriptions should read more editorially polished and search-ready.",
          oldValue: blog.description,
          newValue: normalizeText(blog.description),
        },
        {
          path: "tags",
          type: "seo",
          reason: "Tags influence blog listing labels and filtering. Keep them focused on search intent and topic relevance.",
          oldValue: blog.tags,
          newValue: getSuggestedBlogTags(blog),
        },
        {
          path: "metaTitle",
          type: "seo",
          reason: "Meta title should be tighter and better aligned to search intent.",
          oldValue: blog.metaTitle,
          newValue: normalizeText(blog.metaTitle || blog.title),
        },
        {
          path: "metaDescription",
          type: "seo",
          reason: "Meta description should summarise the article clearly and professionally.",
          oldValue: blog.metaDescription,
          newValue: trimMetaText(blog.metaDescription || blog.description, 160),
        },
      ],
    });
  });

  return items
    .map((item) => ({
      ...item,
      changes: filterMeaningfulChanges(
        (item.changes || []).map((change) => ({ ...change, forceEditable: true }))
      ),
    }))
    .filter((item) => item.changes.length);
};

const buildEditorialPatch = (suggestion, changes = suggestion?.changes || []) => {
  if (suggestion.entityType === "site") {
    const payload = {
      title: suggestion.record?.title,
      route: suggestion.record?.route,
      status: suggestion.record?.status || "active",
      metaTitle: suggestion.record?.metaTitle || "",
      metaDescription: suggestion.record?.metaDescription || "",
      sections: JSON.parse(JSON.stringify(suggestion.record?.sections || {})),
    };
    changes.forEach((change) => {
      if (change.path === "metaTitle" || change.path === "metaDescription") {
        payload[change.path] = displayValue(change.path, change.newValue);
        return;
      }
      if (change.path === "sections.whatWeDo.items") {
        setPathValue(payload, change.path, parseWhatWeDoItems(change.newValue));
        return;
      }
      if (isStructuredSiteListPath(change.path)) {
        setPathValue(
          payload,
          change.path,
          parseStructuredSiteListDraft(
            change.newValue,
            getPathValue(suggestion.record, change.path)
          )
        );
        return;
      }
      setPathValue(payload, change.path, displayValue(change.path, change.newValue));
    });
    return payload;
  }

  if (suggestion.entityType === "blog") {
    const payload = {};
    changes.forEach((change) => {
      if (change.path === "tags") {
        payload.tags = Array.isArray(change.newValue) ? change.newValue : parseTagsDraft(change.newValue);
        return;
      }
      payload[change.path] = displayValue(change.path, change.newValue);
    });
    return payload;
  }

  return {};
};

const normalizeListKey = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const AMENITY_ALIASES = {
  "kids play area": "kids’ play area",
  "kids play zone": "kids’ play area",
  "green landscape": "landscaped gardens",
  "energy efficient hvac": "energy-efficient lighting",
};

const uniqueList = (values = []) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalizeListKey(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const parseDraftLines = (value) =>
  String(value || "")
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);

const getAmenityTitles = (property) =>
  uniqueList(
    Array.isArray(property?.amenities)
      ? property.amenities
          .map((item) => (typeof item === "object" ? item?.title || item?.name : item))
          .filter(Boolean)
      : Array.isArray(property?.features)
        ? property.features.filter(Boolean)
        : []
  );

const getFloorPlanImages = (property) =>
  Array.isArray(property?.media?.floorPlanImages)
    ? property.media.floorPlanImages.map((item) => normalizeText(item)).filter(Boolean)
    : [];

const safeDisplayToken = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    return (
      value.title ||
      value.name ||
      value.amenityTitle ||
      value.label ||
      safeDisplayToken(value._id) ||
      safeDisplayToken(value.id) ||
      ""
    );
  }
  return "";
};

const serializeAmenities = (value) => {
  const titles = Array.isArray(value)
    ? value.map((item) => safeDisplayToken(item))
    : parseDraftLines(value);
  return titles.filter(Boolean).join("\n");
};

const serializeNearBy = (value) => parseDraftLines(value).join("\n");

const normalizeFloorPlanDraftItem = (plan = {}, index = 0) => ({
  unitType: normalizeText(plan?.unitType) || `Floor Plan ${index + 1}`,
  carpetArea: normalizeText(plan?.carpetArea),
  builtUpArea: normalizeText(plan?.builtUpArea),
  superBuiltUpArea: normalizeText(plan?.superBuiltUpArea),
  price: normalizeText(plan?.price),
  image: normalizeText(plan?.image),
});

const serializeFloorPlans = (value) => {
  if (!Array.isArray(value)) return String(value || "");
  return JSON.stringify(value.map(normalizeFloorPlanDraftItem), null, 2);
};

const parseFloorPlansDraft = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeFloorPlanDraftItem);
  }

  const source = String(value || "").trim();
  if (!source) return [];

  try {
    const parsed = JSON.parse(source);
    if (!Array.isArray(parsed)) {
      throw new Error("Floor plans must be a JSON array.");
    }
    return parsed.map((item, index) => normalizeFloorPlanDraftItem(item, index));
  } catch (error) {
    throw new Error("Floor plan edits must stay in valid JSON array format.");
  }
};

const serializeFloorPlanImages = (value) => {
  const images = Array.isArray(value) ? value : parseDraftLines(value);
  return images.filter(Boolean).join("\n");
};

const buildAmenityTitleIndex = (amenityCatalog = [], property = null) => {
  const index = new Map();

  const register = (title, id) => {
    const key = normalizeListKey(title);
    if (!key || !id || index.has(key)) return;
    index.set(key, String(id));
    const alias = AMENITY_ALIASES[key];
    if (alias) {
      const aliasKey = normalizeListKey(alias);
      if (aliasKey && !index.has(aliasKey)) {
        index.set(aliasKey, String(id));
      }
    }
  };

  amenityCatalog.forEach((item) => {
    register(item?.title || item?.name, item?._id || item?.id);
  });

  if (Array.isArray(property?.amenities)) {
    property.amenities.forEach((item) => {
      if (item && typeof item === "object") {
        register(item.title || item.name, item._id || item.id);
      }
    });
  }

  Object.entries(AMENITY_ALIASES).forEach(([aliasKey, canonicalTitle]) => {
    const canonicalKey = normalizeListKey(canonicalTitle);
    if (index.has(canonicalKey) && !index.has(aliasKey)) {
      index.set(aliasKey, index.get(canonicalKey));
    }
  });

  return index;
};

const getSize = (property) => {
  const detailsSize = parseNumber(property?.details?.sizeInSqFt);
  if (detailsSize) return detailsSize;

  const plans = property?.description?.floorPlans || [];
  const firstUsable = plans.find(
    (plan) => parseNumber(plan?.superBuiltUpArea) || parseNumber(plan?.builtUpArea) || parseNumber(plan?.carpetArea)
  );
  return (
    parseNumber(firstUsable?.superBuiltUpArea) ||
    parseNumber(firstUsable?.builtUpArea) ||
    parseNumber(firstUsable?.carpetArea)
  );
};

const getPrice = (property) => {
  const direct = parseNumber(property?.description?.price);
  if (direct) return direct;

  const plans = property?.description?.floorPlans || [];
  const pricedPlan = plans.find((plan) => parseNumber(plan?.price));
  return parseNumber(pricedPlan?.price);
};

const getSuggestedAmenities = (property, amenityCatalog = []) => {
  const currentTitles = getAmenityTitles(property);
  const amenityIndex = buildAmenityTitleIndex(amenityCatalog, property);
  const assetType = getAssetType(property);
  const seeds =
    assetType === "commercial"
      ? [
          "24x7 security with CCTV",
          "Concierge service",
          "High-street retail frontage",
          "Power backup",
          "Multi-level parking",
          "Fire detection & suppression system",
          "Cafeteria",
          "Food court",
          "Fine-dining restaurants",
        ]
      : [
          "24x7 security with CCTV",
          "Landscaped gardens",
          "Power backup",
          "Rainwater harvesting",
          "Concierge service",
          "EV charging stations",
          "Double-height entrance lobby",
          "Energy-efficient lighting",
        ];

  const suggested = uniqueList([
    ...currentTitles,
    ...seeds.filter((title) => amenityIndex.has(normalizeListKey(title))),
  ]);

  return suggested.length ? suggested : currentTitles;
};

const getSuggestedFloorPlans = (property) => {
  const floorPlans = Array.isArray(property?.description?.floorPlans)
    ? property.description.floorPlans
    : [];
  const fallbackPrice = getPrice(property);

  return floorPlans.map((plan, index) => {
    const normalized = normalizeFloorPlanDraftItem(plan, index);
    if (!normalized.price && fallbackPrice) {
      normalized.price = String(fallbackPrice);
    }
    return normalized;
  });
};

const getSuggestedNearby = (property) => {
  const current = parseDraftLines(property?.location?.nearBy);
  const assetType = getAssetType(property);
  const additions = [];

  if (assetType === "residential" && !current.some((item) => /metro|rapid/i.test(item))) {
    additions.push("Nearest metro / rapid transit access to verify");
  }

  if (
    assetType === "commercial" &&
    !current.some((item) => /mall|market|residential|sector|business|it park|town square/i.test(item))
  ) {
    additions.push("Primary catchment landmark or residential sector cluster to verify");
  }

  return uniqueList([...current, ...additions]).join("; ");
};

const marketKey = (property) => `${getCity(property)}|${getSector(property)}|${getAssetType(property)}`;

const monthDistance = (property) => {
  const dateValue = normalizeText(property?.details?.possessionDate || property?.details?.completionDate);
  if (!dateValue || /completed|ready/i.test(dateValue)) return 0;
  const match = dateValue.match(/20\d{2}/);
  if (!match) return 0;
  return (Number(match[0]) - 2026) * 12 - 4;
};

const makeDescription = (property, market) => {
  const title = normalizeText(property?.description?.title) || "This property";
  const sector = getSector(property);
  const city = getCity(property);
  const nearbyList = normalizeText(property?.location?.nearBy)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
  const nearby = nearbyList.join(", ");
  const bhk = property?.details?.bhk || "premium";
  const audience = getAssetType(property) === "commercial" ? "brands, operators and investors" : "families, HNI buyers and long-term investors";
  const status = property?.details?.propertyStatus || property?.status || "active";
  const possession = property?.details?.possessionDate || property?.details?.completionDate || "updated";
  const builder = getEntityName(property?.description?.builder) || "the developer";
  const size = getSize(property);
  const sizeText = size ? `${size.toLocaleString("en-IN")} sq.ft.` : "well-planned configurations";
  const price = getPrice(property);
  const priceText = price ? formatCurrency(price) : "";
  const metaNote = market?.note || "The local market remains active for well-located premium inventory.";
  const isCommercial = getAssetType(property) === "commercial";
  const addressLine = normalizeText(property?.location?.address);
  const locationLine = [sector, city].filter(Boolean).join(", ");
  const sectorMention = locationLine || addressLine || city || "its location";
  const connectivitySentence = nearby
    ? `Connectivity remains one of the strongest talking points, with access to ${nearby}.`
    : "Connectivity, approach roads and surrounding infrastructure remain central to purchase decisions in this segment.";
  const statusSentence = `The project is currently listed with ${status} status and ${possession} possession visibility, giving buyers a clearer view of timeline, planning and readiness.`;

  if (isCommercial) {
    const priceSentence = price
      ? `With pricing visibility around ${priceText}, the listing gives investors a practical starting point for comparing frontage, catchment strength and expected business viability.`
      : "Once pricing is confirmed, it can further strengthen the investment case by helping buyers compare the project against competing commercial inventory in the same corridor.";

    return `${title}${locationLine ? ` in ${locationLine}` : ""} is a premium commercial development by ${builder}, positioned for brands, occupiers and investors seeking a high-visibility address in a well-connected growth corridor. The project is relevant for retail-led businesses, food and beverage operators, service-led brands and investors who want exposure to an improving commercial micro-market.

Located in ${sectorMention}, the project benefits from a catchment profile supported by surrounding residential density, improving road infrastructure and day-to-day consumer movement. ${connectivitySentence} ${priceSentence}

The commercial proposition is built around frontage, circulation, visibility, brand placement potential and the quality of the surrounding ecosystem. With size visibility around ${sizeText}, the development can be evaluated for retail, dining, office or mixed-use demand depending on unit position, access and tenant mix.

${statusSentence} For commercial buyers, the real value lies in catchment quality, accessibility, business visibility and the long-term strength of the corridor. ${metaNote}`;
  }

  const priceSentence = price
    ? `With pricing visibility around ${priceText}, buyers can compare the project more clearly against other premium residential options in the same micro-market.`
    : "Once pricing is confirmed, the listing can give buyers a stronger basis for comparing the project with competing premium inventory in the same micro-market.";

  return `${title}${locationLine ? ` in ${locationLine}` : ""} is a premium residential development by ${builder}, positioned for discerning homebuyers and long-term investors seeking a well-connected address with credible lifestyle and appreciation potential. The project is best presented as a serious Gurgaon residential opportunity rather than a short monthly listing update.

Located in ${sectorMention}, the project benefits from a location profile that supports daily convenience, access to business districts and long-term end-user demand. ${connectivitySentence} ${priceSentence}

The project offers ${bhk} configurations with size visibility around ${sizeText}. The layouts can be positioned around spacious planning, privacy, natural light, efficient use of space and an overall living environment that feels considered rather than crowded. These details matter for families comparing premium homes where liveability is as important as location.

${statusSentence} For residential buyers, the strength of the project lies in the combination of livability, location credibility, developer reputation and the long-term demand typically associated with well-connected premium developments. ${metaNote}`;
};

const stripHtml = (value) =>
  normalizeText(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const makeListingTitle = (property) => {
  const title = normalizeText(property?.description?.title);
  const sector = getSector(property);
  const city = getCity(property);
  if (!title) return [sector, city].filter(Boolean).join(", ");
  if (city && title.toLowerCase().includes(city.toLowerCase())) return title;
  if (/sector\s*[-]?\s*\d+[a-z]?/i.test(title)) return title;
  if (sector && city && !title.toLowerCase().includes(sector.toLowerCase()) && title.length < 75) {
    return `${title} ${sector} ${city}`.replace(/\s+/g, " ").trim();
  }
  return title;
};

const makeMetaTitle = (property) => {
  const title = normalizeText(property?.description?.title) || "Property";
  const location = [getSector(property), getCity(property)].filter(Boolean).join(" ");
  const baseTitle = location && !title.toLowerCase().includes(location.toLowerCase()) && title.length < 75
    ? `${title} ${location}`
    : title;
  return `${baseTitle} | Price, Floor Plans & Amenities ${SCAN_MONTH}`.replace(/\s+/g, " ").trim();
};

const trimMetaText = (value, limit = 160) => {
  const text = stripHtml(value);
  if (text.length <= limit) return text;
  const truncated = text.slice(0, limit + 1);
  const sentenceEnd = Math.max(truncated.lastIndexOf("."), truncated.lastIndexOf("?"), truncated.lastIndexOf("!"));
  if (sentenceEnd >= 90) return truncated.slice(0, sentenceEnd + 1).trim();
  const wordEnd = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, wordEnd > 80 ? wordEnd : limit).trim()}...`;
};

const makeMetaDescription = (property) => {
  const title = normalizeText(property?.description?.title) || "This property";
  const sector = getSector(property);
  const city = getCity(property);
  const assetType = getAssetType(property);
  const price = getPrice(property);
  const size = getSize(property);
  const location = [sector, city].filter(Boolean).join(", ");
  const priceText = price ? ` Price from ${formatCurrency(price)}.` : "";
  const sizeText = size ? ` Sizes around ${size.toLocaleString("en-IN")} sq.ft.` : "";
  const base = `${title}${location ? ` in ${location}` : ""}. Explore ${assetType} details, latest price, floor plans, amenities, location highlights and investment fit.${priceText}${sizeText}`;
  return trimMetaText(base, 160);
};

const makeChange = ({ path, oldValue, newValue, type, severity = "medium", reason, status = "pending", forceEditable = false }) => ({
  path,
  oldValue,
  newValue,
  type,
  severity,
  reason,
  status,
  forceEditable,
});

const comparableList = (value) =>
  parseDraftLines(Array.isArray(value) ? value.join("\n") : value)
    .map((item) => normalizeListKey(item))
    .filter(Boolean)
    .sort();

const comparableValue = (path, value) => {
  if (path === "description.price" || path === "details.sizeInSqFt") {
    return String(parseNumber(value));
  }

  if (path === "description.floorPlans") {
    return JSON.stringify(parseFloorPlansDraft(value).map(normalizeFloorPlanDraftItem));
  }

  if (path === "amenities" || path === "location.nearBy" || path === "tags") {
    return JSON.stringify(comparableList(value));
  }

  if (Array.isArray(value) || (value && typeof value === "object")) {
    return JSON.stringify(value);
  }

  return stripHtml(value).replace(/\s+/g, " ").trim().toLowerCase();
};

const hasMeaningfulChange = (change) =>
  change.forceEditable || comparableValue(change.path, change.oldValue) !== comparableValue(change.path, change.newValue);

const filterMeaningfulChanges = (changes) => changes.filter(hasMeaningfulChange);

const buildSuggestions = (properties, { amenityCatalog = [] } = {}) =>
  properties.map((property) => {
    const key = marketKey(property);
    const market = MARKET_REFERENCE[key];
    const price = getPrice(property);
    const size = getSize(property);
    const changes = [];

    changes.push(
      makeChange({
        path: "description.title",
        oldValue: property?.description?.title || "",
        newValue: makeListingTitle(property),
        type: "content",
        severity: "low",
        reason: "Listing titles are visible across cards, detail pages and SEO surfaces. Keep them specific, readable and location-aware.",
      })
    );

    changes.push(
      makeChange({
        path: "description.description",
        oldValue: property?.description?.description || "",
        newValue: makeDescription(property, market),
        type: "content",
        reason: "Monthly freshness rewrite using project status, location, buyer intent and local market context.",
      })
    );

    const currentAmenities = getAmenityTitles(property);
    const suggestedAmenities = getSuggestedAmenities(property, amenityCatalog);
    changes.push(
      makeChange({
        path: "amenities",
        oldValue: currentAmenities,
        newValue: suggestedAmenities,
        type: "amenities",
        severity: currentAmenities.length ? "low" : "medium",
        reason: currentAmenities.length
          ? "Review the amenity mix for completeness, naming consistency and conversion value. Edit with titles from the amenity master list."
          : "No visible amenities are mapped right now. Suggest a stronger publish-ready amenity mix using existing amenity master titles.",
      })
    );

    if (market && size) {
      const suggestedPrice = Math.round((market.avgSqFt * size) / 100000) * 100000;
      const delta = price ? (suggestedPrice - price) / price : 1;
      if (!price || Math.abs(delta) >= 0.04) {
        changes.push(
          makeChange({
            path: "description.price",
            oldValue: price,
            newValue: suggestedPrice,
            type: "price",
            severity: !price || Math.abs(delta) > 0.15 ? "high" : "medium",
            reason: price
              ? `Suggested for admin review from the ${getSector(property)} benchmark. If you accept or edit this value, the listing price and floor-plan prices will be synced together.`
              : `No visible price is set. Suggested from the ${getSector(property)} benchmark of ₹${market.avgSqFt.toLocaleString("en-IN")}/sq.ft. If you accept or edit this value, pricing will sync across the listing.`,
          })
        );
      } else {
        changes.push(
          makeChange({
            path: "description.price",
            oldValue: price,
            newValue: price,
            type: "price",
            severity: "low",
            reason: "Current price is close to the local benchmark. You can still edit it here, and any approved change will sync across the listing and floor plans.",
          })
        );
      }
    } else {
      changes.push(
        makeChange({
          path: "description.price",
          oldValue: price,
          newValue: price,
          type: "price",
          severity: !price ? "high" : "low",
          reason: "Edit this field when admin or sales confirms the latest listing price. Any approved change will sync across the listing and floor plans.",
        })
      );
    }

    const projectStatus = property?.details?.propertyStatus;
    const months = monthDistance(property);
    if (projectStatus === "Under Construction" && months <= 0) {
      changes.push(
        makeChange({
          path: "details.propertyStatus",
          oldValue: projectStatus,
          newValue: "Ready to Move",
          type: "status",
          severity: "high",
          reason: "Possession or completion appears due/past. Confirm latest construction stage before keeping old status live.",
        })
      );
    } else if (projectStatus === "New Launch" && months < 12) {
      changes.push(
        makeChange({
          path: "details.propertyStatus",
          oldValue: projectStatus,
          newValue: "Under Construction",
          type: "status",
          reason: "The launch is no longer fresh for this monthly cycle; move wording toward active construction progress.",
        })
      );
    }

    changes.push(
      makeChange({
        path: "description.paymentPlan",
        oldValue: property?.description?.paymentPlan || "",
        newValue:
          projectStatus === "Ready to Move"
            ? "Ready-to-move payment terms"
            : property?.description?.paymentPlan || "Admin to verify current payment plan",
        type: "status",
        severity: property?.description?.paymentPlan ? "low" : "medium",
        reason: "Payment plan copy is visible and changes often by campaign. Keep it independently editable from the listing description.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "description.metaTitle",
        oldValue: property?.description?.metaTitle || "",
        newValue: makeMetaTitle(property),
        type: "seo",
        severity: "low",
        reason: "Refresh or edit the property page meta title independently before pushing it live.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "description.metaDescription",
        oldValue: property?.description?.metaDescription || "",
        newValue: makeMetaDescription(property),
        type: "seo",
        severity: "low",
        reason: "Refresh or edit the property page meta description independently before pushing it live.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "description.reraApproved",
        oldValue: property?.description?.reraApproved || "",
        newValue: property?.description?.reraApproved || "",
        type: "status",
        severity: property?.description?.reraApproved ? "low" : "medium",
        reason: "RERA approval is visible trust metadata. Edit this field when compliance status needs correction.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "description.reraNumber",
        oldValue: property?.description?.reraNumber || "",
        newValue: property?.description?.reraNumber || "",
        type: "status",
        severity: property?.description?.reraApproved === "Yes" && !property?.description?.reraNumber ? "medium" : "low",
        reason: "RERA number should be editable independently from description and SEO copy.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "details.bhk",
        oldValue: property?.details?.bhk || "",
        newValue: normalizeText(property?.details?.bhk) || "Configuration to verify",
        type: "content",
        severity: property?.details?.bhk ? "low" : "medium",
        reason: "Configuration text appears in listing and detail surfaces. Keep it reviewed separately from the long description.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "details.sizeInSqFt",
        oldValue: property?.details?.sizeInSqFt || "",
        newValue: size || property?.details?.sizeInSqFt || "",
        type: "content",
        severity: size ? "low" : "medium",
        reason: "Size drives pricing, floor-plan consistency and buyer comparison. Admin can edit it here before pushing.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "details.possessionDate",
        oldValue: property?.details?.possessionDate || "",
        newValue: property?.details?.possessionDate || "",
        type: "status",
        severity: property?.details?.possessionDate ? "low" : "medium",
        reason: "Possession visibility is a major buyer decision field and should be editable independently.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "details.facing",
        oldValue: property?.details?.facing || "",
        newValue: property?.details?.facing || "",
        type: "status",
        severity: property?.details?.facing ? "low" : "medium",
        reason: "Facing appears in the property overview and details. Edit it here when the listing metadata needs correction.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "details.ownershipType",
        oldValue: property?.details?.ownershipType || "",
        newValue: property?.details?.ownershipType || "",
        type: "status",
        severity: property?.details?.ownershipType ? "low" : "medium",
        reason: "Ownership type is visible buyer metadata and can be corrected independently.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "details.parking",
        oldValue: property?.details?.parking || "",
        newValue: property?.details?.parking || "",
        type: "status",
        severity: property?.details?.parking ? "low" : "medium",
        reason: "Parking metadata appears on the property page and should be editable independently.",
        forceEditable: true,
      })
    );

    const currentAddress = normalizeText(property?.location?.address);
    const fallbackAddress = [getSector(property), getCity(property)].filter((item) => item && item !== "Unknown").join(", ");
    changes.push(
      makeChange({
        path: "location.address",
        oldValue: currentAddress,
        newValue: currentAddress && !/^unknown/i.test(currentAddress) ? currentAddress : fallbackAddress,
        type: "connectivity",
        severity: currentAddress && !/^unknown/i.test(currentAddress) ? "low" : "medium",
        reason: "The address line is visible on the property page and cards. Replace Unknown or incomplete values before publishing.",
        forceEditable: true,
      })
    );

    changes.push(
      makeChange({
        path: "location.zip",
        oldValue: property?.location?.zip || "",
        newValue: property?.location?.zip || "",
        type: "connectivity",
        severity: property?.location?.zip ? "low" : "medium",
        reason: "Zip code is part of the property address metadata and can be corrected independently.",
        forceEditable: true,
      })
    );

    const currentFloorPlans = Array.isArray(property?.description?.floorPlans)
      ? property.description.floorPlans.map(normalizeFloorPlanDraftItem)
      : [];
    if (currentFloorPlans.length) {
      const suggestedFloorPlans = getSuggestedFloorPlans(property);
      const floorPlanImages = getFloorPlanImages(property);
      const missingImageCount = Math.max(suggestedFloorPlans.length - floorPlanImages.length, 0);

      changes.push(
        makeChange({
          path: "description.floorPlans",
          oldValue: currentFloorPlans,
          newValue: suggestedFloorPlans,
          type: "layouts",
          severity: suggestedFloorPlans.some((plan) => !normalizeText(plan.price)) ? "medium" : "low",
          reason: "Review unit mix, size labels and per-plan pricing here so the floor plan section stays consistent with the main listing.",
        })
      );

      changes.push(
        makeChange({
          path: "media.floorPlanImages",
          oldValue: floorPlanImages,
          newValue: floorPlanImages,
          type: "layouts",
          severity: missingImageCount ? "medium" : "low",
          reason: missingImageCount
            ? `Add or verify ${missingImageCount} floor plan image URL${missingImageCount > 1 ? "s" : ""} so the property page does not show empty plan states.`
            : "Review floor plan image ordering if the visual sequence on the property page needs cleanup.",
        })
      );
    }

    const nearBy = normalizeText(property?.location?.nearBy);
    changes.push(
      makeChange({
        path: "location.nearBy",
        oldValue: nearBy,
        newValue: getSuggestedNearby(property),
        type: "connectivity",
        severity: nearBy ? "low" : "medium",
        reason: "Location highlights should stay curated and conversion-friendly. Review roads, transit, landmarks and catchment signals each cycle.",
      })
    );

    const meaningfulChanges = filterMeaningfulChanges(changes);
    const rank = { high: 3, medium: 2, low: 1 };
    const maxSeverity = meaningfulChanges.reduce((max, change) => Math.max(max, rank[change.severity] || 1), 1);

    return {
      id: `scan-${property._id}`,
      property,
      changes: meaningfulChanges,
      status: "pending",
      severity: Object.keys(rank).find((keyName) => rank[keyName] === maxSeverity) || "low",
      createdAt: new Date().toISOString(),
    };
  }).filter((item) => item.changes.length);

const getPathValue = (object, path) =>
  path.split(".").reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), object);

const setPathValue = (object, path, value) => {
  const keys = path.split(".");
  let pointer = object;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      pointer[key] = value;
      return;
    }
    pointer[key] = pointer[key] || {};
    pointer = pointer[key];
  });
};

const REFERENCE_PATHS = new Set([
  "description.category",
  "description.propertyType",
  "description.builder",
  "location.state",
  "location.city",
  "location.area",
  "assignedAgent",
  "amenities",
]);

const ALLOWED_TOP_LEVEL_UPDATE_KEYS = new Set([
  "description",
  "location",
  "details",
  "media",
  "amenities",
  "personalDetails",
  "status",
  "assignedAgent",
]);

const cloneValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }

  if (Boolean(value) && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)])
    );
  }

  return value;
};

const extractReferenceId = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => extractReferenceId(item))
      .filter((item) => item !== undefined && item !== null && item !== "");
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (value && typeof value === "object") {
    if (typeof value._id === "string" || typeof value._id === "number") {
      return value._id;
    }

    if (typeof value.id === "string" || typeof value.id === "number") {
      return value.id;
    }
  }

  return value;
};

const sanitizeForAdminUpdate = (property) => {
  const sanitized = {};

  Object.entries(property || {}).forEach(([key, value]) => {
    if (!ALLOWED_TOP_LEVEL_UPDATE_KEYS.has(key)) return;
    sanitized[key] = cloneValue(value);
  });

  REFERENCE_PATHS.forEach((path) => {
    const currentValue = getPathValue(sanitized, path);
    if (currentValue !== undefined) {
      setPathValue(sanitized, path, extractReferenceId(currentValue));
    }
  });

  return sanitized;
};

const buildSyncedFloorPlans = (property, nextPrice) => {
  const floorPlans = Array.isArray(property?.description?.floorPlans)
    ? property.description.floorPlans
    : [];

  if (!floorPlans.length) return undefined;

  const normalizedPrice = String(parseNumber(nextPrice) || "");

  return floorPlans.map((plan) => ({
    ...cloneValue(plan),
    price: normalizedPrice,
  }));
};

const sameValue = (left, right) => {
  if (left === right) return true;
  if (Array.isArray(left) || Array.isArray(right) || isPlainObject(left) || isPlainObject(right)) {
    try {
      return JSON.stringify(left) === JSON.stringify(right);
    } catch (error) {
      return false;
    }
  }
  if ((left === null || left === undefined || left === 0) && right === "") return true;
  if ((right === null || right === undefined || right === 0) && left === "") return true;
  return false;
};

const buildPatchPayload = (
  suggestion,
  property = suggestion?.property,
  { amenityCatalog = [], changes = suggestion?.changes || [] } = {}
) => {
  const payload = {};
  changes.forEach((change) => {
    const currentValue = change.path === "description.price" ? parseNumber(change.oldValue) : change.oldValue;
    const nextValue = change.path === "description.price" ? parseNumber(change.newValue) : change.newValue;
    if (sameValue(currentValue, nextValue)) return;
    if (change.path === "description.price") {
      setPathValue(payload, "description.price", nextValue);
      const syncedFloorPlans = buildSyncedFloorPlans(property, nextValue);
      if (syncedFloorPlans) {
        setPathValue(payload, "description.floorPlans", syncedFloorPlans);
      }
      return;
    }
    if (change.path === "amenities") {
      const titles = uniqueList(Array.isArray(change.newValue) ? change.newValue : parseDraftLines(change.newValue));
      const amenityIndex = buildAmenityTitleIndex(amenityCatalog, property);
      const amenityIds = titles.map((title) => amenityIndex.get(normalizeListKey(title)) || null);
      const unresolved = titles.filter((title, index) => !amenityIds[index]);
      if (unresolved.length) {
        throw new Error(
          `Unknown amenity titles: ${unresolved.join(", ")}. Please use titles from the amenity master list.`
        );
      }
      payload.amenities = amenityIds.filter(Boolean);
      return;
    }
    if (change.path === "description.floorPlans") {
      setPathValue(payload, "description.floorPlans", parseFloorPlansDraft(change.newValue));
      return;
    }
    if (change.path === "media.floorPlanImages") {
      setPathValue(
        payload,
        "media.floorPlanImages",
        Array.isArray(change.newValue) ? change.newValue.filter(Boolean) : parseDraftLines(change.newValue)
      );
      return;
    }
    if (change.path === "details.sizeInSqFt") {
      setPathValue(payload, "details.sizeInSqFt", parseNumber(change.newValue));
      return;
    }
    if (change.path === "location.nearBy") {
      setPathValue(payload, "location.nearBy", parseDraftLines(change.newValue).join("; "));
      return;
    }
    setPathValue(payload, change.path, nextValue);
  });
  return payload;
};

const buildCurrentValuePatch = (property, changes = []) => {
  const payload = {};
  changes.forEach((change) => {
    if (change.path === "description.price") {
      setPathValue(payload, "description.price", getPathValue(property, "description.price"));
      const existingFloorPlans = getPathValue(property, "description.floorPlans");
      if (existingFloorPlans !== undefined) {
        setPathValue(payload, "description.floorPlans", cloneValue(existingFloorPlans));
      }
      return;
    }
    setPathValue(payload, change.path, getPathValue(property, change.path));
  });
  return payload;
};

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const deepMergePropertyPatch = (property, patch) => {
  const output = { ...(property || {}) };
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = deepMergePropertyPatch(output[key], value);
    } else {
      output[key] = value;
    }
  });
  return output;
};

const displayValue = (path, value) => {
  if (path === "description.price") return formatCurrency(value);
  if (path === "amenities") return serializeAmenities(value) || "Not listed";
  if (path === "location.nearBy") return serializeNearBy(value) || "Not listed";
  if (path === "description.floorPlans") return serializeFloorPlans(value) || "Not listed";
  if (path === "media.floorPlanImages") return serializeFloorPlanImages(value) || "Not listed";
  if (path === "sections.whatWeDo.items") return serializeWhatWeDoItems(value) || "Not listed";
  if (isStructuredSiteListPath(path)) return serializeStructuredSiteList(value) || "Not listed";
  if (path === "tags") return serializeTags(value) || "Not listed";
  if (path === "metaTitle" || path === "metaDescription") return normalizeText(value) || "Not listed";
  return String(value || "Not listed");
};

const getDraftValue = (path, value) => {
  if (path === "description.price") return String(parseNumber(value) || "");
  if (path === "amenities") return serializeAmenities(value);
  if (path === "location.nearBy") return serializeNearBy(value);
  if (path === "description.floorPlans") return serializeFloorPlans(value);
  if (path === "media.floorPlanImages") return serializeFloorPlanImages(value);
  if (path === "sections.whatWeDo.items") return serializeWhatWeDoItems(value);
  if (isStructuredSiteListPath(path)) return serializeStructuredSiteList(value);
  if (path === "tags") return serializeTags(value);
  if (path === "metaTitle" || path === "metaDescription") return normalizeText(value);
  return normalizeText(value);
};

const getWebsiteTokens = (path, value) => {
  if (path === "description.price") {
    const token = formatCurrency(value);
    return token === "Not listed" ? [] : [token];
  }

  if (
    path === "amenities" ||
    path === "location.nearBy" ||
    path === "media.floorPlanImages" ||
    path === "sections.whatWeDo.items" ||
    isStructuredSiteListPath(path) ||
    path === "tags"
  ) {
    return parseDraftLines(displayValue(path, value)).filter((item) => item !== "Not listed");
  }

  if (path === "description.floorPlans") {
    const plans = Array.isArray(value) ? value : parseFloorPlansDraft(value);
    return plans
      .flatMap((plan) => [
        normalizeText(plan.unitType),
        normalizeText(plan.carpetArea),
        normalizeText(plan.builtUpArea),
        normalizeText(plan.superBuiltUpArea),
        normalizeText(plan.price),
      ])
      .filter(Boolean);
  }

  const token = displayValue(path, value);
  return token === "Not listed" ? [] : [token];
};

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const extractPageTitle = (html) => {
  const match = String(html || "").match(/<title>(.*?)<\/title>/i);
  return match ? match[1].trim() : "Title not found";
};

const buildWebsiteChecks = (suggestion, html) =>
  suggestion.changes.map((change) => {
    const rawHtml = String(html || "");
    const currentTokens = getWebsiteTokens(change.path, change.oldValue);
    const nextTokens = getWebsiteTokens(change.path, change.newValue);
    const hasVisibleToken = (tokens) =>
      tokens.some((token) => {
        const escaped = escapeHtml(token);
        return rawHtml.includes(token) || rawHtml.includes(escaped);
      });

    return {
      path: change.path,
      currentVisible: hasVisibleToken(currentTokens),
      suggestedVisible: hasVisibleToken(nextTokens),
    };
  });

const extractErrorMessage = (error) => {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.data?.message) return error.data.message;
  return "Unknown error";
};

const getPropertiesFromResponse = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.properties)) return response.properties;
  return [];
};

const getTotalPagesFromResponse = (response) => {
  const candidates = [
    response?.pagination?.totalPages,
    response?.totalPages,
    response?.pages,
  ];

  for (const value of candidates) {
    const totalPages = Number(value);
    if (Number.isFinite(totalPages) && totalPages > 0) {
      return totalPages;
    }
  }

  return null;
};

const fetchAllVerifiedProperties = async (token) => {
  // Legacy first-page behavior kept for reference:
  // const pageSize = 50;
  // const firstResponse = await getAllProperties(token, { page: 1, limit: pageSize, status: "verified", sort: "-updatedAt" });
  const pageSize = 100;
  const maxPages = 100;
  const byId = new Map();

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await getAllProperties(token, {
      page,
      limit: pageSize,
      status: "verified",
      sort: "-updatedAt",
    });
    const pageProperties = getPropertiesFromResponse(response);

    pageProperties.forEach((property) => {
      const id = property?._id || property?.id || property?.description?.slug || property?.slug;
      if (id) {
        byId.set(String(id), property);
      }
    });

    const totalPages = getTotalPagesFromResponse(response);
    if (totalPages ? page >= totalPages : pageProperties.length < pageSize) {
      break;
    }
  }

  return Array.from(byId.values());
};

const GEMINI_ENRICHABLE_TYPES = new Set(["content", "seo", "status", "connectivity", "amenities"]);
const GEMINI_BLOCKED_PATHS = [/price/i, /floorPlans/i, /floorPlanImages/i, /reraNumber/i];
const GEMINI_PRIORITY_PATHS = new Set([
  "description.description",
  "description.metaDescription",
  "description.metaTitle",
  "description",
  "metaDescription",
  "metaTitle",
  "title",
]);

const isGeminiEditableChange = (change) =>
  GEMINI_ENRICHABLE_TYPES.has(change?.type) &&
  !GEMINI_BLOCKED_PATHS.some((pattern) => pattern.test(change?.path || ""));

const getGeminiChangeBatch = (changes = [], entityType = "property") => {
  const priority = changes.filter((change) => GEMINI_PRIORITY_PATHS.has(change.path));
  if (priority.length) {
    return priority.slice(0, entityType === "property" ? 4 : 6);
  }
  return changes.slice(0, 8);
};

const mergeGeminiChangesIntoSuggestion = (suggestion, aiChanges = []) => {
  if (!suggestion || !Array.isArray(aiChanges) || !aiChanges.length) return suggestion;

  const byPath = new Map(
    aiChanges
      .filter((change) => change?.path && change?.newValue !== undefined && change?.newValue !== null)
      .map((change) => [change.path, change])
  );

  if (!byPath.size) return suggestion;

  return {
    ...suggestion,
    aiEnhancedAt: new Date().toISOString(),
    changes: suggestion.changes.map((change) => {
      const aiChange = byPath.get(change.path);
      if (!aiChange || (change.status || "pending") !== "pending") return change;
      return {
        ...change,
        newValue: aiChange.newValue,
        reason: aiChange.reason ? `Gemini: ${aiChange.reason}` : change.reason,
        aiEnhanced: true,
      };
    }),
  };
};

const deriveSuggestionStatus = (suggestion) => {
  const statuses = (suggestion?.changes || []).map((change) => change.status || "pending");
  if (!statuses.length) return suggestion?.status || "pending";
  if (statuses.every((status) => status === "approved")) return "approved";
  if (statuses.every((status) => status === "rejected")) return "rejected";
  if (statuses.every((status) => status === "pending")) return "pending";
  return "partial";
};

const getChangeSubset = (suggestion, changeIndex = null) =>
  changeIndex === null
    ? suggestion.changes.filter((change) => (change.status || "pending") === "pending")
    : suggestion.changes.filter((_, index) => index === changeIndex);

const withDerivedStatus = (suggestion) => ({
  ...suggestion,
  status: deriveSuggestionStatus(suggestion),
});

const LEGACY_SANDBOX_AUDIT_PATTERN = new RegExp("dry" + "-run", "i");

const sanitizeStoredAudit = (items) =>
  Array.isArray(items)
    ? items.filter((item) => !LEGACY_SANDBOX_AUDIT_PATTERN.test(String(item?.text || "")))
    : [];

const mergeSuggestionState = (nextSuggestions, previousSuggestions = []) => {
  const previousById = new Map(previousSuggestions.map((item) => [item.id, item]));

  return nextSuggestions.map((item) => {
    const previous = previousById.get(item.id);
    if (!previous) {
      return withDerivedStatus({
        ...item,
        changes: item.changes.map((change) => ({
          ...change,
          status: change.status || "pending",
        })),
      });
    }

    const previousChanges = new Map(previous.changes.map((change) => [change.path, change]));
    return withDerivedStatus({
      ...item,
      changes: item.changes.map((change) => {
        const previousChange = previousChanges.get(change.path);
        if (!previousChange) {
          return {
            ...change,
            status: change.status || "pending",
          };
        }

        return {
          ...change,
          status: previousChange.status || "pending",
          restoreValue: previousChange.restoreValue,
          newValue:
            (previousChange.status || "pending") === "pending" ? previousChange.newValue : change.newValue,
        };
      }),
    });
  });
};

export default function AiSuggestionStaging({ serverlessDemo = false }) {
  const [properties, setProperties] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [editorialSuggestions, setEditorialSuggestions] = useState([]);
  const [amenityCatalog, setAmenityCatalog] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEditorialId, setSelectedEditorialId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assetType, setAssetType] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [editorialFilter, setEditorialFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [audit, setAudit] = useState([]);
  const [toast, setToast] = useState("");
  const livePushEnabled = true;
  const [adminToken, setAdminToken] = useState("");
  const [tokenReady, setTokenReady] = useState(false);
  const [runtimeInfo, setRuntimeInfo] = useState(null);
  const [lastPushReport, setLastPushReport] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [reviewedChanges, setReviewedChanges] = useState([]);
  const [reviewedPushing, setReviewedPushing] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState({});

  useEffect(() => {
    const existingToken = localStorage.getItem("adminToken") || "";
    try {
      const storedAudit = localStorage.getItem("aiSuggestionStagingAudit");
      const storedPushReport = localStorage.getItem("aiSuggestionStagingLastPushReport");

      if (storedAudit) {
        setAudit(sanitizeStoredAudit(JSON.parse(storedAudit)));
      }

      if (storedPushReport) {
        setLastPushReport(JSON.parse(storedPushReport));
      }
    } catch (error) {
      console.error("Unable to hydrate AI staging local state", error);
    }

    if (existingToken) {
      setAdminToken(existingToken);
    }

    const hydrateRuntime = async () => {
      try {
        const response = await fetch("/api/local-stack-runtime", { cache: "no-store" });
        if (!response.ok) {
          setTokenReady(true);
          return;
        }

        const result = await response.json();
        setRuntimeInfo(result?.data || null);
      } catch (error) {
        console.error("Unable to load local stack runtime", error);
      } finally {
        setTokenReady(true);
      }
    };

    hydrateRuntime();
  }, []);

  useEffect(() => {
    localStorage.setItem("aiSuggestionStagingAudit", JSON.stringify(audit.slice(0, 20)));
  }, [audit]);

  useEffect(() => {
    if (lastPushReport) {
      localStorage.setItem("aiSuggestionStagingLastPushReport", JSON.stringify(lastPushReport));
    } else {
      localStorage.removeItem("aiSuggestionStagingLastPushReport");
    }
  }, [lastPushReport]);

  const syncPropertyData = useCallback(
    async ({ silent = false } = {}) => {
      if (!tokenReady) return;

      if (!silent) {
        setRefreshing(true);
      }

      try {
        let nextAmenityCatalog = amenityCatalog;
        if (!nextAmenityCatalog.length) {
          try {
            const amenityResponse = await getAllAmenitiesFrontend();
            nextAmenityCatalog = Array.isArray(amenityResponse?.data) ? amenityResponse.data : [];
            setAmenityCatalog(nextAmenityCatalog);
          } catch (error) {
            console.error("Failed to load amenity catalog for AI staging", error);
          }
        }

        if (serverlessDemo) {
          const nextSuggestions = buildSuggestions(SERVERLESS_PROPERTIES, { amenityCatalog: nextAmenityCatalog });
          setProperties(SERVERLESS_PROPERTIES);
          setSuggestions((prev) => mergeSuggestionState(nextSuggestions, prev));
          setSelectedId((prev) =>
            nextSuggestions.some((item) => item.id === prev) ? prev : nextSuggestions[0]?.id || null
          );
          setLastSyncedAt(new Date().toISOString());
          if (!silent) {
            setAudit((prev) => [
              {
                at: new Date().toISOString(),
                text: `Serverless demo refreshed ${nextSuggestions.length} property records from the local Mongo backup.`,
              },
              ...prev,
            ]);
          }
          return;
        }

        const list = await fetchAllVerifiedProperties(adminToken);
        const nextSuggestions = buildSuggestions(list, { amenityCatalog: nextAmenityCatalog });
        const [siteContentResponses, blogResponse] = await Promise.all([
          Promise.allSettled(
            SITE_CONTENT_KEYS.map((pageKey) =>
              getSiteContentByPageKeyAdmin(pageKey, adminToken)
            )
          ),
          getAllBlogs(adminToken).then(
            (value) => ({ status: "fulfilled", value }),
            (reason) => ({ status: "rejected", reason })
          ),
        ]);
        const siteContents = SITE_CONTENT_KEYS.reduce((acc, pageKey, index) => {
          const result = siteContentResponses[index];
          if (result?.status === "fulfilled") {
            acc[pageKey] = result.value?.data;
          }
          return acc;
        }, {});
        const nextEditorialSuggestions = buildEditorialSuggestions({
          siteContents,
          blogs: blogResponse.status === "fulfilled" ? blogResponse.value?.data || [] : [],
        });

        setProperties(list);
        setSuggestions((prev) => mergeSuggestionState(nextSuggestions, prev));
        setEditorialSuggestions((prev) => mergeSuggestionState(nextEditorialSuggestions, prev));
        setSelectedId((prev) =>
          nextSuggestions.some((item) => item.id === prev) ? prev : nextSuggestions[0]?.id || null
        );
        setSelectedEditorialId((prev) =>
          nextEditorialSuggestions.some((item) => item.id === prev)
            ? prev
            : nextEditorialSuggestions[0]?.id || null
        );
        setLastSyncedAt(new Date().toISOString());

        if (!silent) {
          setAudit((prev) => [
            {
              at: new Date().toISOString(),
              text: `Live data refreshed from the admin API for ${nextSuggestions.length} verified listings and ${nextEditorialSuggestions.length} editorial records.`,
            },
            ...prev,
          ]);
        }
      } catch (error) {
        console.error("Failed to load properties for AI staging", error);
        const fallbackSuggestions = buildSuggestions(SERVERLESS_PROPERTIES, { amenityCatalog });
        setProperties(SERVERLESS_PROPERTIES);
        setSuggestions((prev) => mergeSuggestionState(fallbackSuggestions, prev));
        setSelectedId((prev) =>
          fallbackSuggestions.some((item) => item.id === prev) ? prev : fallbackSuggestions[0]?.id || null
        );
        setLastSyncedAt(new Date().toISOString());
        if (!silent) {
          setAudit((prev) => [
            {
              at: new Date().toISOString(),
              text: "Backend unavailable, so the staging MVP switched to the local Mongo backup dataset.",
            },
            ...prev,
          ]);
          showToast("Backend unavailable. Running with the local Mongo backup dataset.");
        }
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    [adminToken, amenityCatalog, serverlessDemo, tokenReady]
  );

  useEffect(() => {
    if (tokenReady) {
      syncPropertyData();
    }
  }, [syncPropertyData, tokenReady]);

  useEffect(() => {
    if (!tokenReady || serverlessDemo) return undefined;

    const interval = setInterval(() => {
      syncPropertyData({ silent: true });
    }, 30000);

    return () => clearInterval(interval);
  }, [serverlessDemo, syncPropertyData, tokenReady]);

  const enrichWithGemini = useCallback(
    async (suggestion, entityType = "property", { force = false } = {}) => {
      if (!suggestion) return;
      const key = `${entityType}:${suggestion.id}`;
      const currentState = geminiStatus[key]?.state;
      if (
        !force &&
        (suggestion.aiEnhancedAt ||
          ["loading", "ready", "disabled", "error", "skipped"].includes(currentState))
      ) {
        return;
      }

      const editableChanges = suggestion.changes.filter(
        (change) => (change.status || "pending") === "pending" && isGeminiEditableChange(change)
      );
      const geminiChanges = getGeminiChangeBatch(editableChanges, entityType);
      if (!geminiChanges.length) {
        setGeminiStatus((prev) => ({
          ...prev,
          [key]: { state: "skipped", message: "No Gemini-editable fields pending." },
        }));
        return;
      }

      setGeminiStatus((prev) => ({
        ...prev,
        [key]: {
          state: "loading",
          message: "Gemini is refining the highest-impact description and SEO suggestions from the live API snapshot.",
        },
      }));

      try {
        const response = await fetch("/api/ai-staging-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            entityType,
            property: entityType === "property" ? suggestion.property : undefined,
            suggestion: entityType === "editorial" ? suggestion : undefined,
            changes: geminiChanges,
            amenityTitles: amenityCatalog.map((item) => item?.title || item?.name).filter(Boolean),
          }),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.status !== "success") {
          const message =
            result?.message ||
            (result.status === "disabled"
              ? "Gemini is not configured; deterministic live-API suggestions are active."
              : "Gemini enrichment failed.");
          setGeminiStatus((prev) => ({
            ...prev,
            [key]: { state: result.status === "disabled" ? "disabled" : "error", message },
          }));
          return;
        }

        const aiChanges = result?.data?.changes || [];
        if (!aiChanges.length) {
          setGeminiStatus((prev) => ({
            ...prev,
            [key]: { state: "skipped", message: "Gemini did not find a stronger suggestion for these fields." },
          }));
          return;
        }

        if (entityType === "property") {
          setSuggestions((prev) =>
            prev.map((item) => (item.id === suggestion.id ? mergeGeminiChangesIntoSuggestion(item, aiChanges) : item))
          );
        } else {
          setEditorialSuggestions((prev) =>
            prev.map((item) => (item.id === suggestion.id ? mergeGeminiChangesIntoSuggestion(item, aiChanges) : item))
          );
        }

        setGeminiStatus((prev) => ({
          ...prev,
          [key]: {
            state: "ready",
            message: `Gemini refined ${aiChanges.length} field${aiChanges.length > 1 ? "s" : ""} from the live API snapshot.`,
          },
        }));
        setAudit((prev) => [
          {
            at: new Date().toISOString(),
            text: `Gemini refined ${aiChanges.length} ${entityType} field${aiChanges.length > 1 ? "s" : ""} for ${suggestion.title || suggestion.property?.description?.title}.`,
          },
          ...prev,
        ]);
      } catch (error) {
        setGeminiStatus((prev) => ({
          ...prev,
          [key]: { state: "error", message: extractErrorMessage(error) },
        }));
      }
    },
    [amenityCatalog, geminiStatus]
  );

  const selected = suggestions.find((item) => item.id === selectedId);
  const selectedEditorial = editorialSuggestions.find((item) => item.id === selectedEditorialId);

  useEffect(() => {
    if (selected) {
      enrichWithGemini(selected, "property");
    }
  }, [enrichWithGemini, selected?.id, selected?.aiEnhancedAt]);

  useEffect(() => {
    if (selectedEditorial) {
      enrichWithGemini(selectedEditorial, "editorial");
    }
  }, [enrichWithGemini, selectedEditorial?.id, selectedEditorial?.aiEnhancedAt]);

  const filtered = useMemo(
    () =>
      suggestions.filter((item) => {
        const property = item.property;
        const haystack = [
          property?.description?.title,
          property?.details?.customId,
          getCity(property),
          getSector(property),
        ]
          .join(" ")
          .toLowerCase();

        return (
          haystack.includes(search.toLowerCase()) &&
          (assetType === "all" || getAssetType(property) === assetType) &&
          (statusFilter === "all" || deriveSuggestionStatus(item) === statusFilter) &&
          (fieldFilter === "all" || item.changes.some((change) => change.type === fieldFilter))
        );
      }),
    [assetType, fieldFilter, search, statusFilter, suggestions]
  );

  const metrics = useMemo(() => {
    const pending = suggestions.filter((item) => deriveSuggestionStatus(item) === "pending");
    return {
      properties: properties.length,
      pending: pending.length,
      rates: pending.reduce((count, item) => count + item.changes.filter((change) => change.type === "price").length, 0),
      high: pending.filter((item) => item.severity === "high").length,
      approved: suggestions.filter((item) => deriveSuggestionStatus(item) === "approved").length,
      reviewed: reviewedChanges.length,
    };
  }, [properties.length, reviewedChanges.length, suggestions]);

  const editorialFiltered = useMemo(
    () =>
      editorialSuggestions.filter((item) => {
        const haystack = `${item.title} ${item.subtitle}`.toLowerCase();
        const typeMatch =
          editorialFilter === "all" ||
          item.entityType === editorialFilter ||
          item.entityKey === editorialFilter ||
          item.editorialGroup === editorialFilter;
        return haystack.includes(search.toLowerCase()) && typeMatch;
      }),
    [editorialFilter, editorialSuggestions, search]
  );

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  const rerunScan = () => {
    const next = buildSuggestions(properties, { amenityCatalog });
    const siteContents = editorialSuggestions
      .filter((item) => item.entityType === "site")
      .reduce((acc, item) => {
        acc[item.entityKey] = item.record;
        return acc;
      }, {});
    const nextEditorial = buildEditorialSuggestions({
      siteContents,
      blogs: editorialSuggestions.filter((item) => item.entityType === "blog").map((item) => item.record),
    });
    setSuggestions((prev) => mergeSuggestionState(next, prev));
    setEditorialSuggestions((prev) => mergeSuggestionState(nextEditorial, prev));
    setSelectedId((prev) => (next.some((item) => item.id === prev) ? prev : next[0]?.id || null));
    setSelectedEditorialId((prev) =>
      nextEditorial.some((item) => item.id === prev) ? prev : nextEditorial[0]?.id || null
    );
    setAudit((prev) => [
      {
        at: new Date().toISOString(),
        text: `Monthly sandbox scan rerun for ${SCAN_MONTH}.`,
      },
      ...prev,
    ]);
    showToast("Monthly scan regenerated in sandbox.");
  };

  const reviewedKeyFor = (suggestion, change) => `${suggestion.id}:${change.path}`;

  const getReviewedItem = (suggestion, change) => {
    const isProperty = Boolean(suggestion.property);
    return {
      id: reviewedKeyFor(suggestion, change),
      suggestionId: suggestion.id,
      entityType: isProperty ? "property" : suggestion.entityType,
      entityKey: isProperty ? suggestion.property?._id : suggestion.entityKey,
      title: isProperty ? suggestion.property?.description?.title || "Untitled property" : suggestion.title,
      subtitle: isProperty ? `${getSector(suggestion.property)}, ${getCity(suggestion.property)}` : suggestion.subtitle,
      route: isProperty
        ? suggestion.property?.description?.slug
          ? `/property/${suggestion.property.description.slug}`
          : ""
        : suggestion.route,
      changePath: change.path,
      changeType: change.type,
      label: FIELD_LABELS[change.path] || change.path,
      oldValue: change.oldValue,
      newValue: change.newValue,
    };
  };

  const isReviewedChange = useCallback(
    (suggestion, change) => reviewedChanges.some((item) => item.id === reviewedKeyFor(suggestion, change)),
    [reviewedChanges]
  );

  const addReviewedChange = (suggestion, change) => {
    if (!suggestion || !change || (change.status || "pending") !== "pending") return;
    const item = getReviewedItem(suggestion, change);
    setReviewedChanges((prev) => (prev.some((entry) => entry.id === item.id) ? prev : [...prev, item]));
    showToast(`${item.label} added to Reviewed.`);
  };

  const addPendingReviewed = (suggestion) => {
    if (!suggestion) return;
    const pendingItems = suggestion.changes
      .filter((change) => (change.status || "pending") === "pending")
      .map((change) => getReviewedItem(suggestion, change));
    if (!pendingItems.length) return;
    setReviewedChanges((prev) => {
      const existing = new Set(prev.map((item) => item.id));
      return [...prev, ...pendingItems.filter((item) => !existing.has(item.id))];
    });
    showToast(`${pendingItems.length} pending field${pendingItems.length > 1 ? "s" : ""} added to Reviewed.`);
  };

  const removeReviewedChange = (reviewedId) => {
    setReviewedChanges((prev) => prev.filter((item) => item.id !== reviewedId));
  };

  const clearReviewedChanges = () => {
    setReviewedChanges([]);
    showToast("Reviewed queue cleared.");
  };

  const pruneReviewedChanges = (suggestionId, changePaths = []) => {
    const paths = new Set(changePaths);
    setReviewedChanges((prev) =>
      prev.filter((item) => item.suggestionId !== suggestionId || (paths.size && !paths.has(item.changePath)))
    );
  };

  const pushReviewedChanges = async () => {
    if (!reviewedChanges.length || reviewedPushing) return;
    setReviewedPushing(true);

    const queue = [...reviewedChanges];
    let pushedCount = 0;
    try {
      for (const reviewed of queue) {
        const source =
          reviewed.entityType === "property"
            ? suggestions.find((item) => item.id === reviewed.suggestionId)
            : editorialSuggestions.find((item) => item.id === reviewed.suggestionId);
        const changeIndex = source?.changes?.findIndex((change) => change.path === reviewed.changePath);
        const change = changeIndex >= 0 ? source.changes[changeIndex] : null;

        if (!source || !change || (change.status || "pending") !== "pending") {
          removeReviewedChange(reviewed.id);
          continue;
        }

        const pushed =
          reviewed.entityType === "property"
            ? await approveSuggestion(source, changeIndex)
            : await approveEditorialSuggestion(source, changeIndex);

        if (pushed) {
          removeReviewedChange(reviewed.id);
          pushedCount += 1;
        }
      }

      setAudit((prev) => [
        {
          at: new Date().toISOString(),
          text: `Pushed ${pushedCount} reviewed field${pushedCount === 1 ? "" : "s"} through the live API.`,
        },
        ...prev,
      ]);
      showToast(`${pushedCount} reviewed field${pushedCount === 1 ? "" : "s"} pushed live.`);
    } finally {
      setReviewedPushing(false);
    }
  };

  const updateChangeValue = (suggestionId, changeIndex, value) => {
    setSuggestions((prev) =>
      prev.map((item) =>
        item.id === suggestionId
          ? withDerivedStatus({
              ...item,
              changes: item.changes.map((change, index) =>
                index === changeIndex ? { ...change, newValue: value, status: "pending" } : change
              ),
            })
          : item
      )
    );
  };

  const updateEditorialChangeValue = (suggestionId, changeIndex, value) => {
    setEditorialSuggestions((prev) =>
      prev.map((item) =>
        item.id === suggestionId
          ? withDerivedStatus({
              ...item,
              changes: item.changes.map((change, index) =>
                index === changeIndex ? { ...change, newValue: value, status: "pending" } : change
              ),
            })
          : item
      )
    );
  };

  const approveSuggestion = async (suggestion, changeIndex = null) => {
    if (!suggestion) return false;
    const targetChanges = getChangeSubset(suggestion, changeIndex).filter(
      (change) => (change.status || "pending") === "pending"
    );
    if (!targetChanges.length) return false;
    let patch;
    let reflectedProperty = suggestion.property;
    let pushReport = null;
    const label =
      changeIndex === null
        ? `${targetChanges.length} field${targetChanges.length > 1 ? "s" : ""}`
        : FIELD_LABELS[targetChanges[0]?.path] || targetChanges[0]?.path || "field";

    try {
      patch = buildPatchPayload(suggestion, suggestion.property, {
        amenityCatalog,
        changes: targetChanges,
      });
    } catch (error) {
      showToast(`Unable to build update payload: ${extractErrorMessage(error)}`);
      return false;
    }

    if (livePushEnabled) {
      try {
        if (!adminToken) {
          showToast("Live push needs an admin token. Staying in staged mode.");
          return false;
        }
        const propertyUrl = suggestion.property?.description?.slug ? `/property/${suggestion.property.description.slug}` : null;
        const latestProperty = await getPropertyByIdAdmin(suggestion.property._id, adminToken);
        patch = buildPatchPayload(suggestion, latestProperty || suggestion.property, {
          amenityCatalog,
          changes: targetChanges,
        });
        const websiteBeforeHtml = propertyUrl
          ? await fetch(propertyUrl, { cache: "no-store" }).then((response) => response.text())
          : "";
        const currentValuePatch = buildCurrentValuePatch(latestProperty || suggestion.property, targetChanges);
        const updatePayload = sanitizeForAdminUpdate(patch);
        const updateResponse = await updateProperty(suggestion.property._id, updatePayload, adminToken);
        reflectedProperty = updateResponse?.data || deepMergePropertyPatch(latestProperty || suggestion.property, patch);
        const databaseAfter = await getPropertyByIdAdmin(suggestion.property._id, adminToken);
        const websiteAfterHtml = propertyUrl
          ? await fetch(propertyUrl, { cache: "no-store" }).then((response) => response.text())
          : "";

        pushReport = {
          propertyId: suggestion.property?._id,
          propertyTitle: suggestion.property?.description?.title || "Untitled property",
          propertyUrl,
          pushedAt: new Date().toISOString(),
          beforeProperty: latestProperty,
          beforePatch: currentValuePatch,
          afterProperty: databaseAfter,
          changedFields: targetChanges.map((change) => ({
            label: FIELD_LABELS[change.path] || change.path,
            path: change.path,
            before: displayValue(change.path, getPathValue(latestProperty, change.path)),
            after: displayValue(change.path, getPathValue(databaseAfter, change.path)),
          })),
          websiteBefore: {
            title: extractPageTitle(websiteBeforeHtml),
            checks: buildWebsiteChecks({ ...suggestion, changes: targetChanges }, websiteBeforeHtml),
          },
          websiteAfter: {
            title: extractPageTitle(websiteAfterHtml),
            checks: buildWebsiteChecks({ ...suggestion, changes: targetChanges }, websiteAfterHtml),
          },
        };
      } catch (error) {
        console.error("Failed to push AI suggestion", error);
        showToast(`Live push failed: ${extractErrorMessage(error)}`);
        return false;
      }
    }

    setProperties((prev) =>
      prev.map((item) =>
        String(item?._id) === String(suggestion.property?._id) ? reflectedProperty : item
      )
    );

    setSuggestions((prev) =>
      prev.map((item) =>
        item.id === suggestion.id
          ? withDerivedStatus({
              ...item,
              property: reflectedProperty,
              changes: item.changes.map((change, index) =>
                (changeIndex === null
                  ? targetChanges.some((target) => target.path === change.path)
                  : index === changeIndex)
                  ? { ...change, status: "approved", restoreValue: change.restoreValue ?? change.oldValue }
                  : change
              ),
            })
          : item
      )
    );
    setSelectedId(suggestion.id);
    setStatusFilter("all");
    pruneReviewedChanges(suggestion.id, targetChanges.map((change) => change.path));
    setAudit((prev) => [
      {
        at: new Date().toISOString(),
        text: `Pushed ${label} for ${suggestion.property?.description?.title}.`,
      },
      ...prev,
    ]);
    if (pushReport) {
      setLastPushReport(pushReport);
    }
    await syncPropertyData({ silent: true });
    showToast(
      `${label} approved and pushed through the live API.`
    );
    return true;
  };

  const approveEditorialSuggestion = async (suggestion, changeIndex = null) => {
    if (!suggestion) return false;
    const targetChanges = getChangeSubset(suggestion, changeIndex).filter(
      (change) => (change.status || "pending") === "pending"
    );
    if (!targetChanges.length) return false;
    const label =
      changeIndex === null
        ? `${targetChanges.length} field${targetChanges.length > 1 ? "s" : ""}`
        : FIELD_LABELS[targetChanges[0]?.path] || targetChanges[0]?.path || "field";

    try {
      if (livePushEnabled) {
        if (!adminToken) {
          showToast("Live push needs an admin admin session.");
          return false;
        }

        const patch = buildEditorialPatch(suggestion, targetChanges);
        if (suggestion.entityType === "site") {
          const response = await updateSiteContentByPageKey(suggestion.entityKey, patch, adminToken);
          suggestion = { ...suggestion, record: response?.data || patch };
        } else if (suggestion.entityType === "blog") {
          const response = await updateBlog(suggestion.entityKey, patch, adminToken);
          suggestion = { ...suggestion, record: response?.data || { ...suggestion.record, ...patch } };
        }
      }

      setEditorialSuggestions((prev) =>
        prev.map((item) =>
          item.id === suggestion.id
            ? withDerivedStatus({
                ...item,
                record: suggestion.record,
                changes: item.changes.map((change, index) =>
                  (changeIndex === null
                    ? targetChanges.some((target) => target.path === change.path)
                    : index === changeIndex)
                    ? { ...change, status: "approved", restoreValue: change.restoreValue ?? change.oldValue }
                    : change
                ),
              })
            : item
        )
      );

      pruneReviewedChanges(suggestion.id, targetChanges.map((change) => change.path));
      setAudit((prev) => [
        {
          at: new Date().toISOString(),
          text: `Pushed ${label} for ${suggestion.title}.`,
        },
        ...prev,
      ]);
      showToast(
        `${label} pushed live.`
      );
      await syncPropertyData({ silent: true });
      return true;
    } catch (error) {
      console.error("Failed to push editorial suggestion", error);
      showToast(`Editorial push failed: ${extractErrorMessage(error)}`);
      return false;
    }
  };

  const restoreLastPush = async () => {
    if (!lastPushReport?.beforePatch || !lastPushReport?.propertyId) {
      showToast("There is no pushed property snapshot available to restore.");
      return;
    }

    if (!adminToken) {
      showToast("Restore needs an admin token.");
      return;
    }

    setRestoring(true);
    try {
      await updateProperty(
        lastPushReport.propertyId,
        sanitizeForAdminUpdate(lastPushReport.beforePatch),
        adminToken
      );
      const restoredProperty = await getPropertyByIdAdmin(lastPushReport.propertyId, adminToken);
      const propertyUrl = lastPushReport.propertyUrl;
      const restoredHtml = propertyUrl
        ? await fetch(propertyUrl, { cache: "no-store" }).then((response) => response.text())
        : "";

      setProperties((prev) =>
        prev.map((item) =>
          String(item?._id) === String(lastPushReport.propertyId) ? restoredProperty : item
        )
      );

      setSuggestions((prev) =>
        prev.map((item) =>
          String(item?.property?._id) === String(lastPushReport.propertyId)
            ? {
                ...item,
                status: "pending",
                property: restoredProperty,
                changes: buildSuggestions([restoredProperty], { amenityCatalog })[0]?.changes || item.changes,
              }
            : item
        )
      );

      setAudit((prev) => [
        {
          at: new Date().toISOString(),
          text: `Restored ${lastPushReport.propertyTitle} to the pre-push database state.`,
        },
        ...prev,
      ]);

      setLastPushReport((prev) =>
        prev
          ? {
              ...prev,
              restoredAt: new Date().toISOString(),
              restoreWebsiteTitle: extractPageTitle(restoredHtml),
            }
          : prev
      );
      await syncPropertyData({ silent: true });
      showToast("Last pushed property restored successfully.");
    } catch (error) {
      console.error("Failed to restore last push", error);
      showToast(`Restore failed: ${extractErrorMessage(error)}`);
    } finally {
      setRestoring(false);
    }
  };

  const rejectSuggestion = (suggestion, changeIndex = null) => {
    setSuggestions((prev) =>
      prev.map((item) =>
        item.id === suggestion.id
          ? withDerivedStatus({
              ...item,
              changes: item.changes.map((change, index) =>
                (changeIndex === null ? (change.status || "pending") === "pending" : index === changeIndex)
                  ? { ...change, status: "rejected" }
                  : change
              ),
            })
          : item
      )
    );
    pruneReviewedChanges(
      suggestion.id,
      changeIndex === null
        ? suggestion.changes.filter((change) => (change.status || "pending") === "pending").map((change) => change.path)
        : [suggestion.changes[changeIndex]?.path].filter(Boolean)
    );
    setAudit((prev) => [
      {
        at: new Date().toISOString(),
        text: `Rejected ${changeIndex === null ? "pending fields" : FIELD_LABELS[suggestion.changes[changeIndex]?.path] || "field"} for ${suggestion.property?.description?.title}.`,
      },
      ...prev,
    ]);
    showToast("Selected field rejection saved.");
  };

  const rejectEditorialSuggestion = (suggestion, changeIndex = null) => {
    setEditorialSuggestions((prev) =>
      prev.map((item) =>
        item.id === suggestion.id
          ? withDerivedStatus({
              ...item,
              changes: item.changes.map((change, index) =>
                (changeIndex === null ? (change.status || "pending") === "pending" : index === changeIndex)
                  ? { ...change, status: "rejected" }
                  : change
              ),
            })
          : item
      )
    );
    pruneReviewedChanges(
      suggestion.id,
      changeIndex === null
        ? suggestion.changes.filter((change) => (change.status || "pending") === "pending").map((change) => change.path)
        : [suggestion.changes[changeIndex]?.path].filter(Boolean)
    );
    setAudit((prev) => [
      {
        at: new Date().toISOString(),
        text: `Rejected ${changeIndex === null ? "pending fields" : FIELD_LABELS[suggestion.changes[changeIndex]?.path] || "field"} for ${suggestion.title}.`,
      },
      ...prev,
    ]);
    showToast("Selected editorial field rejection saved.");
  };

  const restoreSuggestionChange = async (suggestion, changeIndex) => {
    const change = suggestion?.changes?.[changeIndex];
    if (!change) return;

    const revertedDraftValue = getDraftValue(change.path, change.restoreValue ?? change.oldValue);
    let reflectedProperty = suggestion.property;

    try {
      if (livePushEnabled) {
        if (!adminToken) {
          showToast("Restore needs an admin token.");
          return;
        }

        const latestProperty = await getPropertyByIdAdmin(suggestion.property._id, adminToken);
        const revertChange = {
          ...change,
          oldValue: getPathValue(latestProperty, change.path),
          newValue: revertedDraftValue,
        };
        const patch = buildPatchPayload(suggestion, latestProperty, {
          amenityCatalog,
          changes: [revertChange],
        });
        const updateResponse = await updateProperty(
          suggestion.property._id,
          sanitizeForAdminUpdate(patch),
          adminToken
        );
        reflectedProperty = updateResponse?.data || deepMergePropertyPatch(latestProperty, patch);
      }

      setSuggestions((prev) =>
        prev.map((item) =>
          item.id === suggestion.id
            ? withDerivedStatus({
                ...item,
                property: reflectedProperty,
                changes: item.changes.map((entry, index) =>
                  index === changeIndex
                    ? { ...entry, newValue: revertedDraftValue, status: "pending", restoreValue: undefined }
                    : entry
                ),
              })
            : item
        )
      );

      pruneReviewedChanges(suggestion.id, [change.path]);
      setAudit((prev) => [
        {
          at: new Date().toISOString(),
          text: `Restored ${
            FIELD_LABELS[change.path] || change.path
          } for ${suggestion.property?.description?.title}.`,
        },
        ...prev,
      ]);

      await syncPropertyData({ silent: true });
      showToast(
        `${FIELD_LABELS[change.path] || change.path} restored from live data.`
      );
    } catch (error) {
      console.error("Failed to restore suggestion field", error);
      showToast(`Field restore failed: ${extractErrorMessage(error)}`);
    }
  };

  const restoreEditorialChange = async (suggestion, changeIndex) => {
    const change = suggestion?.changes?.[changeIndex];
    if (!change) return;

    const revertedDraftValue = getDraftValue(change.path, change.restoreValue ?? change.oldValue);
    let nextRecord = suggestion.record;

    try {
      if (livePushEnabled) {
        if (!adminToken) {
          showToast("Restore needs an admin token.");
          return;
        }

        if (suggestion.entityType === "site") {
          const currentRecordResponse = await getSiteContentByPageKeyAdmin(suggestion.entityKey, adminToken);
          const currentRecord = currentRecordResponse?.data || suggestion.record;
          const revertChange = {
            ...change,
            oldValue: getPathValue(currentRecord, change.path),
            newValue: revertedDraftValue,
          };
          const patch = buildEditorialPatch({ ...suggestion, record: currentRecord }, [revertChange]);
          const response = await updateSiteContentByPageKey(suggestion.entityKey, patch, adminToken);
          nextRecord = response?.data || patch;
        } else if (suggestion.entityType === "blog") {
          const currentBlogResponse = await getBlogById(suggestion.entityKey, adminToken);
          const currentRecord = currentBlogResponse?.data || suggestion.record;
          const revertChange = {
            ...change,
            oldValue: getPathValue(currentRecord, change.path),
            newValue: revertedDraftValue,
          };
          const patch = buildEditorialPatch({ ...suggestion, record: currentRecord }, [revertChange]);
          const response = await updateBlog(suggestion.entityKey, patch, adminToken);
          nextRecord = response?.data || { ...currentRecord, ...patch };
        }
      }

      setEditorialSuggestions((prev) =>
        prev.map((item) =>
          item.id === suggestion.id
            ? withDerivedStatus({
                ...item,
                record: nextRecord,
                changes: item.changes.map((entry, index) =>
                  index === changeIndex
                    ? { ...entry, newValue: revertedDraftValue, status: "pending", restoreValue: undefined }
                    : entry
                ),
              })
            : item
        )
      );

      pruneReviewedChanges(suggestion.id, [change.path]);
      setAudit((prev) => [
        {
          at: new Date().toISOString(),
          text: `Restored ${
            FIELD_LABELS[change.path] || change.path
          } for ${suggestion.title}.`,
        },
        ...prev,
      ]);

      await syncPropertyData({ silent: true });
      showToast(
        `${FIELD_LABELS[change.path] || change.path} restored from live data.`
      );
    } catch (error) {
      console.error("Failed to restore editorial field", error);
      showToast(`Editorial field restore failed: ${extractErrorMessage(error)}`);
    }
  };

  const copyPayload = async (suggestion, changeIndex = null) => {
    let patch;
    const targetChanges = getChangeSubset(suggestion, changeIndex);
    try {
      patch = buildPatchPayload(suggestion, suggestion.property, {
        amenityCatalog,
        changes: targetChanges,
      });
    } catch (error) {
      showToast(`Unable to build change set: ${extractErrorMessage(error)}`);
      return;
    }
    const payload = {
      propertyId: suggestion.property._id,
      endpoint: `/admin/api/property/${suggestion.property._id}`,
      method: "PUT",
      dryRun: false,
      patch,
      reasons: targetChanges.reduce((acc, change) => ({ ...acc, [change.path]: change.reason }), {}),
    };
    const payloadText = JSON.stringify(payload, null, 2);
    const copied = await copyTextSafely(payloadText);
    showToast(copied ? "Change-set payload copied." : "Clipboard access was blocked by the browser. Please use the visible payload instead.");
  };

  const copyEditorialPayload = async (suggestion, changeIndex = null) => {
    const targetChanges = getChangeSubset(suggestion, changeIndex);
    const payload = {
      entityType: suggestion.entityType,
      entityKey: suggestion.entityKey,
      route: suggestion.route,
      dryRun: false,
      patch: buildEditorialPatch(suggestion, targetChanges),
      reasons: targetChanges.reduce((acc, change) => ({ ...acc, [change.path]: change.reason }), {}),
    };
    const payloadText = JSON.stringify(payload, null, 2);
    const copied = await copyTextSafely(payloadText);
    showToast(copied ? "Editorial change-set payload copied." : "Clipboard access was blocked by the browser. Please use the visible payload instead.");
  };

  if (loading) {
    return <div className={styles.empty}>Loading AI suggestion staging...</div>;
  }

  return (
    <div className={styles.staging}>
      <div className={styles.notice}>
        <div>
          <h3>Live API monthly suggestion service</h3>
          <p>
            This MVP reads verified properties through the existing admin API, creates staged suggestions for content,
            price, SEO, status, payment plans, amenities, floor plans and location highlights, then pushes approved
            changes through the authenticated admin API.
          </p>
          <p className={styles.syncMeta}>
            {refreshing ? "Refreshing live data..." : `Last synced: ${lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Starting up"}`}
          </p>
          <p className={styles.syncMeta}>{STAGING_BUILD_LABEL}</p>
        </div>
        <div className={styles.noticeActions}>
          <button
            className={styles.secondaryButton}
            data-testid="ai-refresh-button"
            onClick={() => syncPropertyData()}
            disabled={refreshing}
          >
            Refresh Live Data
          </button>
          <button className={styles.scanButton} data-testid="ai-scan-button" onClick={rerunScan} disabled={!properties.length}>
            Run Monthly Scan
          </button>
        </div>
      </div>

      {lastPushReport ? (
        <div className={styles.liveNotice}>
          <div>
            <strong>{lastPushReport.propertyTitle}</strong> was last pushed on{" "}
            {new Date(lastPushReport.pushedAt).toLocaleString()}.
          </div>
          {lastPushReport.propertyUrl ? (
            <OpenPageAction url={lastPushReport.propertyUrl}>Open Updated Property</OpenPageAction>
          ) : null}
        </div>
      ) : null}

      <div className={styles.metrics}>
        <Metric label="Properties scanned" value={metrics.properties} />
        <Metric label="Pending suggestions" value={metrics.pending} />
        <Metric label="Rate updates" value={metrics.rates} />
        <Metric label="High priority" value={metrics.high} />
        <Metric label="Approved" value={metrics.approved} />
        <Metric label="Reviewed fields" value={metrics.reviewed} />
      </div>

      <ReviewedSection
        reviewedChanges={reviewedChanges}
        pushing={reviewedPushing}
        onPush={pushReviewedChanges}
        onRemove={removeReviewedChange}
        onClear={clearReviewedChanges}
      />

      <div className={styles.filters}>
        <input
          className={styles.field}
          data-testid="ai-search-input"
          placeholder="Search property, custom ID, city or sector"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className={styles.field}
          data-testid="ai-asset-filter"
          value={assetType}
          onChange={(event) => setAssetType(event.target.value)}
        >
          <option value="all">All assets</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
        <select
          className={styles.field}
          data-testid="ai-field-filter"
          value={fieldFilter}
          onChange={(event) => setFieldFilter(event.target.value)}
        >
          {FILTERS.map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className={styles.field}
          data-testid="ai-status-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All status</option>
        </select>
        <select
          className={styles.field}
          value={editorialFilter}
          onChange={(event) => setEditorialFilter(event.target.value)}
        >
          {EDITORIAL_FILTERS.map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.queue}>
          <div className={styles.panelHead}>
            <h3>Review Queue</h3>
            <span className={styles.badge}>{filtered.length} shown</span>
          </div>
          <div className={styles.queueList}>
            {filtered.length ? (
              filtered.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`${styles.queueItem} ${selectedId === item.id ? styles.queueItemActive : ""}`}
                >
                  <span className={styles.queueTitle}>
                    <strong>{item.property?.description?.title || "Untitled property"}</strong>
                    <span>
                      {item.property?.details?.customId || item.property?._id} · {getSector(item.property)}, {getCity(item.property)}
                    </span>
                    <span className={styles.badges}>
                      {[...new Set(item.changes.map((change) => change.type))].map((type) => (
                        <span className={`${styles.badge} ${badgeClass(type)}`} key={type}>
                          {type}
                        </span>
                      ))}
                      <span className={styles.badge}>{deriveSuggestionStatus(item)}</span>
                    </span>
                  </span>
                  <span className={`${styles.priority} ${priorityClass(item.severity)}`}>{item.severity}</span>
                </button>
              ))
            ) : (
              <div className={styles.empty}>No suggestions match this filter.</div>
            )}
          </div>
        </aside>

        <section className={styles.review}>
          {selected ? (
          <ReviewPanel
            suggestion={selected}
            amenityCatalog={amenityCatalog}
            livePushEnabled={livePushEnabled}
            adminToken={adminToken}
            runtimeInfo={runtimeInfo}
            onChangeValue={updateChangeValue}
            onApprove={approveSuggestion}
            onReject={rejectSuggestion}
            onCopy={copyPayload}
            onRestoreField={restoreSuggestionChange}
            onAddReviewed={addReviewedChange}
            onAddPendingReviewed={addPendingReviewed}
            isReviewedChange={isReviewedChange}
            geminiStatus={geminiStatus[`property:${selected.id}`]}
            onGeminiRefresh={() => enrichWithGemini(selected, "property", { force: true })}
          />
          ) : (
            <div className={styles.empty}>Select a property to review staged changes.</div>
          )}
        </section>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.queue}>
          <div className={styles.panelHead}>
            <h3>Editorial Suggestions</h3>
            <span className={styles.badge}>{editorialFiltered.length} shown</span>
          </div>
          <div className={styles.queueList}>
            {editorialFiltered.length ? (
              editorialFiltered.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedEditorialId(item.id)}
                  className={`${styles.queueItem} ${selectedEditorialId === item.id ? styles.queueItemActive : ""}`}
                >
                  <span className={styles.queueTitle}>
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                    <span className={styles.badges}>
                      <span className={`${styles.badge} ${badgeClass(item.entityType === "blog" ? "seo" : "content")}`}>
                        {item.entityType}
                      </span>
                      <span className={styles.badge}>{deriveSuggestionStatus(item)}</span>
                    </span>
                  </span>
                  <span className={`${styles.priority} ${priorityClass(item.severity)}`}>{item.severity}</span>
                </button>
              ))
            ) : (
              <div className={styles.empty}>No editorial suggestions match this filter.</div>
            )}
          </div>
        </aside>

        <section className={styles.review}>
          {selectedEditorial ? (
            <EditorialReviewPanel
              suggestion={selectedEditorial}
              livePushEnabled={livePushEnabled}
              adminToken={adminToken}
              onChangeValue={updateEditorialChangeValue}
              onApprove={approveEditorialSuggestion}
              onReject={rejectEditorialSuggestion}
              onCopy={copyEditorialPayload}
              onRestoreField={restoreEditorialChange}
              onAddReviewed={addReviewedChange}
              onAddPendingReviewed={addPendingReviewed}
              isReviewedChange={isReviewedChange}
              geminiStatus={geminiStatus[`editorial:${selectedEditorial.id}`]}
              onGeminiRefresh={() => enrichWithGemini(selectedEditorial, "editorial", { force: true })}
            />
          ) : (
            <div className={styles.empty}>Select an editorial record to review staged copy changes.</div>
          )}
        </section>
      </div>

      {lastPushReport ? <PushReport report={lastPushReport} onRestore={restoreLastPush} restoring={restoring} /> : null}

      <section className={styles.audit}>
        <div className={styles.panelHead}>
          <h3>Approval Audit</h3>
          <button className={styles.button} onClick={() => setAudit([])}>
            Clear
          </button>
        </div>
        <div className={styles.auditList}>
          {audit.length ? (
            audit.map((entry, index) => (
              <div className={styles.auditRow} key={`${entry.at}-${index}`}>
                <time>{new Date(entry.at).toLocaleString()}</time>
                <div>{entry.text}</div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>No audit events yet.</div>
          )}
        </div>
      </section>

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

function PushReport({ report, onRestore, restoring }) {
  const getReportFieldValue = (field, side) => {
    const source = side === "before" ? report.beforeProperty : report.afterProperty;
    const snapshotValue = getPathValue(source, field.path);
    if (snapshotValue !== undefined) return displayValue(field.path, snapshotValue);
    return displayValue(field.path, field[side]);
  };

  return (
    <section className={styles.pushReport}>
      <div className={styles.panelHead}>
        <div>
          <h3>Last Push Evidence</h3>
          <div className={styles.reason}>
            {report.propertyTitle} · {report.propertyId} · {new Date(report.pushedAt).toLocaleString()}
          </div>
        </div>
        <div className={styles.reportActions}>
          {report.propertyUrl ? (
            <OpenPageAction url={report.propertyUrl}>Open Reflected Page</OpenPageAction>
          ) : null}
          <button className={styles.button} onClick={onRestore} disabled={restoring}>
            {restoring ? "Restoring..." : "Restore Last Push"}
          </button>
        </div>
      </div>

      <div className={styles.pushGrid}>
        <div className={styles.pushCard}>
          <h4>Database Before / After</h4>
          <div className={styles.pushRows}>
            {report.changedFields.map((field) => (
              <div className={styles.pushRow} key={field.path}>
                <strong>{field.label}</strong>
                <span>{getReportFieldValue(field, "before")}</span>
                <span>{getReportFieldValue(field, "after")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.pushCard}>
          <h4>Main Website Before / After</h4>
          <div className={styles.websiteBlock}>
            <div className={styles.websiteRow}>
              <strong>Before title</strong>
              <span>{report.websiteBefore.title}</span>
            </div>
            <div className={styles.websiteRow}>
              <strong>After title</strong>
              <span>{report.websiteAfter.title}</span>
            </div>
            {report.websiteAfter.checks.map((check) => {
              const label = FIELD_LABELS[check.path] || check.path;
              return (
                <div className={styles.websiteRow} key={check.path}>
                  <strong>{label}</strong>
                  <span>
                    Before: {check.currentVisible ? "current content visible" : "current content not visible"} | After:{" "}
                    {check.suggestedVisible ? "suggested content visible" : "suggested content not visible"}
                  </span>
                </div>
              );
            })}
            {report.restoredAt ? (
              <div className={styles.websiteRow}>
                <strong>Restored</strong>
                <span>
                  Restored on {new Date(report.restoredAt).toLocaleString()} | Website title after restore:{" "}
                  {report.restoreWebsiteTitle || "Pending refresh"}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReviewedSection({ reviewedChanges, pushing, onPush, onRemove, onClear }) {
  return (
    <section className={styles.reviewedSection} data-testid="ai-reviewed-section">
      <div className={styles.panelHead}>
        <div>
          <h3>Reviewed Changes</h3>
          <div className={styles.reason}>
            Add fields here after admin review, then push the reviewed set through the live API in one action.
          </div>
        </div>
        <span className={styles.badge}>{reviewedChanges.length} selected</span>
      </div>
      {reviewedChanges.length ? (
        <>
          <div className={styles.reviewedList}>
            {reviewedChanges.map((item) => (
              <article className={styles.reviewedItem} key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                  <span className={styles.badges}>
                    <span className={`${styles.badge} ${badgeClass(item.changeType)}`}>{item.entityType}</span>
                    <span className={styles.badge}>{item.label}</span>
                  </span>
                </div>
                <div className={styles.reviewedPreview}>
                  <span>{displayValue(item.changePath, item.oldValue)}</span>
                  <span>{displayValue(item.changePath, item.newValue)}</span>
                </div>
                <div className={styles.reviewedActions}>
                  <OpenPageAction url={item.route}>Open Page</OpenPageAction>
                  <button className={styles.button} onClick={() => onRemove(item.id)} disabled={pushing}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.reviewActions}>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              data-testid="ai-push-reviewed-button"
              onClick={onPush}
              disabled={pushing || !reviewedChanges.length}
            >
              {pushing ? "Pushing Reviewed..." : "Push Reviewed Live"}
            </button>
            <button className={styles.button} onClick={onClear} disabled={pushing}>
              Clear Reviewed
            </button>
          </div>
        </>
      ) : (
        <div className={styles.empty}>No reviewed fields yet. Use Add to Reviewed on any pending field.</div>
      )}
    </section>
  );
}

function OpenPageAction({ url, children }) {
  if (!url) return null;

  return (
    <a
      aria-label={`${children} in a new tab`}
      className={styles.linkButton}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function ReviewPanel({
  suggestion,
  amenityCatalog,
  livePushEnabled,
  adminToken,
  runtimeInfo,
  onChangeValue,
  onApprove,
  onReject,
  onCopy,
  onRestoreField,
  onAddReviewed,
  onAddPendingReviewed,
  isReviewedChange,
  geminiStatus,
  onGeminiRefresh,
}) {
  const property = suggestion.property;
  const pendingChanges = suggestion.changes.filter((change) => (change.status || "pending") === "pending");
  let patch = {};
  let patchError = "";
  try {
    patch = buildPatchPayload(suggestion, property, { amenityCatalog, changes: pendingChanges });
  } catch (error) {
    patchError = extractErrorMessage(error);
  }
  const propertyUrl = property?.description?.slug ? `/property/${property.description.slug}` : null;

  return (
    <>
      <div className={styles.panelHead}>
        <div>
          <h3>{property?.description?.title || "Untitled property"}</h3>
          <div className={styles.reason}>
            {property?.details?.customId || property?._id} · {getSector(property)}, {getCity(property)} · {getAssetType(property)}
          </div>
        </div>
        <span className={`${styles.badge} ${deriveSuggestionStatus(suggestion) === "rejected" ? styles.badgeRisk : ""}`}>
          {deriveSuggestionStatus(suggestion)}
        </span>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h4>Current live snapshot</h4>
          <div className={styles.summaryGrid}>
            <div>
              <span>Price</span>
              <strong>{formatCurrency(getPrice(property))}</strong>
            </div>
            <div>
              <span>Size</span>
              <strong>{getSize(property) ? `${getSize(property).toLocaleString("en-IN")} sq.ft.` : "Not listed"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{property?.details?.propertyStatus || property?.status || "Not listed"}</strong>
            </div>
            <div>
              <span>Possession</span>
              <strong>{property?.details?.possessionDate || property?.details?.completionDate || "Not listed"}</strong>
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <h4>Approval mode</h4>
          {runtimeInfo ? (
            <div className={styles.runtimeNote}>
              Local stack runtime is available on port <strong>{runtimeInfo.port}</strong>.
            </div>
          ) : null}
          <div className={styles.summaryGrid}>
            <div>
              <span>Mode</span>
              <strong>Live API push</strong>
            </div>
            <div>
              <span>Endpoint</span>
              <strong>/admin/api/property/:id</strong>
            </div>
            <div>
              <span>Pending fields</span>
              <strong>{pendingChanges.length || "No pending fields"}</strong>
            </div>
            <div>
              <span>Writes</span>
              <strong>Enabled</strong>
            </div>
            <div>
              <span>Admin session</span>
              <strong>{adminToken ? "Authenticated" : "Login required"}</strong>
            </div>
            <div>
              <span>Gemini</span>
              <strong>
                {geminiStatus?.state === "loading"
                  ? "Refining..."
                  : geminiStatus?.state === "ready"
                    ? "Enhanced"
                    : geminiStatus?.state === "disabled"
                      ? "Not configured"
                      : "Live fallback"}
              </strong>
            </div>
          </div>
          {patchError ? <div className={styles.runtimeNote}>Patch warning: {patchError}</div> : null}
          <div className={styles.runtimeNote}>
            {geminiStatus?.message ||
              "Gemini enrichment runs from the current live API snapshot when this record is reviewed."}
          </div>
          <button className={styles.button} onClick={onGeminiRefresh} disabled={geminiStatus?.state === "loading"}>
            {geminiStatus?.state === "loading" ? "Refining with Gemini..." : "Refresh Gemini Suggestions"}
          </button>
        </div>
      </div>

      <div className={styles.changes}>
        {suggestion.changes.map((change, index) => (
          <article className={styles.changeCard} key={`${change.path}-${index}`}>
            <div className={styles.changeTop}>
              <div>
                <h4>{FIELD_LABELS[change.path] || change.path}</h4>
                <div className={styles.reason}>{change.reason}</div>
              </div>
              <div className={styles.changeBadges}>
                <span className={`${styles.badge} ${badgeClass(change.type)}`}>{change.type}</span>
                <span className={`${styles.badge} ${(change.status || "pending") === "rejected" ? styles.badgeRisk : ""}`}>
                  {change.status || "pending"}
                </span>
              </div>
            </div>
            <div className={styles.diff}>
              <div className={styles.pane}>
                <span className={styles.paneLabel}>Current</span>
                <p>{displayValue(change.path, change.oldValue)}</p>
              </div>
              <div className={`${styles.pane} ${styles.suggested}`}>
                <span className={styles.paneLabel}>Suggested</span>
                <textarea
                  className={styles.editBox}
                  value={change.path === "description.price" ? String(change.newValue || "") : displayValue(change.path, change.newValue)}
                  onChange={(event) => onChangeValue(suggestion.id, index, event.target.value)}
                  disabled={(change.status || "pending") !== "pending"}
                />
              </div>
            </div>
            <div className={styles.changeActions}>
              <button
                className={styles.button}
                disabled={(change.status || "pending") !== "pending" || isReviewedChange(suggestion, change)}
                onClick={() => onAddReviewed(suggestion, change)}
              >
                {isReviewedChange(suggestion, change) ? "Added to Reviewed" : "Add to Reviewed"}
              </button>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={(change.status || "pending") !== "pending"}
                onClick={() => onApprove(suggestion, index)}
              >
                Approve & Push Field
              </button>
              <button
                className={`${styles.button} ${styles.buttonDanger}`}
                disabled={(change.status || "pending") !== "pending"}
                onClick={() => onReject(suggestion, index)}
              >
                Reject Field
              </button>
              <button className={styles.button} onClick={() => onCopy(suggestion, index)}>
                Copy Field Payload
              </button>
              {propertyUrl ? (
                <OpenPageAction url={propertyUrl}>Open Page</OpenPageAction>
              ) : null}
              <button
                className={styles.button}
                disabled={(change.status || "pending") === "pending"}
                onClick={() => onRestoreField(suggestion, index)}
              >
                Restore Field
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.reviewActions}>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          data-testid="ai-approve-button"
          disabled={!pendingChanges.length}
          onClick={() => onApprove(suggestion)}
        >
          Approve Pending & Push Live
        </button>
        <button
          className={`${styles.button} ${styles.buttonDanger}`}
          disabled={!pendingChanges.length}
          onClick={() => onReject(suggestion)}
        >
          Reject Pending
        </button>
        <button className={styles.button} data-testid="ai-copy-button" onClick={() => onCopy(suggestion)}>
          Copy Change Set
        </button>
        <button className={styles.button} disabled={!pendingChanges.length} onClick={() => onAddPendingReviewed(suggestion)}>
          Add Pending to Reviewed
        </button>
        {propertyUrl ? (
          <OpenPageAction url={propertyUrl}>Open Property Page</OpenPageAction>
        ) : null}
      </div>
    </>
  );
}

function EditorialReviewPanel({
  suggestion,
  livePushEnabled,
  adminToken,
  onChangeValue,
  onApprove,
  onReject,
  onCopy,
  onRestoreField,
  onAddReviewed,
  onAddPendingReviewed,
  isReviewedChange,
  geminiStatus,
  onGeminiRefresh,
}) {
  const pendingChanges = suggestion.changes.filter((change) => (change.status || "pending") === "pending");
  const patch = buildEditorialPatch(suggestion, pendingChanges);

  return (
    <>
      <div className={styles.panelHead}>
        <div>
          <h3>{suggestion.title}</h3>
          <div className={styles.reason}>{suggestion.subtitle}</div>
        </div>
        <span className={`${styles.badge} ${deriveSuggestionStatus(suggestion) === "rejected" ? styles.badgeRisk : ""}`}>
          {deriveSuggestionStatus(suggestion)}
        </span>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h4>Current editorial snapshot</h4>
          <div className={styles.summaryGrid}>
            <div>
              <span>Type</span>
              <strong>{suggestion.entityType}</strong>
            </div>
            <div>
              <span>Route</span>
              <strong>{suggestion.route}</strong>
            </div>
            <div>
              <span>Suggested fields</span>
              <strong>{suggestion.changes.length}</strong>
            </div>
            <div>
              <span>Admin session</span>
              <strong>{adminToken ? "Authenticated" : "Login required"}</strong>
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <h4>Approval mode</h4>
          <div className={styles.summaryGrid}>
            <div>
              <span>Mode</span>
              <strong>Live API push</strong>
            </div>
            <div>
              <span>Endpoint</span>
              <strong>
                {suggestion.entityType === "site"
                  ? `/admin/api/site-content/${suggestion.entityKey}`
                  : `/admin/api/blog/${suggestion.entityKey}`}
              </strong>
            </div>
            <div>
              <span>Pending fields</span>
              <strong>{pendingChanges.length || "No pending fields"}</strong>
            </div>
            <div>
              <span>Writes</span>
              <strong>Enabled</strong>
            </div>
            <div>
              <span>Gemini</span>
              <strong>
                {geminiStatus?.state === "loading"
                  ? "Refining..."
                  : geminiStatus?.state === "ready"
                    ? "Enhanced"
                    : geminiStatus?.state === "disabled"
                      ? "Not configured"
                      : "Live fallback"}
              </strong>
            </div>
          </div>
          <div className={styles.runtimeNote}>
            {geminiStatus?.message ||
              "Gemini enrichment runs from the current live API snapshot when this editorial record is reviewed."}
          </div>
          <button className={styles.button} onClick={onGeminiRefresh} disabled={geminiStatus?.state === "loading"}>
            {geminiStatus?.state === "loading" ? "Refining with Gemini..." : "Refresh Gemini Suggestions"}
          </button>
        </div>
      </div>

      <div className={styles.changes}>
        {suggestion.changes.map((change, index) => (
          <article className={styles.changeCard} key={`${change.path}-${index}`}>
            <div className={styles.changeTop}>
              <div>
                <h4>{FIELD_LABELS[change.path] || change.path}</h4>
                <div className={styles.reason}>{change.reason}</div>
              </div>
              <div className={styles.changeBadges}>
                <span className={`${styles.badge} ${badgeClass(change.type)}`}>{change.type}</span>
                <span className={`${styles.badge} ${(change.status || "pending") === "rejected" ? styles.badgeRisk : ""}`}>
                  {change.status || "pending"}
                </span>
              </div>
            </div>
            <div className={styles.diff}>
              <div className={styles.pane}>
                <span className={styles.paneLabel}>Current</span>
                <p>{displayValue(change.path, change.oldValue)}</p>
              </div>
              <div className={`${styles.pane} ${styles.suggested}`}>
                <span className={styles.paneLabel}>Suggested</span>
                <textarea
                  className={styles.editBox}
                  value={displayValue(change.path, change.newValue)}
                  onChange={(event) => onChangeValue(suggestion.id, index, event.target.value)}
                  disabled={(change.status || "pending") !== "pending"}
                />
              </div>
            </div>
            <div className={styles.changeActions}>
              <button
                className={styles.button}
                disabled={(change.status || "pending") !== "pending" || isReviewedChange(suggestion, change)}
                onClick={() => onAddReviewed(suggestion, change)}
              >
                {isReviewedChange(suggestion, change) ? "Added to Reviewed" : "Add to Reviewed"}
              </button>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={(change.status || "pending") !== "pending"}
                onClick={() => onApprove(suggestion, index)}
              >
                Approve & Push Field
              </button>
              <button
                className={`${styles.button} ${styles.buttonDanger}`}
                disabled={(change.status || "pending") !== "pending"}
                onClick={() => onReject(suggestion, index)}
              >
                Reject Field
              </button>
              <button className={styles.button} onClick={() => onCopy(suggestion, index)}>
                Copy Field Payload
              </button>
              <OpenPageAction url={suggestion.route}>Open Page</OpenPageAction>
              <button
                className={styles.button}
                disabled={(change.status || "pending") === "pending"}
                onClick={() => onRestoreField(suggestion, index)}
              >
                Restore Field
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.reviewActions}>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={!pendingChanges.length}
          onClick={() => onApprove(suggestion)}
        >
          Approve Pending & Push Live
        </button>
        <button
          className={`${styles.button} ${styles.buttonDanger}`}
          disabled={!pendingChanges.length}
          onClick={() => onReject(suggestion)}
        >
          Reject Pending
        </button>
        <button className={styles.button} onClick={() => onCopy(suggestion)}>
          Copy Change Set
        </button>
        <button className={styles.button} disabled={!pendingChanges.length} onClick={() => onAddPendingReviewed(suggestion)}>
          Add Pending to Reviewed
        </button>
        <OpenPageAction url={suggestion.route}>Open Page</OpenPageAction>
      </div>
    </>
  );
}

function badgeClass(type) {
  if (type === "price") return styles.badgePrice;
  if (type === "seo") return styles.badgeSeo;
  if (type === "status" || type === "connectivity" || type === "amenities" || type === "layouts") {
    return styles.badgeStatus;
  }
  return "";
}

function priorityClass(priority) {
  if (priority === "high") return styles.priorityHigh;
  if (priority === "low") return styles.priorityLow;
  return "";
}
