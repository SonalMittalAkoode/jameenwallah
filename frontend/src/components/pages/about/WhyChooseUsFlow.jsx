import Link from 'next/link';

const features = [
  {
    icon: "fal fa-shield-check",
    title: "Trust & Transparency",
    desc: "Every listing is verified and presented with complete honesty — no hidden surprises.",
  },
  {
    icon: "fal fa-check-circle",
    title: "Verified Listings",
    desc: "All properties go through a thorough verification process before being listed.",
  },
  {
    icon: "fal fa-route",
    title: "Stress-Free Journey",
    desc: "We guide you through every step, from discovery to key handover.",
  },
  {
    icon: "fal fa-user-tie",
    title: "Expert Guidance",
    desc: "Our specialists bring deep market knowledge to help you make confident decisions.",
  },
  {
    icon: "fal fa-chart-line",
    title: "Data-Driven Insights",
    desc: "AI-powered tools and analytics to help you invest with clarity.",
  },
  {
    icon: "fal fa-handshake",
    title: "End-to-End Support",
    desc: "Legal, financial, and post-purchase support all in one place.",
  },
];

const stats = [
  { number: "10K+", label: "Properties Listed" },
  { number: "2K+",  label: "Happy Buyers"      },
  { number: "5+",   label: "Years Experience"   },
];

const WhyChooseUs = () => {
  return (
    <div className="wcu-section">
      <div className="container">

        {/* ── Header ── */}
        <div className="wcu-header" data-aos="fade-up" data-aos-delay="100">
          
          <h2 className="wcu-header__title">
            Real Estate Built on <span>Trust</span>
          </h2>
          <p className="wcu-header__subtitle">
            A real estate partner committed to expertise, transparency, and results you can count on.
          </p>
        </div>

        {/* ── Feature Cards ── */}
        <div className="wcu-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="wcu-card"
              data-aos="fade-up"
              data-aos-delay={100 + i * 60}
            >
              <span className="wcu-card__number">0{i + 1}</span>
              <div className="wcu-card__icon-wrap">
                <i className={f.icon} />
              </div>
              <h5 className="wcu-card__title">{f.title}</h5>
              <p className="wcu-card__desc">{f.desc}</p>
              <div className="wcu-card__line" />
            </div>
          ))}
        </div>

        {/* ── Stats Bar ── */}
        <div className="wcu-stats" data-aos="fade-up" data-aos-delay="400">
          {stats.map((s, i) => (
            <div key={i} className="wcu-stat">
              <span className="wcu-stat__number">{s.number}</span>
              <span className="wcu-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default WhyChooseUs;
