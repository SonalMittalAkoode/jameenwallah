import Explore from "@/components/common/Explore";
import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";
import FeaturedListings from "@/components/home/home-v5/FeatuerdListings";
import Header from "@/components/home/home-v5/Header";
import Partner from "@/components/common/Partner";
import PropertiesByCities from "@/components/home/home-v5/PropertiesByCities";
import Testimonial from "@/components/home/home-v5/Testimonial";
import FilterWithProperties from "@/components/home/home-v5/filter-with-property";
import Blog from "@/components/common/Blog";
import Hero from "@/components/home/home-v5/Hero";
import ChatFeature from "@/components/home/home-v5/ChatFeature";
import ApartmentTypes from "@/components/home/home-v5/ApartmentTypes";
import ExploreOpportunitiesSection from "@/components/home/home-v5/ExploreOpportunitiesSection";
import Cta from "@/components/home/home-v5/Cta";
import Link from "next/link";
import PropertyListing from "@/components/home/home-v5/PropertyListing";
import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";
import { getAllPropertiesFrontend } from "@/api/property";
import { getCleanPrimaryPropertyImage } from "@/utils/resolveImage";
import { getPropertyHref } from "@/utils/propertyRoute";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getPartnerSectionTitle = (value) => {
  const raw = String(value || "").trim();
  if (!raw || /^trusted by the world'?s best$/i.test(raw)) {
    return "Trusted Developer Partners";
  }
  return raw;
};

const renderJameenWallahTitle = (value) => {
  const title = value || "How JameenWallah Helps You Find the Right Property";
  const parts = String(title).split(/(JameenWallah)/i);

  return parts.map((part, index) =>
    /^JameenWallah$/i.test(part) ? (
      <span className="explore-section__brand" key={`${part}-${index}`}>
        {part}
      </span>
    ) : (
      part
    )
  );
};

const STATIC_HOME_HERO_ITEMS = [
  {
    image: "/images/home/home-5-1.jpg",
    title: "Find Premium Properties in Gurgaon with Expert Guidance",
    href: "/properties",
  },
  {
    image: "/images/home/home-5-2.jpg",
    title: "Explore Verified Real Estate Opportunities in Gurgaon's Top Locations",
    href: "/properties",
  },
  {
    image: "/images/home/home-5-3.jpg",
    title: "Buy, Sell & Invest in Gurgaon with Trusted Real Estate Consultants",
    href: "/properties",
  },
  {
    image: "/images/home/home-5-4.jpg",
    title: "Discover Luxury Homes & High-Return Investment Properties in Gurgaon",
    href: "/properties",
  },
];

const getHomeHeroItems = async () => {
  try {
    const res = await getAllPropertiesFrontend({ limit: 8, page: 1 });
    const rows = Array.isArray(res?.items)
      ? res.items
      : Array.isArray(res?.data)
        ? res.data
        : [];

    return rows
      .map((property) => ({
        image: getCleanPrimaryPropertyImage(property, ""),
        title:
          property?.description?.title ||
          "Verified JameenWallah Property",
        href: getPropertyHref(property),
      }))
      .filter((item) => item.image && item.title)
      .slice(0, 4);
  } catch {
    return [];
  }
};

export async function generateMetadata() {
  const response = await getSiteContentByPageKeyFrontend("home");
  const content = response?.data;
  return {
    title: content.metaTitle,
    description: content.metaDescription,
  };
}

const Home_V5 = async () => {
  const [response, heroItems] = await Promise.all([
    getSiteContentByPageKeyFrontend("home"),
    getHomeHeroItems(),
  ]);
  const staticHeroItems = STATIC_HOME_HERO_ITEMS;
  const heroImages = heroItems.map((item) => item.image).filter(Boolean);
  const content = response?.data;
  return (
    <>
      <style>{`
        .home-v5-page .featured-listings-section--premium {
          padding-top: 52px !important;
          padding-bottom: 44px !important;
        }
        .home-v5-page .trending-locations-section--premium-collage,
        .home-v5-page .home-blog-section--premium {
          padding-top: 46px !important;
          padding-bottom: 46px !important;
        }
        .home-v5-page .chat-feature,
        .home-v5-page .home-guidance-section {
          padding-top: 46px !important;
          padding-bottom: 46px !important;
        }
        .home-v5-page .deals-section {
          padding-top: 46px !important;
          padding-bottom: 32px !important;
        }
        .home-v5-page .partners-section {
          padding-top: 18px !important;
          padding-bottom: 20px !important;
        }
        .home-v5-page .eos-section {
          padding-top: 44px !important;
          padding-bottom: 48px !important;
        }
        .home-v5-page .eos-section .row.mb50 {
          margin-bottom: 28px !important;
        }
        .home-v5-page .deals-header {
          margin-bottom: 34px !important;
        }
        .home-v5-page .deals-controls {
          margin-top: 18px !important;
        }
        .home-v5-page .footer-style1 {
          padding-top: 42px !important;
        }
        .home-v5-page .home-location-browser-section {
          padding-top: 36px !important;
          padding-bottom: 12px !important;
        }
        .home-v5-page .home-location-browser-section .main-title2 {
          margin-bottom: 24px !important;
        }
        .home-v5-page .home-cta-section {
          height: auto !important;
          min-height: 320px !important;
          padding: 58px 0 !important;
          background-attachment: scroll !important;
        }
        .home-v5-page .home-cta-section .cta-title {
          margin-bottom: 24px !important;
        }
        .home-v5-page .home-testimonial-section {
          padding-top: 38px !important;
          padding-bottom: 38px !important;
        }
        .home-v5-page .home-testimonial-section::before,
        .home-v5-page .home-testimonial-section::after {
          display: none !important;
        }
        .home-v5-page .home-testimonial-section .main-title {
          margin-bottom: 20px !important;
        }
        .home-v5-page .home-testimonial-section .testimonial-style3 {
          margin-bottom: 16px !important;
        }
        .home-v5-page .feature-listing-slider .featured-premium-swiper,
        .home-v5-page .property-city-slider .properties-by-cities-swiper,
        .home-v5-page .testimonial-slider {
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }
        .home-v5-page .property_city-prev__active,
        .home-v5-page .property_city-next__active,
        .home-v5-page .property_city_pagination__active,
        .home-v5-page .testimonila_prev__active,
        .home-v5-page .testimonila_next__active,
        .home-v5-page .testimonila_pagination__active {
          margin-top: 0 !important;
        }
        @media (max-width: 767px) {
          .home-v5-page .featured-listings-section--premium,
          .home-v5-page .trending-locations-section--premium-collage,
          .home-v5-page .home-blog-section--premium,
          .home-v5-page .chat-feature,
          .home-v5-page .home-guidance-section,
          .home-v5-page .deals-section,
          .home-v5-page .eos-section {
            padding-top: 34px !important;
            padding-bottom: 34px !important;
          }
          .home-v5-page .partners-section {
            padding-top: 22px !important;
            padding-bottom: 22px !important;
          }
          .home-v5-page .home-location-browser-section,
          .home-v5-page .home-cta-section,
          .home-v5-page .home-testimonial-section {
            padding-top: 38px !important;
            padding-bottom: 38px !important;
          }
          .home-v5-page .home-cta-section {
            min-height: 280px !important;
          }
        }
      `}</style>
      <main className="home-v5-page">
      {/* Main Header Nav */}
      <Header />
      {/* End Main Header Nav */}

      {/* Mobile Nav  */}
      <MobileMenu />
      {/* End Mobile Nav  */}

      {/* Hero Slide - full viewport with floating search filter */}
      <div className="banner-wrapper position-relative hero-banner-fullview hero-section">
        <section className="thumbimg-countnumber-carousel p-0">
          <Hero items={staticHeroItems} />
        </section>
        <div className="hero-search-wrapper">
          <FilterWithProperties />
        </div>
      </div>
      {/* End Hero Slide */}

      {/* Discover Our Featured Listings */}
      <section className="featured-listings-section featured-listings-section--premium pt-0 pb80 bgc-f7 pb30-md">
        <div className="container">
          <div className="row align-items-center" data-aos="fade-up">
            <div className="col-lg-9">
              <div className="main-title2">
                <h1 className="title">{content.sections?.featured?.title}</h1>
                <p className="paragraph">
                 {content.sections?.featured?.description}
                </p>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="text-start text-lg-end mb-3">
                <Link className="ud-btn2" href="/properties">
                  See All Properties
                  <i className="fal fa-arrow-right-long" />
                </Link>
              </div>
            </div>
          </div>
          {/* End header */}

          <div className="row">
            <div className="col-lg-12" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-listing-slider">
                <FeaturedListings />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Discover Our Featured Listings */}

      
      {/* Chat Feature */}
      <ChatFeature />
      {/* End Chat Feature */}

      {/* Trending Locations */}
<section className="trending-locations-section trending-locations-section--premium-collage pb90 pb30-md">
  <div className="container">
    <div className="row" data-aos="fade-up" data-aos-delay="0">
      <div className="col-lg-7 mx-auto">
        <div className="main-title2 text-center">
          <h2 className="title">{content.sections?.locations?.title}</h2>
          <p className="paragraph">
            {content.sections?.locations?.description}
          </p>
        </div>
      </div>
    </div>

    <div
      className="trending-locations-collage-grid"
      data-aos="fade-up"
      data-aos-delay="250"
    >
              <ApartmentTypes heroImages={heroImages} />
    </div>
  </div>
</section>
{/* End Trending Locations */}

      {/* Explore / How It Works */}
<section className="home-guidance-section pb90 pb30-md bgc-thm-light">
  <div className="container">
    <div className="row">
      <div
        className="col-lg-8 mx-auto text-center"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <p className="explore-section__eyebrow justify-content-center">
          How it works
        </p>
        <h2 className="explore-section__title">
          {renderJameenWallahTitle(content.sections?.explore?.title)}
        </h2>
        <p className="explore-section__subtitle mb50">
          {content.sections?.explore?.description}
        </p>
      </div>
    </div>
    <Explore />
  </div>
</section>
{/* End Explore / How It Works */}

      {/* Explore property-city */}
      <section
        className="home-location-browser-section pb40-md pb90"
        id="property-markets"
      >
        <div className="container">
          <div
            className="row align-items-center"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="col-lg-9">
              <div className="main-title2">
                <h2 className="title">{content.sections?.cityShowcase?.title}</h2>
                <p className="paragraph">
                  {content.sections?.cityShowcase?.description}
                </p>
              </div>
            </div>
            {/* End col-lg-9 */}

            <div className="col-lg-3">
              <div className="text-start text-lg-end mb-3">
                <Link className="ud-btn2" href="#property-markets">
                  See All Cities
                  <i className="fal fa-arrow-right-long" />
                </Link>
              </div>
            </div>
            {/* End col-lg-3 */}
          </div>
          {/* End .row */}

          <div className="row">
            <div className="col-lg-12" data-aos="fade-up" data-aos-delay="300">
              <div className="property-city-slider position-relative">
              <PropertiesByCities heroImages={heroImages} />
              </div>
            </div>
          </div>
          {/* End .row */}
        </div>
      </section>
      {/* End Explore property-city */}

      {/* CTA */}
      <Cta backgroundImage={staticHeroItems[1]?.image || staticHeroItems[0]?.image || ""} />
      {/* CTA */}

      {/* Our Testimonials */}
      <section className="home-testimonial-section pb50-md">
        <div className="container maxw1600">
          <div className="row  justify-content-center text-center align-items-center">
            <div className="col-auto">
              <div
                className="main-title"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <h2 className="title">Testimonials</h2>
                <p className="paragraph">
                  What our clients say about us
                </p>
              </div>
            </div>
            {/* End header */}
          </div>
          {/* End .row */}

          <div className="row">
            <div className="col-lg-12">
              <div
                className="testimonial-slider"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <Testimonial />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Our Testimonials */}

      {/* Popular Property */}
      <PropertyListing />
      {/* End  Popular Property */}

      {/* Explore Blog */}
      <section className="home-blog-section home-blog-section--premium pb90 pb30-md">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto" data-aos="fade-up">
              <div className="main-title text-start text-md-center">
                <h2 className="title">{content.sections?.blog?.title}</h2>
                <p className="paragraph">
                  {content.sections?.blog?.description}
                </p>
              </div>
            </div>
          </div>
          {/* End .row */}

          <div className="row" data-aos="fade-up" data-aos-delay="300">
            <Blog />
          </div>
          {/* End .row */}
        </div>
      </section>
      {/* Explore Blog */}

      {/* Our Partners */}
      {/* <section className="our-partners pt0">
        <div className="container">
          <div className="row">
            <div className="col-lg-12" data-aos="fade-up">
              <div className="main-title text-center">
                <h6>{content.sections?.partners?.title}</h6>
              </div>
            </div>
            <div className="col-lg-12 text-center">
              <div
                className="dots_none nav_none"
                data-aos="fade-up"
                data-aos-delay="300"
              > */}
                <Partner title={getPartnerSectionTitle(content.sections?.partners?.title)} />
              {/* </div>
            </div>
          </div>
        </div>
      </section> */}
      {/* End Our Partners */}

      
      {/* Explore Opportunities */}
      <ExploreOpportunitiesSection />
      {/* End Explore Opportunities */}

      {/* Start Our Footer */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
      {/* End Our Footer */}
      </main>
    </>
  );
};

export default Home_V5;
