"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { resolveImageSrc } from "@/utils/resolveImage";

const FALLBACK_API_BASE = "https://jameenwallahapi.akoodedemo.com";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_API_BASE;
const BUILDER_API_BASES = Array.from(new Set([API_BASE, FALLBACK_API_BASE]));

const getPartnerTitle = (partner) =>
  String(partner?.title || partner?.name || "Developer Partner").trim();

const LOGO_OVERRIDES_BY_TITLE = new Map(
  Object.entries({
    "bestech": "/images/builder-logos/bestech-logo.png",
    "dlf": "https://www.dlf.in/images/logo.svg",
    "dlf ltd.": "https://www.dlf.in/images/logo.svg",
    "ansal": "https://ansalapi.com/images/logo.jpg",
    "ansal api": "https://ansalapi.com/images/logo.jpg",
    "birla estates": "/images/builder-logos/generated/birla-estates.svg",
    "candor techspace": "https://files.brookfieldindiareit.in/bee_logo_image_81caa9d1e5.png",
    "dhoot": "/images/builder-logos/generated/dhoot.svg",
    "hsidc": "https://www.hsiidc.org.in/uploads/settings/169946877904logo.png",
    "huda": "https://www.hsiidc.org.in/uploads/settings/169946877904logo.png",
    "international land developer ltd.(ild)": "https://www.ild.co.in/images/logo-white.png",
    "ild": "https://www.ild.co.in/images/logo-white.png",
    "itc": "https://upload.wikimedia.org/wikipedia/commons/f/ff/ITC_Limited_Logo.svg",
    "jms group": "https://jmsgroup.co.in/assets/img/jms-blue-logo.webp",
    "orris infrastructure": "https://www.orris.in/content/images/logo.png?format=webp",
    "paras": "https://www.parasbuildtech.com/img/logo.png",
    "paras buildtech": "https://www.parasbuildtech.com/img/logo.png",
    "parsvnath": "https://www.parsvnath.com/wp-content/themes/storefront/assets/icon/logo-parsvnaths.png",
    "raheja": "https://raheja.com/images/raheja-logo.png",
    "s.s. group": "https://ssdeveloper.in/wp-content/uploads/2025/08/ss-group-logo.png",
    "sahara infrastructure": "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/SqvRsOOFDt089nQz/saharalogo-3-eqYqXgVoHPHbguui.jpg",
    "splendor": "https://www.splendorgroup.net/assets/images/splendor-logo.png",
    "tdi": "https://i0.wp.com/tdiinfratech.com/wp-content/uploads/2024/03/cropped-TDI-Logo-copy.jpg?ssl=1",
    "welldone": "/images/builder-logos/generated/welldone.svg",
    "whiteland": "/images/builder-logos/generated/whiteland-corporation.svg",
    "whiteland corporation": "/images/builder-logos/generated/whiteland-corporation.svg",
    "tarc": "/images/builder-logos/generated/tarc-limited.svg",
    "tarc limited": "/images/builder-logos/generated/tarc-limited.svg",
    "suncity": "/images/builder-logos/generated/suncity-projects.svg",
    "suncity projects": "/images/builder-logos/generated/suncity-projects.svg",
    "suncity projects pvt. ltd.": "/images/builder-logos/generated/suncity-projects.svg",
    "good earth infra": "/images/builder-logos/generated/good-earth-infra.svg",
    "imperia": "/images/builder-logos/generated/imperia.svg",
    "baani group": "/images/builder-logos/generated/baani-group.svg",
    "pioneer": "/images/builder-logos/generated/pioneer.svg",
    "magnum group": "/images/builder-logos/generated/magnum-group.svg",
    "global": "/images/builder-logos/generated/global.svg",
    "abw group": "/images/builder-logos/generated/abw-group.svg",
    "salcon": "/images/builder-logos/generated/salcon.svg",
    "centrum plaza": "/images/builder-logos/generated/centrum-plaza.svg",
    "ireo": "/images/builder-logos/generated/ireo.svg",
    "tata": "/images/builder-logos/generated/tata.svg",
    "gold coast": "/images/builder-logos/generated/gold-coast.svg",
    "sweta estate": "/images/builder-logos/generated/sweta-estate.svg",
    "enkay towers": "/images/builder-logos/generated/enkay-towers.svg",
    "satya group": "/images/builder-logos/generated/satya-group.svg",
    "gambhir housing india ltd": "/images/builder-logos/generated/gambhir-housing-india-ltd.svg",
    "orchid": "/images/builder-logos/generated/orchid.svg",
    "apas group": "/images/builder-logos/generated/apas-group.svg",
    "clarion": "/images/builder-logos/generated/clarion.svg",
    "era resorts": "/images/builder-logos/generated/era-resorts.svg",
    "gopaldas bhawan": "/images/builder-logos/generated/gopaldas-bhawan.svg",
    "rajdarbar realty limited": "/images/builder-logos/generated/rajdarbar-realty-limited.svg",
    "the 3c": "/images/builder-logos/generated/the-3c.svg",
    "worldmark": "/images/builder-logos/generated/worldmark.svg",
  })
);

