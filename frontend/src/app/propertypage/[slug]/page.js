import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";
import FeaturedListings from "@/components/listing/grid-view/properties/FeatuerdListings";
import { getPrimaryPropertyImage } from "@/utils/resolveImage";
import {
  formatPropertyLocation,
  formatSizeLabel,
  getBathroomLabel,
  getBedroomLabel,
  getSizeSqFt,
} from "@/utils/propertyDisplay";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const page = slug ? await fetchTagData(slug) : null;

  if (page) {
    return {
      title: page.metatitle || page.title || "Property Collection | JameenWallah",
      description: page.metadescription || page.description || undefined,
    };
  }

  return {
    title: `Properties for ${slug || "Sale"} | JameenWallah`,
  };
}

const mapApiPropertyToListing = (item) => {
  const formatCategory = (value = "") =>
    String(value)
      .trim()
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  const image = getPrimaryPropertyImage(item);
  const priceNum = Number(item?.description?.price);
  let price;
  if (Number.isFinite(priceNum) && priceNum > 0) {
    price = `₹${new Intl.NumberFormat("en-IN").format(priceNum)}`;
  } else if (item?.minPrice != null && Number(item.minPrice) > 0) {
    price = `₹${new Intl.NumberFormat("en-IN").format(Number(item.minPrice))}`;
  } else {
    price = "Price on request";
  }
  const propSlug = item?.description?.slug || item?._id;
  return {
    id: propSlug || item._id,
    slug: item?.description?.slug,
    title: item?.description?.title || "Property",
    location: formatPropertyLocation(item),
    bed: getBedroomLabel(item),
    bath: getBathroomLabel(item),
    sqft: formatSizeLabel(item),
    sizeInSqFt: getSizeSqFt(item),
    price,
    forRent: false,
    image,
    yearBuilding: item?.details?.yearBuilt ?? 2020,
    categoryLabel: formatCategory(
      item?.category?.name ||
        item?.category?.slug ||
        item?.description?.category?.name ||
        item?.description?.category?.slug ||
        ""
    ),
  };
};

const fetchTagData = async (slug) => {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    const res = await fetch(`${API_BASE}/frontend/api/property-page/${slug}`, {
      next: { revalidate: 60 } // Revalidate cache every 60 seconds
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch tag data");
    }
    
    const data = await res.json();
    // Assuming data contains: { title: "...", linkedProperties: [...] }
    // Unwrap if backend sends enveloped data structure { status: "success", data: { ... } }
    return data?.data || data;
  } catch (error) {
    console.error("Error fetching tag data:", error);
    return null;
  }
};

const TagPropertyPage = async ({ params, searchParams }) => {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    notFound();
  }

  const tagData = await fetchTagData(slug);
  
  if (!tagData) {
    notFound();
  }

  const title = tagData.title || tagData.name || "Curated Properties";
  const pageDescription = typeof tagData.description === "string" ? tagData.description.trim() : "";
  const showDescriptionSection = pageDescription.length > 0;
  const linkedPropertiesRaw = tagData.linkedProperties || tagData.propertyId || [];
  
  const listingData = Array.isArray(linkedPropertiesRaw) 
    ? linkedPropertiesRaw.map(mapApiPropertyToListing) 
    : [];

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      {/* Hero Banner Section */}
      <section className="breadcumb-section breadcumb-section-properties">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcumb-style1">
                <h1 className="title">{title}</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid Section */}
      <section className="pt70 pb90 bgc-f7">
        <div className="container">
          <div className="row mb20">
            <div className="col-lg-12">
              <div className="breadcumb-list breadcumb-list-with-mobile-filter">
                <div className="breadcumb-left">
                  <a href="/">Home</a>
                  <span className="title">{">"}</span>
                  {/* <a href="/properties">Explore</a> */}
                  {/* <span className="title">{">"}</span> */}
                  <span>{title}</span>
                </div>
              </div>
            </div>
          </div>

          {listingData.length === 0 ? (
            <div className="row">
              <div className="col-lg-12 text-center">
                <p className="text-muted mt-4">No specific properties linked to this tag. Check back later!</p>
              </div>
            </div>
          ) : (
            <div className="row">
              <FeaturedListings data={listingData} />
            </div>
          )}
        </div>
      </section>

      {showDescriptionSection ? (
        <section className="pt0 pb70 bgc-f7">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="blog-single-review bdrs12 p30 bg-white">
                  <h3 className="mb20">About This Collection</h3>
                  <div className="text fz15 propertypage-description-text">
                    {pageDescription}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
};

export default TagPropertyPage;
