import Link from "next/link";
import Image from "next/image";

/*
  ┌─────────────────────────────────────────────────────┐
  │  SERVICE ICONS — map each item to a FontAwesome icon │
  │  (uses the same "fal fa-*" set as the rest of app)   │
  └─────────────────────────────────────────────────────*/
const SERVICE_ICONS = [
  "fal fa-comments",        // Property Consulting
  "fal fa-balance-scale",   // Legal Assistance
  "fal fa-coins",           // Financial Advisory
  "fal fa-building",        // Property Management
  "fal fa-robot",           // AI-Powered Solutions
  "fal fa-chart-pie",       // Growth Analysis
];

/*
  ┌────────────────────────────────────────────────────────┐
  │  WhatWeDo                                              │
  │  Props:                                                │
  │    title   – section heading (string | ReactNode)      │
  │    items   – [{ title: string, text: string }]         │
  └────────────────────────────────────────────────────────*/
const WhatWeDo = ({ title = "What We Do", items = [] }) => {
  return (
    <section className="wwd-section">
      {/* ── Decorative background blobs ── */}
      <div className="wwd-bg-shape wwd-bg-shape--1" aria-hidden="true" />
      <div className="wwd-bg-shape wwd-bg-shape--2" aria-hidden="true" />

      <div className="wwd-inner">
        <div className="wwd-layout">

          {/* ══════════════ LEFT — content ══════════════ */}
          <div className="wwd-content-col" data-aos="fade-right" data-aos-delay="100">


            {/* Heading */}
            <h2 className="wwd-title">
              Everything You Need,{" "}
              <span>Under One Roof</span>
            </h2>

            {/* Subtitle */}
            {/* <p className="wwd-subtitle">
              From the first search to the final handshake — JameenWallah
              brings together every service a property buyer or investor could
              need.
            </p> */}

            {/* Service list */}
            <ul className="wwd-list">
              {items.map((item, i) => (
                <li key={i} className="wwd-item">
                  <div className="wwd-item__icon" aria-hidden="true">
                    <i className={SERVICE_ICONS[i] || "fal fa-check-circle"} />
                  </div>
                  <div className="wwd-item__body">
                    <p className="wwd-item__title">{item.title}</p>
                    <p className="wwd-item__text">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link href="/properties" className="wwd-btn">
              Explore Properties
              <i className="fal fa-arrow-right-long" aria-hidden="true" />
            </Link>
          </div>

          {/* ══════════════ RIGHT — image ══════════════ */}
          <div
            className="wwd-img-col"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            {/* Decorative ring & dot behind the photo */}
            <div className="wwd-img-ring" aria-hidden="true" />
            <div className="wwd-img-dot"  aria-hidden="true" />

            <div className="wwd-img-wrap">
              <Image
                src="/images/about/about.jpg"
                alt="JameenWallah property consulting and advisory"
                width={600}
                height={520}
                sizes="(max-width: 991px) 100vw, 50vw"
                priority={false}
              />

              {/* Floating stats badge */}
              <div className="wwd-img-badge">
                <div className="wwd-img-badge__icon" aria-hidden="true">
                  <i className="fal fa-home" />
                </div>
                <div>
                  <p className="wwd-img-badge__label">Properties Sold</p>
                  <p className="wwd-img-badge__value">2,000+</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;