const LOCALIZED_LOGO_OVERRIDES_BY_TITLE = new Map(
  Object.entries({
    "m3m": "/images/builder-logos/extracted/m3m.webp",
    "emaar mgf": "/images/builder-logos/extracted/emaar-mgf.png",
    "dlf": "/images/builder-logos/extracted/dlf.svg",
    "jmd group": "/images/builder-logos/extracted/jmd-group.png",
    "unitech": "/images/builder-logos/extracted/unitech.gif",
    "spaze": "/images/builder-logos/extracted/spaze.png",
    "vatika": "/images/builder-logos/extracted/vatika.svg",
    "vipul group": "/images/builder-logos/extracted/vipul-group.png",
    "suncity projects pvt. ltd.": "/images/builder-logos/extracted/suncity-projects-pvt-ltd.svg",
    "aipl (advance india projects limited)": "/images/builder-logos/extracted/aipl.webp",
    "m3m india": "/images/builder-logos/extracted/m3m-india.webp",
    "elan": "/images/builder-logos/generated/elan.svg",
    "eros": "/images/builder-logos/extracted/eros.svg",
    "bptp": "/images/builder-logos/extracted/bptp.svg",
    "bestech": "/images/builder-logos/bestech-logo.png",
    "galaxy group": "/images/builder-logos/extracted/galaxy-group.png",
    "trehan group of companies": "/images/builder-logos/extracted/trehan-group-of-companies.png",
    "dlf ltd.": "/images/builder-logos/extracted/dlf-ltd.svg",
    "dhoot": "/images/builder-logos/generated/dhoot.svg",
    "global": "/images/builder-logos/generated/global.svg",
    "imperia": "/images/builder-logos/extracted/imperia.webp",
    "abw group": "/images/builder-logos/generated/abw-group.svg",
    "salcon": "/images/builder-logos/generated/salcon.svg",
    "baani group": "/images/builder-logos/extracted/baani-group.png",
    "pioneer": "/images/builder-logos/extracted/pioneer.png",
    "welldone": "/images/builder-logos/extracted/welldone.png",
    "reach group": "/images/builder-logos/generated/reach-group.svg",
    "smartworld": "/images/builder-logos/generated/smartworld.svg",
    "suncity business tower": "/images/builder-logos/extracted/suncity-business-tower.svg",
    "magnum group": "/images/builder-logos/extracted/magnum-group.png",
    "centrum plaza": "/images/builder-logos/generated/centrum-plaza.svg",
    "emaar india": "/images/builder-logos/generated/emaar-india.svg",
    "emaar india ltd": "/images/builder-logos/extracted/emaar-india-ltd.png",
    "godrej properties": "/images/builder-logos/generated/godrej-properties.svg",
    "splendor": "/images/builder-logos/extracted/splendor.png",
    "adani": "/images/builder-logos/extracted/adani.svg",
    "good earth infra": "/images/builder-logos/extracted/good-earth-infra.webp",
    "ireo": "/images/builder-logos/generated/ireo.svg",
    "ninex": "/images/builder-logos/extracted/ninex.png",
    "omaxe ltd": "/images/builder-logos/extracted/omaxe-ltd.webp",
    "suncity": "/images/builder-logos/extracted/suncity.svg",
    "tata": "/images/builder-logos/generated/tata.svg",
    "birla estates": "/images/builder-logos/generated/birla-estates.svg",
    "gold coast": "/images/builder-logos/generated/gold-coast.svg",
    "huda": "/images/builder-logos/extracted/huda.png",
    "ocus": "/images/builder-logos/extracted/ocus.png",
    "signature global": "/images/builder-logos/generated/signature-global.svg",
    "sweta estate": "/images/builder-logos/generated/sweta-estate.svg",
    "ambience": "/images/builder-logos/extracted/ambience.png",
    "ats infrastructure": "/images/builder-logos/generated/ats-infrastructure.svg",
    "experion developers": "/images/builder-logos/generated/experion-developers.svg",
    "hsidc": "/images/builder-logos/extracted/hsidc.png",
    "itc": "/images/builder-logos/extracted/itc.svg",
    "max estates ltd.": "/images/builder-logos/generated/max-estates-ltd.svg",
    "puri constructions pvt. ltd.": "/images/builder-logos/generated/puri-constructions-pvt-ltd.svg",
    "sobha limited": "/images/builder-logos/extracted/sobha-limited.svg",
    "central park": "/images/builder-logos/generated/central-park.svg",
    "conscient infrastructure": "/images/builder-logos/generated/conscient-infrastructure.svg",
    "enkay towers": "/images/builder-logos/generated/enkay-towers.svg",
    "m2k": "/images/builder-logos/extracted/m2k.png",
    "oberoi realty": "/images/builder-logos/generated/oberoi-realty.svg",
    "satya group": "/images/builder-logos/generated/satya-group.svg",
    "silverglades": "/images/builder-logos/extracted/silverglades.png",
    "adore realtech": "/images/builder-logos/generated/adore-realtech.svg",
    "amb": "/images/builder-logos/extracted/amb.png",
    "ansal": "/images/builder-logos/extracted/ansal.jpg",
    "gambhir housing india ltd": "/images/builder-logos/generated/gambhir-housing-india-ltd.svg",
    "international land developer ltd.(ild)": "/images/builder-logos/extracted/international-land-developer-ltd-ild.png",
    "jms group": "/images/builder-logos/extracted/jms-group.webp",
    "krisumi": "/images/builder-logos/generated/krisumi.svg",
    "mahindra lifespaces": "/images/builder-logos/extracted/mahindra-lifespaces.webp",
    "omaxe limited": "/images/builder-logos/generated/omaxe-limited.svg",
    "orchid": "/images/builder-logos/generated/orchid.svg",
    "paras": "/images/builder-logos/extracted/paras.png",
    "paras buildtech": "/images/builder-logos/extracted/paras-buildtech.png",
    "prestige group": "/images/builder-logos/generated/prestige-group.svg",
    "raheja": "/images/builder-logos/extracted/raheja.png",
    "s.s. group": "/images/builder-logos/extracted/s-s-group.png",
    "sahara infrastructure": "/images/builder-logos/extracted/sahara-infrastructure.jpg",
    "smart world": "/images/builder-logos/generated/smart-world.svg",
    "suncity projects": "/images/builder-logos/extracted/suncity-projects.svg",
    "supertech": "/images/builder-logos/extracted/supertech.png",
    "tarc limited": "/images/builder-logos/extracted/tarc-limited.png",
    "whiteland corporation": "/images/builder-logos/generated/whiteland-corporation.svg",
    "apas group": "/images/builder-logos/generated/apas-group.svg",
    "candor techspace": "/images/builder-logos/extracted/candor-techspace.png",
    "central park group": "/images/builder-logos/generated/central-park-group.svg",
    "clarion": "/images/builder-logos/generated/clarion.svg",
    "era resorts": "/images/builder-logos/generated/era-resorts.svg",
    "gopaldas bhawan": "/images/builder-logos/generated/gopaldas-bhawan.svg",
    "orris infrastructure": "/images/builder-logos/extracted/orris-infrastructure.png",
    "parsvnath": "/images/builder-logos/extracted/parsvnath.png",
    "rajdarbar realty limited": "/images/builder-logos/generated/rajdarbar-realty-limited.svg",
    "tdi": "/images/builder-logos/extracted/tdi.jpg",
    "the 3c": "/images/builder-logos/generated/the-3c.svg",
    "worldmark": "/images/builder-logos/generated/worldmark.svg",
  })
);

