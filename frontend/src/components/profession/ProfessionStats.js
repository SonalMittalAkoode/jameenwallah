/* ─── Financer: Dark navy band with gold ticker numbers ─── */
const FinancerStats = ({ stats }) => (
  <div className="fin-stats-band">
    <div className="container-fluid">
      <div className="fin-stats-band__inner">
        {stats.map((s, i) => (
          <div key={i} className="fin-stat-item" data-aos="fade-up" data-aos-delay={i * 80}>
            <div className="fin-stat-item__num">
              {s.number}<span>{s.suffix}</span>
            </div>
            <div className="fin-stat-item__label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Architect: Minimal typographic large numbers ─── */
const ArchitectStats = ({ stats }) => (
  <section className="arch-stats-section">
    <div className="container">
      <div className="arch-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="arch-stat-item" data-aos="fade-up" data-aos-delay={i * 80}>
            <div className="arch-stat-item__num">
              {s.number}<span>{s.suffix}</span>
            </div>
            <div className="arch-stat-item__divider" />
            <div className="arch-stat-item__label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── CA: Ledger-style green accent rows ─── */
const CAStats = ({ stats }) => (
  <section className="ca-stats-section">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-lg-3 mb30-md">
          <p className="ca-stats-section__eyebrow">Our Track<br />Record</p>
        </div>
        <div className="col-lg-9">
          <div className="ca-stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="ca-stat-item" data-aos="fade-up" data-aos-delay={i * 80}>
                <div className="ca-stat-item__num">{s.number}{s.suffix}</div>
                <div className="ca-stat-item__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─── Default (Lawyer-style) ─── */
const DefaultStats = ({ stats }) => (
  <section className="lawyer-stats">
    <div className="container-fluid px-0">
      <div className="row g-0">
        {stats.map((s, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="lawyer-stat-item" data-aos="fade-up" data-aos-delay={i * 80}>
              <div className="stat-number">{s.number}<span>{s.suffix}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── PM: Dark stats band like Financer but red ─── */
const PMStats = ({ stats }) => (
  <section className="pm-stats-section">
    <div className="container">
      <div className="pm-stats-section__inner">
        {stats.map((s, i) => (
          <div key={i} className="pm-stat-item" data-aos="fade-up" data-aos-delay={i * 80}>
            <div className="pm-stat-item__num">
              {s.number}<span>{s.suffix}</span>
            </div>
            <div className="pm-stat-item__label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProfessionStats = ({ stats, profession }) => {
  if (profession === "financer") return <FinancerStats stats={stats} />;
  if (profession === "architect") return <ArchitectStats stats={stats} />;
  if (profession === "ca") return <CAStats stats={stats} />;
  if (profession === "pm") return <PMStats stats={stats} />;
  return <DefaultStats stats={stats} />;
};

export default ProfessionStats;
