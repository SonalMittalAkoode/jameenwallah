import React from "react";

const ContactMeta = () => {
  const contactInfoData = [
    {
      text: "Address",
      info: "Spaze itech Park, 5th Floor, Unit 541 A, Tower A, Sohna Road, Sec-49, Gurgaon 122018",
      link: null,
    },
    {
      text: "Email",
      info: "support@jameenwallah.com",
      link: "mailto:support@jameenwallah.com",
    },
  ];

  return (
    <div className="row mb-4 mb-lg-5">
      {contactInfoData.map((contact, index) => (
        <div className="contact-info mb5" key={index}>
          <p className="info-title mb5">{contact.text}</p>
          {!contact.link ? (
            <h6 className="info-phone" style={{ color: "#ffffff" }}>{contact.info}</h6>
          ) : contact.link.startsWith("mailto:") ? (
            <h6 className="info-mail">
              <a href={contact.link}>{contact.info}</a>
            </h6>
          ) : (
            <h6 className="info-phone">
              <a href={contact.link}>{contact.info}</a>
            </h6>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContactMeta;
