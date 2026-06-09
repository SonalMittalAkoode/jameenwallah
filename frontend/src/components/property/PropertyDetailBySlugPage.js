import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";
import listings from "@/data/listings";
import FloorPlans from "@/components/property/property-single-style/common/FloorPlans";
import NearbySimilarProperty from "@/components/property/property-single-style/common/NearbySimilarProperty";
import OverView from "@/components/property/property-single-style/common/OverView";
import PropertyAddress from "@/components/property/property-single-style/common/PropertyAddress";
import PropertyDetails from "@/components/property/property-single-style/common/PropertyDetails";
import PropertyFeaturesAminites from "@/components/property/property-single-style/common/PropertyFeaturesAminites";
import PropertyHeader from "@/components/property/property-single-style/properties/PropertyHeader";
import PropertyNearby from "@/components/property/property-single-style/common/PropertyNearby";
import PropertyVideo from "@/components/property/property-single-style/common/PropertyVideo";
import SitePlan from "@/components/property/property-single-style/common/SitePlan";
import MasterPlan from "@/components/property/property-single-style/common/MasterPlan";
import ProperytyDescriptions from "@/components/property/property-single-style/common/ProperytyDescriptions";
import VirtualTour360 from "@/components/property/property-single-style/common/VirtualTour360";
import AboutBuilder from "@/components/property/property-single-style/common/AboutBuilder";
import ScheduleTour from "@/components/property/property-single-style/sidebar/ScheduleTour";
import PropertyGallery from "@/components/property/property-single-style/properties/property-gallery";
import { getPropertySlug } from "@/utils/propertyRoute";
import { normalizePropertyDetail } from "@/utils/propertyDetail";
import { notFound } from "next/navigation";
import FaqWidget from "@/components/common/FaqWidget";
import { propertyFaqData } from "@/data/faqData";

export const metadata = {
  title: "Property Detail || JameenWallah",
};

const banklist = [
  { name: "Axis Bank", src: "/images/bank/AXIS-BANK.jpg" },
  { name: "Bank of Baroda", src: "/images/bank/BOB.jpg" },
  { name: "HDFC Bank", src: "/images/bank/HDFC-BANK.jpg" },
  { name: "ICICI Bank", src: "/images/bank/ICICI-BANK.jpg" },
  { name: "Punjab National Bank", src: "/images/bank/PNB.jpg" },
  { name: "State Bank of India", src: "/images/bank/SBI-BANK.jpg" },
];

