const stats = [
  { number: "500", suffix: "+", label: "Cases Won" },
  { number: "95", suffix: "%", label: "Success Rate" },
  { number: "12", suffix: "+", label: "Years of Experience" },
  { number: "200", suffix: "+", label: "Happy Clients" },
];

const LawyerStats = () => {
  return (
    <section className="lawyer-stats">
      <div className="container-fluid px-0">
        <div className="row g-0">
          {stats.map((stat, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="lawyer-stat-item" data-aos="fade-up" data-aos-delay={i * 80}>
                <div className="stat-number">
                  {stat.number}
                  <span>{stat.suffix}</span>
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LawyerStats;
