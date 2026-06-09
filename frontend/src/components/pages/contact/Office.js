import Image from "next/image";
import React from "react";

const Office = () => {
  const offices = [
    {
      id: 1,
      city: "Gurugram (Head Office)",
      icon: "/images/icon/paris.svg",
      address: "Sector 48, Sohna Road, Gurugram, Haryana – 122018",
      phoneNumber: "+91 83769 18847",
    },
    // {
    //   id: 2,
    //   city: "London",
    //   icon: "/images/icon/london.svg",
    //   address: "1301 2nd Ave, Seattle, WA 98101",
    //   phoneNumber: "(315) 905-2321",
    // },
    // {
    //   id: 3,
    //   city: "New York",
    //   icon: "/images/icon/new-york.svg",
    //   address: "1301 2nd Ave, Seattle, WA 98101",
    //   phoneNumber: "(315) 905-2321",
    // },
    // Add more office objects here...
  ];

  return (
    <>
      {offices.map((office) => (
        <div key={office.id}>
          <div className="iconbox-style8 text-start p-0 mb-4 shadow-none">
            <div className="icon mb-4">
              <Image width={80} height={80} src={office.icon} alt="icon" />
            </div>
            <div className="iconbox-content">
              <h4 className="title mb-3" style={{ fontSize: '24px', fontWeight: '700' }}>
                {office.city}
              </h4>
              <p className="text mb-2 fz15" style={{ color: '#555', lineHeight: '1.6' }}>
                {office.address}
              </p>
              <h6 className="mb-4 fz16" style={{ fontWeight: '600' }}>
                <i className="fal fa-phone-alt me-2" />
                {office.phoneNumber}
              </h6>
              <a
                className="ud-btn btn-dark bdrs12"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Google Map <i className="fal fa-arrow-right-long" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Office;
