import Image from "next/image";

const ProfessionWhyUs = ({
  features,
  image,
  kicker,
  title,
  desc,
  ctaLabel,
  profession,
}) => {
  const isFinancer = profession === "financer";
  const isReversed = isFinancer;

  return (
    <section
      className={`prof-why-section prof-why--${profession || "default"}`}
    >
      <div className="container">
        <div
          className={`row align-items-center g-5 ${
            isReversed ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className="col-lg-5"
            data-aos={isReversed ? "fade-left" : "fade-right"}
            data-aos-delay="100"
          >
            <div className="prof-why-img-wrap">
              <div className="prof-why-img">
                <Image
                  src={image}
                  alt={title}
                  width={600}
                  height={700}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              {isFinancer && (
                <div className="fin-why-floating-card">
                  <div className="fin-why-floating-icon">
                    <i className="fas fa-wallet" />
                  </div>
                  <div>
                    <strong>Smart Financial Planning</strong>
                    <span>Clear advice for confident decisions</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={`col-lg-7 ${isReversed ? "pe-lg-5" : "ps-lg-5"}`}
            data-aos={isReversed ? "fade-right" : "fade-left"}
            data-aos-delay="200"
          >
            <div className="prof-why-content">

              <h2 className="fin-section-title text-start">{title}</h2>

              <p className="fin-section-text text-start">{desc}</p>

              <div className="fin-feature-grid">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`prof-feature-point prof-feature-point--${
                      profession || "default"
                    }`}
                  >
                    <div className="prof-feature-icon">
                      <i className={feature.icon} />
                    </div>

                    <div className="prof-feature-text">
                      <h6>{feature.title}</h6>
                      <p>{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionWhyUs;