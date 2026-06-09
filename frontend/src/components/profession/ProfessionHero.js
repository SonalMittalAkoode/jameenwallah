"use client";
import Link from "next/link";

/* ─── Financer: Bloomberg / Wealth management feel ─── */
const FinancerHero = ({ data }) => (
  <section className="pf-hero fin-hero">
    <div
      className="fin-hero__bg"
      style={{ backgroundImage: `url(${data.heroBg})` }}
    />
    <div className="fin-hero__overlay" />

    <div className="fin-hero__orb fin-hero__orb--one" />
    <div className="fin-hero__orb fin-hero__orb--two" />

    <div className="container position-relative" style={{ zIndex: 1 }}>
      <div className="row align-items-center">
        <div className="col-xl-7 col-lg-8 col-md-10">
          <div className="fin-hero__content" data-aos="fade-right">
            <span className="fin-section-badge fin-section-badge--dark">
              <i className="fas fa-chart-line" />
              Smart Finance & Wealth Guidance
            </span>

            <h1 className="fin-hero__title">{data.title}</h1>

            <p className="fin-hero__desc">{data.desc}</p>

            <div className="fin-hero__actions">
              <Link href="/contact" className="fin-btn fin-btn--primary">
                {data.ctaPrimary}
                <i className="fal fa-arrow-right-long ms-2" />
              </Link>

              <Link href={`#${data.servicesId}`} className="fin-btn fin-btn--white">
                Explore Services
                <i className="fal fa-arrow-right-long ms-2" />
              </Link>
            </div>

            <div className="fin-hero__metrics">
              <div className="fin-hero__metric">
                <strong>Fast</strong>
                <span>Loan Support</span>
              </div>
              <div className="fin-hero__metric">
                <strong>Secure</strong>
                <span>Planning</span>
              </div>
              <div className="fin-hero__metric">
                <strong>Expert</strong>
                <span>Advisory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─── Architect: Blueprint / Design studio feel ─── */
const ArchitectHero = ({ data }) => (
  <section className="pf-hero arch-hero">
    <div className="arch-hero__bg" style={{ backgroundImage: `url(${data.heroBg})` }} />
    <div className="arch-hero__grid-overlay" aria-hidden="true" />
    <div className="arch-hero__tint" />
    <div className="container arch-hero__inner">
      <div className="row">
        <div className="col-lg-7" data-aos="fade-right" data-aos-delay="100">
          {/* <span className="arch-hero__eyebrow">
            <span className="arch-hero__line" />
            {data.kicker}
          </span> */}
          <p className="arch-hero__title" style={{ fontWeight: 300 }} dangerouslySetInnerHTML={{ __html: data.title.replace("\n", "<br/>") }} />
          <p className="arch-hero__desc">{data.desc}</p>
          <div className="arch-hero__cta-row" data-aos="fade-up" data-aos-delay="300">
            <Link href="/contact" className="arch-hero__cta-btn">
              {data.ctaPrimary} <i className="fal fa-arrow-right-long ms-2" />
            </Link>
            <Link href={`#${data.servicesId}`} className="arch-hero__scroll-link">
              <i className="fas fa-arrow-down me-2" />Explore Work
            </Link>
          </div>
        </div>
      </div>
    </div>
    <div className="arch-hero__accent-num" aria-hidden="true">300+</div>
  </section>
);

const CAHero = ({ data }) => (
  <section className="pf-hero ca-hero">
    <div className="ca-hero__bg" style={{ backgroundImage: `url(${data.heroBg})` }} />
    <div className="ca-hero__overlay" />
    <div className="container ca-hero__container">
      <div className="row">
        <div className="col-lg-10" data-aos="fade-up">
          <div className="ca-hero__content">
            {/* <div className="ca-hero__certified mx-auto">
              <span className="ca-hero__dot" />ICAI Certified Professionals
            </div> */}
            <h1 className="ca-hero__title">{data.title}</h1>
            <p className="ca-hero__desc">{data.desc}</p>
            <div className="ca-hero__actions">
              <Link href="/contact" className="ca-hero__btn-primary">
                {data.ctaPrimary} <i className="fal fa-arrow-right-long ms-2" />
              </Link>
              <Link href={`#${data.servicesId}`} className="ca-hero__btn-outline">
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
const PMHero = ({ data }) => (
  <section className="pf-hero pm-hero">
    <div className="pm-hero__bg" style={{ backgroundImage: `url(${data.heroBg})` }} />
    <div className="pm-hero__grid-overlay" aria-hidden="true" />
    <div className="pm-hero__tint" />
    <div className="container pm-hero__inner">
      <div className="row align-items-center g-5">
        <div className="col-lg-7" data-aos="fade-right" data-aos-delay="100">
          {/* <div className="pm-hero__eyebrow">
            <i className="fas fa-project-diagram" />{data.kicker}
          </div> */}
          <h1 className="pm-hero__title">{data.title}</h1>
          <p className="pm-hero__desc">{data.desc}</p>
          <div className="pm-hero__actions">
            <Link href="/contact" className="pm-hero__btn-primary">
              {data.ctaPrimary} <i className="fal fa-arrow-right-long" />
            </Link>
            <Link href={`#${data.servicesId}`} className="pm-hero__btn-ghost">
              <i className="fas fa-list-check" /> Our Services
            </Link>
          </div>
        </div>
        <div className="col-lg-5" data-aos="fade-left" data-aos-delay="200">
          {/* <div className="pm-hero__metrics">
            {[
              { icon: "fas fa-tasks", num: "400+", label: "Projects Delivered" },
              { icon: "fas fa-clock", num: "98%", label: "On-Time Rate" },
              { icon: "fas fa-rupee-sign", num: "₹0", label: "Budget Overruns" },
              { icon: "fas fa-user-shield", num: "12+", label: "Years Experience" },
            ].map((m, i) => (
              <div key={i} className="pm-metric-card" data-aos="fade-up" data-aos-delay={200 + i * 80}>
                <div className="pm-metric-card__icon"><i className={m.icon} /></div>
                <div className="pm-metric-card__num">{m.num}</div>
                <div className="pm-metric-card__label">{m.label}</div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  </section>
);

/* ─── Default / Lawyer-style ─── */
const DefaultHero = ({ data }) => (
  <section className="lawyer-hero pt60 pb40" style={{ backgroundImage: `url(${data.heroBg})` }}>
    <div className="container">
      <div className="row">
        <div className="col-lg-7 col-md-9" data-aos="fade-right" data-aos-delay="100">
          <p className="lawyer-hero__kicker">{data.kicker}</p>
          <p className="lawyer-hero__title">{data.title}</p>
          <p className="lawyer-hero__desc">{data.desc}</p>
          <div className="d-flex flex-wrap gap-3">
            <Link href="/contact" className="ud-btn btn-thm">
              {data.ctaPrimary} <i className="fal fa-arrow-right-long ms-2" />
            </Link>
            <Link href={`#${data.servicesId}`} className="ud-btn btn-white2">
              Our Services <i className="fal fa-arrow-right-long ms-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ProfessionHero = ({ data, profession }) => {
  if (profession === "financer") return <FinancerHero data={data} />;
  if (profession === "architect") return <ArchitectHero data={data} />;
  if (profession === "ca") return <CAHero data={data} />;
  if (profession === "pm") return <PMHero data={data} />;
  return <DefaultHero data={data} />;
};

export default ProfessionHero;