const getPartnerLogoOverride = (partner) => {
  const title = getPartnerTitle(partner).toLowerCase();
  return LOCALIZED_LOGO_OVERRIDES_BY_TITLE.get(title) || LOGO_OVERRIDES_BY_TITLE.get(title) || "";
};

const VERIFIED_LOCAL_LOGO_SLUGS = new Set([
  "adore-realtech",
  "ats-infrastructure",
  "birla-estates",
  "central-park",
  "conscient-infrastructure",
  "elan",
  "emaar-india",
  "experion-developers",
  "godrej-properties",
  "krisumi",
  "max-estates-ltd",
  "oberoi-realty",
  "omaxe-limited",
  "prestige-group",
  "puri-constructions-pvt-ltd",
  "reach-group",
  "signature-global",
  "smartworld",
]);

const BLOCKED_PARTNER_TITLE_PATTERN = /^(independent|owner|individual|other|others|unknown|na|n\/a)$/i;
const BLOCKED_PARTNER_IMAGE_PATTERN =
  /1774169693034-aipl|placeholder|default|mock|sample|dummy|avatar|agent-1|team\//i;
const GENERATED_PLACEHOLDER_LOGO_PATTERN = /^\/images\/builder-logos\/generated\//i;
const LIGHT_LOGO_IMAGE_PATTERN =
  /white[-_]?logo|sobha_white|SOBHA_White|foot-logo|logo%20original|jmdgroup\.in\/wp-content\/uploads\/2025\/06\/white-logo/i;
