import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import Image from "next/image";
import Link from "next/link";
import ProfessionConsultationForm from "@/components/profession/ProfessionConsultationForm";

const StarRating = ({ rating }) => (
  <div className="ld-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <i key={s} className={s <= rating ? "fas fa-star" : "far fa-star"} />
    ))}
    <span className="ld-stars__label">{rating}.0 / 5.0</span>
  </div>
);

const ProfessionDetailPage = ({
  member,
  breadcrumbLabel,
  breadcrumbHref,
  statLabel,
  sectionTitles = {},
}) => (
  <>
    <DefaultHeader />
    <MobileMenu />
    <section className="breadcumb-section2 p-0">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="breadcumb-style1">
              <h1 className="title">{member.name}</h1>
              <div className="breadcumb-list">
                <a href="/">Home</a>
                <a href={breadcrumbHref}>{breadcrumbLabel}</a>
                <a href={`${breadcrumbHref}/${member.slug}`}>{member.name}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="pt60 pb80 pb50-md">
      <div className="container">
        <div className="row g-4 g-xl-5 align-items-start">

          {/* ===== LEFT: Profile ===== */}
          <div className="col-lg-8">
            {/* Profile card */}
            <div className="ld-profile-card" data-aos="fade-up">
              <div className="ld-profile-card__media">
                <Image
                  src={member.img}
                  alt={member.name}
                  width={320}
                  height={360}
                  className="ld-profile-card__photo"
                  priority
                />
              </div>
              <div className="ld-profile-card__info">
                <span className="ld-rating-badge">
                  <i className="fas fa-star me-1" /> {member.rating} Rating
                </span>
                <h2 className="ld-profile-card__name">{member.name}</h2>
                <p className="ld-profile-card__role">{member.role}</p>
                <StarRating rating={member.rating} />
                <div className="ld-profile-card__pills">
                  <span className="ld-pill"><i className="fas fa-briefcase" /> {member.exp}</span>
                  <span className="ld-pill"><i className="fas fa-star" /> {member.speciality}</span>
                  <span className="ld-pill"><i className="fas fa-trophy" /> {member.caseswon}+ {statLabel || "Clients"}</span>
                  <span className="ld-pill ld-pill--accent"><i className="fas fa-percent" /> {member.successrate}% Success</span>
                </div>
                <div className="ld-contact-row">
                  <a href={`tel:${member.phone}`} className="ld-contact-row__item">
                    <i className="fas fa-phone" />{member.phone}
                  </a>
                  <a href={`mailto:${member.email}`} className="ld-contact-row__item">
                    <i className="fas fa-envelope" />{member.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="ld-stats-row" data-aos="fade-up" data-aos-delay="100">
              <div className="ld-stat-box">
                <div className="ld-stat-box__num">{member.caseswon}<span>+</span></div>
                <div className="ld-stat-box__label">{statLabel || "Clients"}</div>
              </div>
              <div className="ld-stat-box">
                <div className="ld-stat-box__num">{member.successrate}<span>%</span></div>
                <div className="ld-stat-box__label">Success Rate</div>
              </div>
              <div className="ld-stat-box">
                <div className="ld-stat-box__num">{parseInt(member.exp)}<span>+</span></div>
                <div className="ld-stat-box__label">Years Exp.</div>
              </div>
              <div className="ld-stat-box">
                <div className="ld-stat-box__num">{member.rating}<span>/5</span></div>
                <div className="ld-stat-box__label">Client Rating</div>
              </div>
            </div>

            {/* About */}
            {member.bio && (
              <div className="ld-section" data-aos="fade-up" data-aos-delay="120">
                <h3 className="ld-section__title">About</h3>
                <p className="text mb15" dangerouslySetInnerHTML={{ __html: member.bio }}></p>
                {member.bio2 && <p className="text mb-0" dangerouslySetInnerHTML={{ __html: member.bio2 }}></p>}
              </div>
            )}

            {/* Expertise */}
            <div className="ld-section" data-aos="fade-up" data-aos-delay="140">
              <h3 className="ld-section__title">
                {sectionTitles.expertise || "Areas of Expertise"}
              </h3>
              <ul className="ld-expertise-list">
                {member.expertise.map((item, i) => (
                  <li key={i} className="ld-expertise-list__item">
                    <i className="fas fa-circle-check" />{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Education */}
            <div className="ld-section" data-aos="fade-up" data-aos-delay="160">
              <h3 className="ld-section__title">
                {sectionTitles.education || "Education & Qualifications"}
              </h3>
              {member.education.map((edu, i) => (
                <div key={i} className="ld-edu-item">
                  <div className="ld-edu-item__icon"><i className="fas fa-graduation-cap" /></div>
                  <div>
                    <div className="ld-edu-item__degree">{edu.degree}</div>
                    <div className="ld-edu-item__institute">{edu.institute}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Courts / Affiliations */}
            <div className="ld-section" data-aos="fade-up" data-aos-delay="180">
              <h3 className="ld-section__title">
                {sectionTitles.courts || "Affiliations & Empanelments"}
              </h3>
              <div className="ld-courts-list">
                {member.courts.map((c, i) => (
                  <span key={i} className="ld-court-badge">
                    <i className="fas fa-landmark me-1" />{c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ===== RIGHT: Contact Form ===== */}
          <div className="col-lg-4" data-aos="fade-left" data-aos-delay="200">
            <div className="ld-contact-form-card">
              <div className="ld-contact-form-card__header">
                <h4>Book a Consultation</h4>
                <p>Get expert advice tailored to your specific requirements.</p>
              </div>

              <ProfessionConsultationForm
                memberName={member.name}
                expertise={Array.isArray(member.expertise) ? member.expertise : []}
                accountType={member.accountType || ""}
                accountId={member.accountId || ""}
              />

              {/* <div className="ld-contact-form-card__footer">
                <p className="mb10 text-center fz13" style={{ color: "#888" }}>Or reach out directly</p>
                <a href={`tel:${member.phone}`} className="ld-footer-contact-btn">
                  <i className="fas fa-phone" />{member.phone}
                </a>
                <a href={`mailto:${member.email}`} className="ld-footer-contact-btn ld-footer-contact-btn--email">
                  <i className="fas fa-envelope" />{member.email}
                </a>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="footer-style1 pt60 pb-0">
      <Footer />
    </section>
  </>
);

export default ProfessionDetailPage;

