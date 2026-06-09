import DefaultHeader from "@/components/common/DefaultHeader";

import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";

import ProperteyFiltering from "@/components/listing/grid-view/properties/ProperteyFiltering";

import { parsePropertiesListingPath } from "@/lib/listingPath";
import React, { Suspense } from "react";
import { getCategoryBySlug } from "@/api/category";
import { getAreaByIdFrontend, getAreaBySlug } from "@/api/area";
import { getCityByIdFrontend, getCityByName } from "@/api/city";

const toLabel = (value = "") =>
  String(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const looksLikeObjectId = (value = "") => /^[a-f\d]{24}$/i.test(String(value).trim());

const getResponseEntity = (response) => response?.data || response?.city || response?.area || response || null;

const resolveCityLabel = async (cityKey = "") => {
  const key = String(cityKey || "").trim();
  if (!key) return "";
  if (looksLikeObjectId(key)) {
    try {
      const city = getResponseEntity(await getCityByIdFrontend(key));
      return city?.name || city?.title || "";
    } catch {
      return "";
    }
  }
  try {
    const city = getResponseEntity(await getCityByName(key));
    return city?.name || city?.title || toLabel(key);
  } catch {
    return toLabel(key);
  }
};

const resolveAreaLabel = async (areaKey = "") => {
  const key = String(areaKey || "").trim();
  if (!key) return "";
  try {
    const area = getResponseEntity(
      await (looksLikeObjectId(key) ? getAreaByIdFrontend(key) : getAreaBySlug(key))
    );
    return area?.name || area?.title || toLabel(key);
  } catch {
    return toLabel(key);
  }
};

const categoryDescriptions = {
  residential:
    "Explore verified residential properties across Gurugram's key corridors, including apartments, independent floors, and premium homes with updated pricing, location, and project details.",
  commercial:
    "Browse commercial properties for sale across Gurugram, including office spaces, retail shops, SCO plots, and investment-ready commercial assets in high-demand business corridors.",
  plots:
    "Discover verified land and plot opportunities across Gurugram and NCR, curated for buyers and investors looking for clear locations, practical details, and long-term value.",
};

const normalizeDescription = (html = "", categoryKey = "") => {
  const text = String(html || "").trim();
  if (!text || /will update this description later/i.test(text)) {
    return categoryDescriptions[String(categoryKey || "").toLowerCase()] || "";
  }
  return text;
};

const getListingPageContext = async ({ params, searchParams }) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams?.slug;
  const pathname =
    Array.isArray(slug) && slug.length > 0
      ? `/properties/${slug.join("/")}`
      : "/properties";
  const pf = parsePropertiesListingPath(pathname);
  const queryCity = String(resolvedSearchParams?.city || "").trim();
  const queryArea = String(resolvedSearchParams?.area || "").trim();
  const categoryKey = pf.category || resolvedSearchParams?.category || "";
  const category = toLabel(categoryKey);
  let categorydata = null;
  if (category) {
    try {
      categorydata = await getCategoryBySlug(category.toLowerCase());
    } catch (error) {
      console.error("Category fetch failed:", error.message);
      categorydata = null;
    }
  }

  let listingPlaceLabel = "";
  if (pf.area || queryArea) {
    listingPlaceLabel = await resolveAreaLabel(pf.area || queryArea);
  } else if (pf.cityId || queryCity) {
    listingPlaceLabel = await resolveCityLabel(pf.cityId || queryCity);
  }

  const hasExplicitPlace = Boolean(pf.area || queryArea || pf.cityId || queryCity);
  const breadcrumbTitle = hasExplicitPlace && listingPlaceLabel
      ? `Properties for Sale in ${listingPlaceLabel}`
      : categorydata?.data?.categoryH1Title
        ? categorydata.data.categoryH1Title
        : category
          ? `${category} Properties for Sale`
          : "Properties for Sale";

  const breadcrumbSub = listingPlaceLabel || category || "Properties";
  const normalizedCategoryData =
    categorydata?.data
      ? {
          ...categorydata,
          data: {
            ...categorydata.data,
            description: normalizeDescription(categorydata.data.description, categoryKey),
          },
        }
      : categorydata;

  return {
    pf,
    categorydata: normalizedCategoryData,
    breadcrumbTitle,
    breadcrumbSub,
  };
};

export const generateMetadata = async ({ params, searchParams }) => {
  const { breadcrumbTitle } = await getListingPageContext({ params, searchParams });
  return {
    title: `${breadcrumbTitle} | JameenWallah`,
    description:
      "Explore verified property listings with updated prices, locations, and project details across Gurgaon and NCR.",
  };
};

const PropertiesPage = async ({ params, searchParams }) => {
  const {
    pf,
    categorydata,
    breadcrumbTitle,
    breadcrumbSub,
  } = await getListingPageContext({ params, searchParams });

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <section className="breadcumb-section breadcumb-section-properties">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcumb-style1">
                <h1 className="title">{breadcrumbTitle}</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="pt70 pb90 bgc-f7">
            <div className="container">
              <p className="text-center text-muted">Loading listings…</p>
            </div>
          </section>
        }
      >
        <ProperteyFiltering
          breadcrumbLabel={breadcrumbSub}
          initialCategory={pf.category || ""}
          categorydata={categorydata}

        />
      </Suspense>

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
};

export default PropertiesPage;
