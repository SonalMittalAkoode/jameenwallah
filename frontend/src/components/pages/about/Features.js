const Features = () => {
  // Define an array of feature objects
  const features = [
    {
      icon: "flaticon-security",
      title: "Expert Property Guidance",
      description:
        "Navigate the Gurgaon real estate market with trustworthy insights and personalised recommendations from our specialists.",
    },
    {
      icon: "flaticon-keywording",
      title: "Verified Listings",
      description:
        "Explore thoroughly verified residential and commercial properties from trusted developers and sellers across Gurgaon.",
    },
    {
      icon: "flaticon-investment",
      title: "Investment Advisory",
      description:
        "Identify high-potential developments aligned with your investment goals and long-term financial planning needs.",
    },
  ];

  return (
    <>
      {features.map((feature, index) => (
        <div className="list-one d-flex align-items-start mb30" key={index}>
          <span className={`list-icon flex-shrink-0 ${feature.icon}`} />
          <div className="list-content flex-grow-1 ml20">
            <h6 className="mb-1">{feature.title}</h6>
            <p className="text mb-0 fz15">{feature.description}</p>
          </div>
        </div>
      ))}
    </>
  );
};

export default Features;
