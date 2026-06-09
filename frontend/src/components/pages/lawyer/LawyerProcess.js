import Image from "next/image";

const steps = [
  {
    num: "01",
    title: "Initial Consultation",
    text: "Our experienced attorneys thoroughly review the facts of your case. They then apply the relevant law to those facts to set a clear direction.",
    icon: "fas fa-comments",
  },
  {
    num: "02",
    title: "Case Evaluation",
    text: "We analyse your property documents, identifying outcomes and aligning your case to our proprietary legal strategy for the best result.",
    icon: "fas fa-search",
  },
  {
    num: "03",
    title: "Legal Strategy",
    text: "We develop a comprehensive roadmap to protect your rights and achieve the best possible outcome — efficiently and transparently.",
    icon: "fas fa-route",
  },
  {
    num: "04",
    title: "Resolution & Follow-Up",
    text: "We manage documentation, closure, and post-resolution guidance so your property matter is complete and properly recorded.",
    icon: "fas fa-file-signature",
  },
];

const LawyerProcess = () => {
  return (
    <section className="bgc-thm-light pt80 pt60-md pb80 pb60-md">
      <div className="container">
        <div className="row g-5 align-items-center">
          {/* Left: Image */}
          <div
            className="col-lg-5 order-2 order-lg-1"
            data-aos="fade-right"
            data-aos-delay="100"
          >
            <Image
              src="/images/lawyer/lawyer-team.jpg"
              alt="Legal team in consultation"
              width={620}
              height={620}
              className="w-100 h-auto bdrs12"
              style={{ borderRadius: "16px", objectFit: "cover" }}
            />
          </div>

          {/* Right: Steps */}
          <div
            className="col-lg-7 order-1 order-lg-2"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            {/* <p className="section-kicker">Work Process</p> */}
            <h2 className="title mb10">
              Navigating the Law: Your
              <br className="d-none d-md-block" /> Assurance of Peace
            </h2>
            <p className="text fz15 mb40">
              A transparent, client-first legal process designed to give you
              clarity, confidence, and control over your property matters.
            </p>

            <div>
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="d-flex align-items-start mb30"
                  data-aos="fade-up"
                  data-aos-delay={i * 100 + 200}
                >
                  {/* Step icon */}
                  <div
                    className="flex-shrink-0 me-3"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "var(--primary-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 20,
                      boxShadow: "0 6px 20px rgba(255,56,92,0.3)",
                      flexShrink: 0,
                    }}
                  >
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
      </div>
    </section>
  );
};

export default LawyerProcess;