const Bank = ({ banks }) => (
  <div className="row gx-3 gy-3">
    {banks.map((bank) => (
      <div key={bank.name} className="col-6 col-sm-4 col-lg-3">
        <div className="bank-logo-card bgc-white bdrs8 border p5 d-flex align-items-center justify-content-center h-100">
          <img
            src={bank.src}
            alt={bank.name}
            className="img-fluid"
            style={{ maxHeight: 50, objectFit: "contain" }}
          />
        </div>
      </div>
    ))}
  </div>
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const getPropertyBySlug = async (slug) => {
  const response = await fetch(
    `${API_BASE_URL}/frontend/api/properties/${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result?.data || null;
};

const getFeaturedProperties = async () => {
  const response = await fetch(
    `${API_BASE_URL}/frontend/api/properties/featured?limit=10&page=1`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return [];
  }

  const result = await response.json();

  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.items)) return result.data.items;

  return [];
};

const getSimilarProperties = async (property) => {
  try {
    const cityId = property?.location?.city?._id || property?.location?.city;
    if (!cityId) return [];

    const query = new URLSearchParams({ limit: 12, page: 1, city: String(cityId) });
    const response = await fetch(`${API_BASE_URL}/frontend/api/properties?${query.toString()}`, { cache: "no-store" });
    
    if (!response.ok) return [];
    
    const result = await response.json();
    if (Array.isArray(result?.items)) return result.items;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.data?.items)) return result.data.items;
    
    return [];
  } catch (e) {
    return [];
  }
};

const getStaticPropertyBySlug = (slug) =>
  listings.find(
    (listing) =>
      getPropertySlug(listing) === slug || String(listing.id) === String(slug)
  ) || null;

const SingleProperty = async (props) => {
  const params = await props.params;
  const slug = params.slug;
  const property =
    (await getPropertyBySlug(slug)) || getStaticPropertyBySlug(slug);
  const detail = property ? normalizePropertyDetail(property) : null;

  if (!property) {
    notFound();
  }

  const featuredProperties = (await getFeaturedProperties()).filter(
    (item) => String(item?._id || item?.id) !== String(property?._id || property?.id)
  );

  const similarProperties = (await getSimilarProperties(property)).filter(
    (item) => 
      String(item?._id || item?.id) !== String(property?._id || property?.id) &&
      item?.description?.featuredProperty !== "Yes"
  );

  return (
    <>
      {/* Main Header Nav */}
      <DefaultHeader />
      {/* End Main Header Nav */}

      {/* Mobile Nav  */}
      <MobileMenu />
      {/* End Mobile Nav  */}

      {/* Property Slider Gallery */}
      <section className="pt20 pb60 bgc-white">
        <PropertyGallery property={property} />
      </section>
      {/* End Property Slider Gallery */}

      {/* Property Details Section */}
      <section className="pt0 pb90 bgc-white">
        <div className="container">
          <div className="row">
            <PropertyHeader property={property} />
          </div>
          {/* End .row */}

          <div className="row wrap property-detail-layout">
            <div className="col-lg-8 col-xl-8 col-md-12">
              <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative property-overview-section">
                <h4 className="title fz17 mb30">Overview</h4>
                <div className="row">
                  <OverView property={property} />
                </div>
              </div>

              <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                <h4 className="title fz17 mb30">Property Description</h4>
                <ProperytyDescriptions property={property} />
                {/* End property description */}

                <h4 className="title fz17 mb30 mt50">Property Details</h4>
                <div className="row">
                  <PropertyDetails property={property} />
                </div>
              </div>

              <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                <h4 className="title fz17 mb30 mt30">Address</h4>
                <div className="row">
                  <PropertyAddress property={property} />
                </div>
              </div>

              <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                <h4 className="title fz17 mb30">Features &amp; Amenities</h4>
                <PropertyFeaturesAminites property={property} />
              </div>
              {/* End .ps-widget */}

              {detail?.floorPlans?.length > 0 ||
              detail?.floorPlanImages?.length > 0 ? (
                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">Floor Plans</h4>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="accordion-style1 style2">
                        <FloorPlans property={property} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {detail?.videoLink ? (
                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">Video</h4>
                  <div className="row">
                    <PropertyVideo property={property} />
                  </div>
                </div>
              ) : null}

              {detail?.sitePlanImage ? (
                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">Site Plan</h4>
                  <div className="row">
                    <SitePlan property={property} />
                  </div>
                </div>
              ) : null}

              {detail?.masterPlanImage ? (
                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">Master Plan</h4>
                  <div className="row">
                    <MasterPlan property={property} />
                  </div>
                </div>
              ) : null}

              {detail?.virtualTour ? (
              <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                <h4 className="title fz17 mb30">360┬░ Virtual Tour</h4>
                <div className="row">
                  <VirtualTour360 property={property} />
                </div>
              </div>
              ) : null}

              {detail?.nearbyItems?.length ? (
                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">Location Highlights</h4>
                  <div className="row">
                    <PropertyNearby property={property} />
                  </div>
                </div>
              ) : null}

              {detail?.builderDetails ? (
                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">About Builder</h4>
                  <div className="row">
                    <AboutBuilder builder={detail.builderDetails} />
                  </div>
                </div>
              ) : null}

              <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                <h4 className="title fz17 mb30">Frequently Asked Questions</h4>
                <div className="row">
                  <div className="col-md-12">
                    <FaqWidget faqs={propertyFaqData} />
                  </div>
                </div>
              </div>
              <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 p20-sm mb30 overflow-hidden position-relative">
                <h4 className="title fz17 mb30">Loans Approved By:</h4>
                <div className="row">
                  <div className="col-md-12">
                    <Bank banks={banklist} />
                  </div>
                </div>
              </div>

            </div>
            {/* End .col-8 */}

            <div className="col-lg-4 col-xl-4 col-md-12">
              <div className="column">
                <div className="default-box-shadow1 bdrs12 bdr1 p30 p20-sm mb30-md bgc-white position-relative sticky-sidebar-mobile">
                  <h4 className="form-title mb5">Schedule a tour</h4>
                  <p className="text">Choose your preferred day</p>
                  <ScheduleTour
                    propertyId={
                      property?._id != null ? String(property._id) : ""
                    }
                  />
                </div>
                {/* End .Schedule a tour */}
              </div>
            </div>
          </div>
          {/* End .row */}

          {featuredProperties.length ? (
            <>
              <div className="row mt30 align-items-center justify-content-between">
                <div className="col-auto">
                  <div className="main-title">
                    <h2 className="title">Featured Properties</h2>
                    <p className="paragraph">
                      Explore more highlighted properties from our collection
                    </p>
                  </div>
                </div>

                <div className="col-auto mb30">
                  <div className="row align-items-center justify-content-center">
                    <div className="col-auto">
                      <button className="featured-prev__active swiper_button">
                        <i className="far fa-arrow-left-long" />
                      </button>
                    </div>

                    <div className="col-auto">
                      <div className="pagination swiper--pagination featured-pagination__active" />
                    </div>

                    <div className="col-auto">
                      <button className="featured-next__active swiper_button">
                        <i className="far fa-arrow-right-long" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="property-city-slider">
                    <NearbySimilarProperty properties={featuredProperties} />
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {similarProperties.length ? (
            <>
              <div className="row mt50 align-items-center justify-content-between">
                <div className="col-auto">
                  <div className="main-title">
                    <h2 className="title">Similar Properties</h2>
                    <p className="paragraph">
                      Explore similar properties tailored to your taste
                    </p>
                  </div>
                </div>

                <div className="col-auto mb30">
                  <div className="row align-items-center justify-content-center">
                    <div className="col-auto">
                      <button className="similar-prev__active swiper_button">
                        <i className="far fa-arrow-left-long" />
                      </button>
                    </div>

                    <div className="col-auto">
                      <div className="pagination swiper--pagination similar-pagination__active" />
                    </div>

                    <div className="col-auto">
                      <button className="similar-next__active swiper_button">
                        <i className="far fa-arrow-right-long" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="property-city-slider">
                    <NearbySimilarProperty properties={similarProperties} prefix="similar-" />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
        {/* End .container */}
      </section>
      {/* End Property All Single V4  */}

      {/* Start Our Footer */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
      {/* End Our Footer */}
    </>
  );
};

export default SingleProperty;
