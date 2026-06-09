import Image from "next/image";

const FinancerProcess = ({ steps, kicker, title, desc }) => (
  <section className="fin-process-section">
    <div className="container">
      <div className="row justify-content-center mb45 mb30-md">
        <div className="col-xl-7 col-lg-8 text-center" data-aos="fade-up">
          <h2 className="fin-section-title">{title}</h2>
          <p className="fin-section-text">{desc}</p>
        </div>
      </div>

      <div className="row g-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="col-md-4"
            data-aos="fade-up"
            data-aos-delay={index * 110}
          >
            <div className="fin-step-card">
              <div className="fin-step-card__num">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="fin-step-card__icon">
                <i className={step.icon} />
              </div>

              <h5 className="fin-step-card__title">{step.title}</h5>
              <p className="fin-step-card__text">{step.text}</p>

              {index < steps.length - 1 && (
                <div className="fin-step-card__arrow" aria-hidden="true">
                  <i className="fas fa-arrow-right" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const DefaultProcess = ({ steps, image, kicker, title, desc, profession }) => (
  <section
    className={`prof-process-section prof-process--${
      profession || "default"
    } pt80 pt60-md pb80 pb60-md`}
  >
    <div className="container">
      <div className="row g-5 align-items-stretch">
        <div
          className="col-lg-5 order-2 order-lg-1"
          data-aos="fade-right"
          data-aos-delay="100"
        >
          <div className="prof-process-img-wrap h-100">
            <Image
              src={image}
              alt={title}
              width={620}
              height={620}
              className="w-100 h-100"
              style={{ borderRadius: "16px", objectFit: "cover" }}
            />
          </div>
        </div>

        <div
          className="col-lg-7 order-1 order-lg-2"
          data-aos="fade-left"
          data-aos-delay="200"
        >
          <h2 className="title mb10">{title}</h2>
          <p className="text fz15 mb40">{desc}</p>

          {steps.map((step, index) => (
            <div
              key={index}
              className={`prof-step-row prof-step-row--${profession}`}
              data-aos="fade-up"
              data-aos-delay={index * 100 + 200}
            >
              <div className="prof-step-row__icon">
                <i className={step.icon} />
              </div>

              <div>
                <h5 className="mb5" style={{ fontWeight: 600, fontSize: 16 }}>
                  {step.title}
                </h5>
                <p className="text mb-0 fz14">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const ProfessionProcess = ({
  steps,
  image,
  kicker,
  title,
  desc,
  profession,
}) => {
  if (profession === "financer") {
    return (
      <FinancerProcess
        steps={steps}
        kicker={kicker}
        title={title}
        desc={desc}
      />
    );
  }

  return (
    <DefaultProcess
      steps={steps}
      image={image}
      kicker={kicker}
      title={title}
      desc={desc}
      profession={profession}
    />
  );
};

export default ProfessionProcess;