const LIGHT_LOGO_TITLE_PATTERN =
  /^(aipl|aipl \(advance india projects limited\)|dlf|dlf ltd\.|m3m|m3m india|jmd group|sobha limited|silverglades)$/i;
const isPartnerLogoImage = (partner) => {
  const image = String(getPartnerLogoOverride(partner) || partner?.image || "").trim();
  const title = getPartnerTitle(partner);
  if (!image) return false;
  if (BLOCKED_PARTNER_TITLE_PATTERN.test(title)) return false;
  if (BLOCKED_PARTNER_IMAGE_PATTERN.test(image)) return false;
  if (GENERATED_PLACEHOLDER_LOGO_PATTERN.test(image)) return false;
  if (image.startsWith("/images/builder-logos/")) return true;
  if (/^https?:\/\//i.test(image)) return true;
  if (
    VERIFIED_LOCAL_LOGO_SLUGS.has(String(partner?.slug || "").trim().toLowerCase()) &&
    /^\/images\/[^/]+\.(?:svg|png|webp|gif|jpe?g)$/i.test(image)
  ) return true;
  if (/\/logo[^/]*\.(?:svg|png|webp|gif|jpe?g)$/i.test(image)) return true;
  if (/\/logos?\//i.test(image)) return true;
  return false;
};

const normalizePartnerTitle = (value) => {
  const raw = String(value || "").trim();
  if (!raw || /^trusted by the world'?s best$/i.test(raw)) {
    return "Trusted Developer Partners";
  }
  return raw;
};

const needsDarkLogoCard = (partner) => {
  const image = String(getPartnerLogoOverride(partner) || partner?.image || "").trim();
  return LIGHT_LOGO_IMAGE_PATTERN.test(image) || LIGHT_LOGO_TITLE_PATTERN.test(getPartnerTitle(partner));
};

const getPartnerImageSrc = (partner) => {
  const rawImage = String(getPartnerLogoOverride(partner) || partner?.image || "").trim();
  if (!rawImage) return "";
  if (GENERATED_PLACEHOLDER_LOGO_PATTERN.test(rawImage)) return "";
  return resolveImageSrc(rawImage, "") || "";
};

const Partner = ({ title = "Trusted Developer Partners" }) => {
  const [partners, setPartners] = useState([
    { _id: "s1", image: "https://www.parasbuildtech.com/img/logo.png", title: "Paras Buildtech" },
    { _id: "s2", image: "/images/builder-logos/bestech-logo.png", title: "Bestech" },
    { _id: "s3", image: "https://www.dlf.in/images/logo.svg", title: "DLF" },
    { _id: "s4", image: "/images/builder-logos/extracted/tarc-limited.png", title: "TARC" },
    { _id: "s5", image: "/images/builder-logos/extracted/suncity-projects.svg", title: "Suncity Projects" },
  ]);

  useEffect(() => {
    let cancelled = false;
    const fetchBuilders = async () => {
      for (const apiBase of BUILDER_API_BASES) {
        try {
          const res = await fetch(`${apiBase}/frontend/api/builders`);
          if (!res.ok) continue;
          const data = await res.json();
          if (cancelled) return;
          if (data?.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
            const builderPartners = data.data
              .filter((builder) => {
                const title = getPartnerTitle(builder).toLowerCase();
                return title && !BLOCKED_PARTNER_TITLE_PATTERN.test(title);
              })
              .map((builder) => ({
                ...builder,
                image: isPartnerLogoImage(builder)
                  ? getPartnerLogoOverride(builder) || builder.image
                  : "",
              }))
              .filter((builder) => getPartnerImageSrc(builder));
            if (builderPartners.length) setPartners(builderPartners);
            return;
          }
        } catch {}
      }
    };
    fetchBuilders();
    return () => { cancelled = true; };
  }, []);

  let slides = [...partners];
  while (slides.length < 8) {
    slides = slides.concat(partners.slice(0, 8 - slides.length));
  }

  return (
    <section className="partners-section">
      <style>{`
        .partners-section {
          padding: 38px 0 44px;
          background: #ffffff;
          position: relative;
        }
        .partners-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,56,92,0.15) 30%, rgba(255,56,92,0.15) 70%, transparent 100%);
        }
        .partners-section::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 30%, rgba(0,0,0,0.06) 70%, transparent 100%);
        }
        .partners-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin-bottom: 22px;
        }
        .partners-label-line {
          height: 1px;
          width: 60px;
          background: linear-gradient(90deg, transparent, rgba(255,56,92,0.3));
        }
        .partners-label-line.right {
          background: linear-gradient(90deg, rgba(255,56,92,0.3), transparent);
        }
        .partners-label-text {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #b0b8c1;
        }
        .partners-track-wrapper {
          position: relative;
        }
        .partners-track-wrapper::before,
        .partners-track-wrapper::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 80px;
          z-index: 2;
          pointer-events: none;
        }
        .partners-track-wrapper::before {
          left: 0;
          background: linear-gradient(90deg, #ffffff, transparent);
        }
        .partners-track-wrapper::after {
          right: 0;
          background: linear-gradient(270deg, #ffffff, transparent);
        }
        .partner-logo-card {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 78px;
          padding: 0 18px;
          border: 1px solid rgba(24,26,32,0.08);
          border-radius: 10px;
          background: #fafafa;
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .partner-logo-card:hover {
          border-color: rgba(255,56,92,0.22);
          background: #ffffff;
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(255,56,92,0.08);
        }
        .partner-logo-card img {
          object-fit: contain;
          max-height: 48px;
          width: auto;
          max-width: 120px;
          filter: grayscale(30%) opacity(0.85);
          transition: filter 0.3s ease;
        }
        .partner-logo-card:hover img {
          filter: grayscale(0%) opacity(1);
        }
        .partner-logo-card__fallback {
          display: none;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 6px;
          text-align: center;
          line-height: 1.1;
        }
        .partner-logo-card__fallback-title {
          max-width: 150px;
          color: #181a20;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }
        .partner-logo-card--fallback {
          background: linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%);
          border-color: rgba(24,26,32,0.12);
        }
        .partner-logo-card--fallback .partner-logo-card__fallback-title {
          color: #111827;
          text-shadow: 0 1px 0 rgba(255,255,255,0.8);
        }
        .partner-logo-card--fallback img,
        .partner-logo-card--image-failed img {
          display: none;
        }
        .partner-logo-card--fallback .partner-logo-card__fallback,
        .partner-logo-card--image-failed .partner-logo-card__fallback {
          display: flex;
        }
        .partner-logo-card--dark {
          background: #171b22;
          border-color: rgba(255,255,255,0.1);
        }
        .partner-logo-card--dark:hover {
          background: #11151b;
          border-color: rgba(255,255,255,0.18);
          box-shadow: 0 10px 28px rgba(17,21,27,0.18);
        }
        .partner-logo-card--dark img,
        .partner-logo-card--dark:hover img {
          filter: none;
        }
        .partner-logo-card--dark .partner-logo-card__fallback-title {
          color: #ffffff;
        }
      `}</style>

      {/* Label row */}
      <div className="partners-label">
        <span className="partners-label-line" />
        <span className="partners-label-text">{normalizePartnerTitle(title)}</span>
        <span className="partners-label-line right" />
      </div>

      {/* Swiper */}
      <div className="partners-track-wrapper px-4 px-md-5">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          slidesPerView={2}
          loop={true}
          autoplay={{ delay: 0, disableOnInteraction: false }}
          speed={3500}
          freeMode={true}
          grabCursor={true}
          breakpoints={{
            480:  { slidesPerView: 3, spaceBetween: 16 },
            768:  { slidesPerView: 4, spaceBetween: 18 },
            1024: { slidesPerView: 5, spaceBetween: 20 },
            1280: { slidesPerView: 6, spaceBetween: 22 },
          }}
        >
          {slides.map((partner, index) => {
            const imageSrc = getPartnerImageSrc(partner);
            return (
              <SwiperSlide key={partner._id ? `${partner._id}-${index}` : index}>
                <div
                  className={`partner-logo-card${imageSrc ? "" : " partner-logo-card--fallback"}${needsDarkLogoCard(partner) ? " partner-logo-card--dark" : ""}`}
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={getPartnerTitle(partner)}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget
                          .closest(".partner-logo-card")
                          ?.classList.add("partner-logo-card--image-failed");
                      }}
                    />
                  ) : null}
                  <span
                    className="partner-logo-card__fallback"
                    aria-label={getPartnerTitle(partner)}
                  >
                    <span className="partner-logo-card__fallback-title">{getPartnerTitle(partner)}</span>
                  </span>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default Partner;
