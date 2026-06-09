import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { resolveImageSrc } from "@/utils/resolveImage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// We cannot reliably generateStaticParams for a fully dynamic DB-driven structure without a separate fetch request here.
// Omitting it safely falls back to dynamic rendering on demand in Next.js

// Dynamic metadata
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API_BASE_URL}/frontend/api/lawyer/${params.slug}`);
    const data = await res.json();
    const lawyer = data.data;

    if (!lawyer) return {};

    return {
      title: `${lawyer.name || "Lawyer"} | JameenWallah Legal`,
      description: `${lawyer.metaTitle || lawyer.description || "Expert Legal Services"}. Connect with ${lawyer.name} at JameenWallah.`,
    };
  } catch (err) {
    return { title: 'Lawyer | JameenWallah Legal' };
  }
}

const StarRating = ({ rating }) => (
  <div className="ld-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <i key={s} className={s <= rating ? "fas fa-star" : "far fa-star"} />
    ))}
    <span className="ld-stars__label">{rating}.0 / 5.0</span>
  </div>
);

export default async function LawyerDetailPage({ params }) {
  let dbLawyer = null;

  try {
    const res = await fetch(`${API_BASE_URL}/frontend/api/lawyer/${params.slug}`, {
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!res.ok) notFound();
    
    const data = await res.json();
    dbLawyer = data.data;
  } catch (error) {
    console.error("Failed to fetch Lawyer details", error);
    notFound();
  }

  if (!dbLawyer) notFound();

  // Map to the shape expected by UI, gracefully providing fallbacks for fields not present in the DB schema
  const lawyer = {
    name: dbLawyer.name || "Legal Expert",
    role: dbLawyer.metaTitle || "Senior Legal Expert",
    speciality: dbLawyer.description ? (dbLawyer.description.length > 50 ? dbLawyer.description.substring(0, 50) + "..." : dbLawyer.description).replace(/(<([^>]+)>)/gi, "") : "Legal Services & Consultation",
    exp: "Expert",
    caseswon: "100+",
    successrate: "95",
    rating: 5,
    bio: dbLawyer.description || "Expert real estate lawyer.",
    bio2: "",
    expertise: ["Property Dispute Resolution", "Title Verification & Litigation", "Regulatory Compliance"],
    education: [{ degree: "LLB", institute: "Recognized Law School" }],
    courts: ["Civil Courts", "High Court"],
    phone: dbLawyer.phoneNumber || "+91 00000 00000",
    email: dbLawyer.email || "contact@jameenwallah.com",
    img: resolveImageSrc(dbLawyer.image)
  };

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      {/* Breadcrumb */}
      <section className="breadcumb-section2 p-0">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcumb-style1">
                <h1 className="title">{lawyer.name}</h1>
                <div className="breadcumb-list">
                  <a href="/">Home</a>
                  <a href="/lawyer">Legal Services</a>
                  <a href={`/lawyer/${params.slug}`}>{lawyer.name}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="pt60 pb80 pb50-md">
        <div className="container">
          <div className="row g-4 g-xl-5 align-items-start">

            {/* ============ LEFT: Profile ============ */}
            <div className="col-lg-8">

              {/* Profile card */}
              <div className="ld-profile-card" data-aos="fade-up">
                <div className="ld-profile-card__media">
                  <Image
                    src={lawyer.img}
                    alt={lawyer.name}
                    width={320}
                    height={360}
                    className="ld-profile-card__photo"
                    priority
                  />
                </div>
                <div className="ld-profile-card__info">
                  {/* Badge */}
                  <span className="ld-rating-badge">
                    <i className="fas fa-star me-1" />
                    {lawyer.rating} Rating
                  </span>

                  <h2 className="ld-profile-card__name">{lawyer.name}</h2>
                  <p className="ld-profile-card__role">{lawyer.role}</p>
                  <StarRating rating={lawyer.rating} />

                  {/* Quick meta pills */}
                  <div className="ld-profile-card__pills">
                    <span className="ld-pill">
                      <i className="fas fa-briefcase" /> {lawyer.exp}
                    </span>
                    <span className="ld-pill">
                      <i className="fas fa-gavel" /> {lawyer.speciality}
                    </span>
                    <span className="ld-pill">
                      <i className="fas fa-trophy" /> {lawyer.caseswon} Cases
                    </span>
                    <span className="ld-pill ld-pill--accent">
                      <i className="fas fa-percent" /> {lawyer.successrate}% Success
                    </span>
                  </div>

                  {/* Contact row */}
                  <div className="ld-contact-row">
                    <a href={`tel:${lawyer.phone}`} className="ld-contact-row__item">
                      <i className="fas fa-phone" />
                      {lawyer.phone}
                    </a>
                    <a href={`mailto:${lawyer.email}`} className="ld-contact-row__item">
                      <i className="fas fa-envelope" />
                      {lawyer.email}
                    </a>
                  </div>
                </div>
              </div>
              {/* End profile card */}

              {/* Stats row */}
              <div className="ld-stats-row" data-aos="fade-up" data-aos-delay="100">
                <div className="ld-stat-box">
                  <div className="ld-stat-box__num">{lawyer.caseswon}</div>
                  <div className="ld-stat-box__label">Cases Won</div>
                </div>
                <div className="ld-stat-box">
                  <div className="ld-stat-box__num">{lawyer.successrate}<span>%</span></div>
                  <div className="ld-stat-box__label">Success Rate</div>
                </div>
                <div className="ld-stat-box">
                  <div className="ld-stat-box__num">10<span>+</span></div>
                  <div className="ld-stat-box__label">Years Exp.</div>
                </div>
                <div className="ld-stat-box">
                  <div className="ld-stat-box__num">{lawyer.rating}<span>/5</span></div>
                  <div className="ld-stat-box__label">Client Rating</div>
                </div>
              </div>

              {/* Bio */}
              <div className="ld-section" data-aos="fade-up" data-aos-delay="120">
                <h3 className="ld-section__title">About</h3>
                <p className="text mb15" dangerouslySetInnerHTML={{ __html: lawyer.bio }}></p>
                <p className="text mb-0">{lawyer.bio2}</p>
              </div>

              {/* Expertise */}
              <div className="ld-section" data-aos="fade-up" data-aos-delay="140">
                <h3 className="ld-section__title">Areas of Expertise</h3>
                <ul className="ld-expertise-list">
                  {lawyer.expertise.map((item, i) => (
                    <li key={i} className="ld-expertise-list__item">
                      <i className="fas fa-circle-check" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Education */}
              <div className="ld-section" data-aos="fade-up" data-aos-delay="160">
                <h3 className="ld-section__title">Education</h3>
                {lawyer.education.map((edu, i) => (
                  <div key={i} className="ld-edu-item">
                    <div className="ld-edu-item__icon">
                      <i className="fas fa-graduation-cap" />
                    </div>
                    <div>
                      <div className="ld-edu-item__degree">{edu.degree}</div>
                      <div className="ld-edu-item__institute">{edu.institute}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Courts */}
              <div className="ld-section" data-aos="fade-up" data-aos-delay="180">
                <h3 className="ld-section__title">Courts & Tribunals</h3>
                <div className="ld-courts-list">
                  {lawyer.courts.map((court, i) => (
                    <span key={i} className="ld-court-badge">
                      <i className="fas fa-landmark me-1" />{court}
                    </span>
                  ))}
                </div>
              </div>

            </div>
            {/* End LEFT */}

            {/* ============ RIGHT: Sticky Form ============ */}
            <div className="col-lg-4" data-aos="fade-left" data-aos-delay="200">
              <div className="ld-contact-form-card">
                <div className="ld-contact-form-card__header">
                  <h4>Book a Consultation</h4>
                  <p>Get expert legal advice tailored to your property matter.</p>
                </div>

                <form className="ld-contact-form-card__body">
                  {/* Name */}
                  <div className="mb15">
                    <label className="ld-form-label">Full Name *</label>
                    <div className="ld-input-wrap">
                      <i className="fas fa-user" />
                      <input
                        type="text"
                        className="form-control ld-form-input"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="mb15">
                    <label className="ld-form-label">Phone Number *</label>
                    <div className="ld-input-wrap">
                      <i className="fas fa-phone" />
                      <input
                        type="tel"
                        className="form-control ld-form-input"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb15">
                    <label className="ld-form-label">Email Address</label>
                    <div className="ld-input-wrap">
                      <i className="fas fa-envelope" />
                      <input
                        type="email"
                        className="form-control ld-form-input"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Legal Issue */}
                  <div className="mb15">
                    <label className="ld-form-label">Legal Matter *</label>
                    <div className="ld-input-wrap ld-input-wrap--select">
                      <i className="fas fa-gavel" />
                      <select className="form-control ld-form-input ld-form-select">
                        <option value="">Select your issue</option>
                        <option>Property Dispute</option>
                        <option>Title Verification</option>
                        <option>RERA Compliance</option>
                        <option>Sale Deed / Agreement</option>
                        <option>Succession / Inheritance</option>
                        <option>NRI Legal Matter</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb20">
                    <label className="ld-form-label">Brief Description</label>
                    <textarea
                      className="form-control ld-form-input ld-form-textarea"
                      rows={4}
                      placeholder="Describe your legal matter briefly..."
                    />
                  </div>

                  {/* Submit */}
                  <button type="button" className="ud-btn btn-thm w-100">
                    Send Message
                  </button>

                  {/* <p className="ld-form-note">
                    <i className="fas fa-lock me-1" />
                    Your information is 100% confidential.
                  </p> */}
                </form>

                {/* Direct contact */}
                {/* <div className="ld-contact-form-card__footer">
                  <p className="mb10 text-center fz13" style={{ color: "#888" }}>
                    Or reach out directly
                  </p>
                  <a href={`tel:${lawyer.phone}`} className="ld-footer-contact-btn">
                    <i className="fas fa-phone" />
                    {lawyer.phone}
                  </a>
                  <a href={`mailto:${lawyer.email}`} className="ld-footer-contact-btn ld-footer-contact-btn--email">
                    <i className="fas fa-envelope" />
                    {lawyer.email}
                  </a>
                </div> */}
              </div>
            </div>
            {/* End RIGHT */}

          </div>
        </div>
      </section>

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}

