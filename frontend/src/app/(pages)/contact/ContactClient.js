"use client";

import { useState } from "react";
import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";

function Icon({ name, size = 20, color = "#ff385c", strokeWidth = 2 }) {
  const paths = {
    phone:    <path strokeLinecap="round" strokeLinejoin="round" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />,
    mail:     <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    clock:    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    shield:   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    star:     <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    check:    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
    map:      <><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>,
    lock:     <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    arrow:    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />,
    award:    <><circle cx="12" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></>,
    users:    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
    lightning:<path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
    home:     <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    whatsapp: <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const BENEFITS = [
  "Expert guidance on property valuation and selection",
  "Hassle-free financial planning and tax advisory",
  "Transparent deals with verified builders and owners",
  "End-to-end support from search to registration",
];

const CHANNELS = [
  { icon: "phone", label: "Phone",         value: "+91 12345 67890",          sub: "Mon – Sat, 9AM – 7PM" },
  { icon: "mail",  label: "Email",         value: "support@jameenwallah.com", sub: "24hr email support"    },
  { icon: "clock", label: "Working Hours", value: "9:00 AM – 7:00 PM",        sub: "Monday to Saturday"    },
];

const STATS = [
  { number: "5000+", label: "Properties Listed"   },
  { number: "12+",   label: "Years Experience"    },
  { number: "98%",   label: "Client Satisfaction" },
];

const WHY_CARDS = [
  { icon: "award",     title: "12+ Years Experience", desc: "Over a decade of trusted expertise navigating Gurgaon's fast-moving real estate market." },
  { icon: "users",     title: "Verified Advisors",    desc: "Every advisor is RERA-certified and thoroughly background-checked for your peace of mind." },
  { icon: "lightning", title: "24hr Response Time",   desc: "Our team responds to every inquiry within one business day — guaranteed." },
];

const REACH_ITEMS = [
  { icon: "phone",    label: "Call Us",      value: "+91 12345 67890",          href: "tel:+911234567890"                },
  { icon: "whatsapp", label: "WhatsApp",     value: "Chat on WhatsApp",         href: "https://wa.me/911234567890"       },
  { icon: "mail",     label: "Email Us",     value: "support@jameenwallah.com", href: "mailto:support@jameenwallah.com"  },
  { icon: "home",     label: "Visit Office", value: "Sector 49, Gurugram",      href: "#office"                          },
];

export default function ContactPage({ content = {} }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const intro = content.sections?.intro || {};
  const formContent = content.sections?.form || {};
  const office = content.sections?.office || {};
  const benefits = Array.isArray(intro.benefits) && intro.benefits.length > 0
    ? intro.benefits
    : BENEFITS;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <div className="contact-page">

        {/* ── 1. BREADCRUMB HERO BANNER ── */}
        <section className="breadcumb-section2 p-0 about-breadcrumb-hero">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="breadcumb-style1">
                  <h1 className="title">
                    {content.sections?.hero?.title || content.title || "Contact Us"}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BREADCRUMB TRAIL ── */}
        {/* <section className="our-about pb30">
          <div className="container">
            <div className="row mb20">
              <div className="col-lg-12">
                <div className="about-page-breadcrumb">
                  <a href="/">Home</a>
                  <span className="breadcrumb-sep">›</span>
                  <a href="/contact">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* ── 2. HERO + FORM ── */}
        <section className="cp-hero">
          <div className="cp-hero__glow" aria-hidden="true" />
          <div className="cp-hero__glow-left" aria-hidden="true" />
          <div className="cp-container">
            <div className="cp-hero__grid">

              <div className="cp-hero__left">
                
                <h2 className="cp-hero__title">
                  {intro.title || "Get In Touch With Our Property & Financial Experts"}
                </h2>
                <p className="cp-hero__desc">
                  {intro.description ||
                    "Our experienced advisors guide you through every step — from finding your dream property to securing the best financial deal. Reliable, transparent, results-driven."}
                </p>
                <div className="cp-trust-row">
                  {[
                    { icon: "shield", label: "Verified Advisors" },
                    { icon: "clock",  label: "24hr Response"     },
                    { icon: "star",   label: "98% Satisfaction"  },
                  ].map((b) => (
                    <span key={b.label} className="cp-trust-badge">
                      <Icon name={b.icon} size={12} color="#ff8aaa" /> {b.label}
                    </span>
                  ))}
                </div>
                <ul className="cp-benefits">
                  {benefits.map((item) => (
                    <li key={item} className="cp-benefits__item">
                      <span className="cp-benefits__check">
                        <Icon name="check" size={10} color="#fff" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="cp-form-card">
                <div className="cp-form-card__head">
                  <h4>{formContent.title || "Have questions? Get in touch!"}</h4>
                  <p>We&apos;ll get back to you within 24 hours.</p>
                </div>
                {submitted ? (
                  <div className="cp-form-success">
                    <div className="cp-form-success__icon">
                      <Icon name="check" size={28} color="#ff385c" strokeWidth={2.5} />
                    </div>
                    <h4>Message Sent!</h4>
                    <p>Our team will contact you within 24 hours.</p>
                  </div>
                ) : (
                  <form className="cp-form-card__body" onSubmit={handleSubmit} noValidate>
                    <div className="cp-form-row">
                      <div className="cp-form-group">
                        <label htmlFor="cf-name">Full Name *</label>
                        <input id="cf-name" name="name" type="text" placeholder="Your name" value={form.name} onChange={handleChange} required />
                      </div>
                      <div className="cp-form-group">
                        <label htmlFor="cf-phone">Mobile Number *</label>
                        <input id="cf-phone" name="phone" type="tel" placeholder="+91 00000 00000" value={form.phone} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="cp-form-row full">
                      <div className="cp-form-group">
                        <label htmlFor="cf-email">Email Address *</label>
                        <input id="cf-email" name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="cp-form-row full">
                      <div className="cp-form-group">
                        <label htmlFor="cf-subject">Subject</label>
                        <input id="cf-subject" name="subject" type="text" placeholder="How can we help you?" value={form.subject} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="cp-form-row full" style={{ marginBottom: 6 }}>
                      <div className="cp-form-group">
                        <label htmlFor="cf-message">Message *</label>
                        <textarea id="cf-message" name="message" placeholder="Tell us about your requirements..." value={form.message} onChange={handleChange} required />
                      </div>
                    </div>
                    <button type="submit" className="cp-submit-btn" disabled={loading}>
                      {loading ? "Sending…" : "Send Message"}
                      {!loading && <Icon name="arrow" size={16} color="#fff" />}
                    </button>
                  </form>
                )}
                <div className="cp-form-card__footer">
                  <Icon name="lock" size={13} color="var(--dark-40)" />
                  Your information is safe with us. No spam, ever.
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. CHANNELS + STATS ── */}
        <section className="cp-channels">
          <div className="cp-container">
            <div className="cp-channels__grid">
              {CHANNELS.map((c) => (
                <div key={c.label} className="cp-channel-card">
                  <div className="cp-channel-card__icon"><Icon name={c.icon} size={22} color="#ff385c" /></div>
                  <div className="cp-channel-card__label">{c.label}</div>
                  <div className="cp-channel-card__value">{c.value}</div>
                  <div className="cp-channel-card__sub">{c.sub}</div>
                </div>
              ))}
            </div>
            <div className="cp-stats-strip">
              {STATS.map((s) => (
                <div key={s.label} className="cp-stat-item">
                  <div className="cp-stat-item__number">{s.number}</div>
                  <div className="cp-stat-item__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. WHY CHOOSE US ── */}
        <section className="cp-why">
          <div className="cp-container">
            <div className="cp-why__header">
              <div>
                <h2 className="cp-sec-title">Trusted by <span>Thousands</span> of Home Buyers</h2>
              </div>
              <p className="cp-sec-desc">
                We combine deep local knowledge with financial expertise to make your property journey seamless.
              </p>
            </div>
            <div className="cp-why__grid">
              {WHY_CARDS.map((w) => (
                <div key={w.title} className="cp-why-card">
                  <div className="cp-why-card__icon"><Icon name={w.icon} size={22} color="#ff385c" /></div>
                  <h4>{w.title}</h4>
                  <p>{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. OFFICE & MAP ── */}
        <section className="cp-office" id="office">
          <div className="cp-container">
            <div className="cp-office__header">
              <h2 className="cp-sec-title">{office.title || "Visit Our Office"}</h2>
              <p className="cp-sec-desc">
                {office.description ||
                  "Meet our experts in person for personalised consultation on property, investment, and financial planning."}
              </p>
            </div>
            <div className="cp-office__info-grid">
              {[
                { icon: "map",   label: "Address",        value: "Tower-A, Spaze iTech Park, Block S,\nSector 49, Gurugram 122018" },
                { icon: "phone", label: "Phone",          value: "+91 12345 67890\n+91 12345 67891"                                },
                { icon: "clock", label: "Business Hours", value: "Mon – Fri: 9:00 AM – 7:00 PM\nSaturday: 10:00 AM – 5:00 PM"     },
              ].map((o) => (
                <div key={o.label} className="cp-office-card">
                  <div className="cp-office-card__icon"><Icon name={o.icon} size={19} color="#ff385c" /></div>
                  <div>
                    <div className="cp-office-card__label">{o.label}</div>
                    <div className="cp-office-card__value">
                      {o.value.split("\n").map((line, i, arr) => (
                        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cp-map-wrapper">
              <iframe
                loading="lazy"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3509.1874737264993!2d77.03974897444208!3d28.413599475785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d229af98d06d9%3A0xa5952f520ac028f!2sTower-A%2C%20SPAZE%20ITECH%20PARK%2C%20Block%20S%2C%20Sispal%20Vihar%2C%20Sector%2049%2C%20Gurugram%2C%20Haryana%20122018!5e0!3m2!1sen!2sin!4v1775542511816!5m2!1sen!2sin"
                title="Spaze iTech Park, Sector 49, Gurugram"
                aria-label="Office location on Google Maps"
              />
            </div>
          </div>
        </section>

        

        {/* ── 7. CTA ── */}
        <section className="cp-cta">
          <div className="cp-container">
            <div className="cp-cta__inner">
              <h2 className="cp-cta__title">Find Your Dream Property in <span>Gurgaon</span></h2>
              <p className="cp-cta__desc">
                Luxury apartments to high-return investments — JameenWallah connects you with the best Gurgaon properties.
              </p>
              <div className="cp-cta__buttons">
                <a href="/properties" className="cp-btn cp-btn--primary">
                  Explore Properties <Icon name="arrow" size={16} color="#fff" />
                </a>
                <a href="tel:+911234567890" className="cp-btn cp-btn--ghost">
                  <Icon name="phone" size={16} color="#fff" /> Call Us Now
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}
