import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: "fas fa-medal",
    title: "Legal Excellence",
    text: "Every case is handled with precision, professionalism, and deep attention to detail.",
  },
  {
    icon: "fas fa-handshake",
    title: "Transparent Guidance",
    text: "Clear communication at every step — no hidden terms, no confusing legal language.",
  },
  {
    icon: "fas fa-chart-pie",
    title: "Efficient Resolution",
    text: "Strategic legal solutions designed for faster, practical, and effective outcomes.",
  },
  {
    icon: "fas fa-users",
    title: "Client-First Support",
    text: "Every legal solution is tailored to your property goals, situation, and risk level.",
  },
];

const LawyerWhyUs = ({ section = {} }) => {
  const featureItems = Array.isArray(section.items) ? section.items : features;

  return (
    <section className="lawyer-why-section">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5" data-aos="fade-right" data-aos-delay="100">
            <div className="lawyer-why-img-wrap">
              <div className="lawyer-why-img">
                <Image
                  src="/images/lawyer/lawyer-services.jpg"
                  alt="JameenWallah legal consultation"
                  width={620}
                  height={720}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              <div className="lawyer-why-floating-card">
                <div className="lawyer-why-floating-icon">
                  <i className="fas fa-scale-balanced" />
                </div>
                <div>
                  <strong>Expert Legal Review</strong>
                  <span>For secure property decisions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7 ps-lg-5" data-aos="fade-left" data-aos-delay="200">

            <h2 className="lawyer-section-title text-start">
              {section.title || "Built on Trust. Driven by Legal Expertise."}
            </h2>

            

            <div className="lawyer-feature-grid">
              {featureItems.map((feature, index) => (
                <div key={`${feature.title}-${index}`} className="lawyer-feature-point">
                  <div className="feature-icon">
                    <i className={feature.icon} />
                  </div>

                  <div className="feature-text">
                    <h6>{feature.title}</h6>
                    <p>{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/contact" className="ud-btn lawyer-btn lawyer-btn--dark">
              Book a Consultation
              <i className="fal fa-arrow-right-long ms-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LawyerWhyUs;