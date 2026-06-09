const Social = () => {
  const socialLinks = [
    {
      id: 1,
      iconClass: "fab fa-facebook-f",
      href: "https://www.facebook.com/jameenwallah",
    },
    {
      id: 2,
      iconClass: "fab fa-twitter",
      href: "https://x.com/jameenwallah",
    },
    {
      id: 3,
      iconClass: "fab fa-instagram",
      href: "https://www.instagram.com/jameenwallah",
    },
    {
      id: 4,
      iconClass: "fab fa-linkedin-in",
      href: "https://www.linkedin.com/company/jameenwallah",
    },
  ];

  return (
    <>
      {socialLinks.map((link) => (
        <a className="me-3" href={link.href} key={link.id} target="_blank" rel="noopener noreferrer">
          <i className={link.iconClass}></i>
        </a>
      ))}
    </>
  );
};

export default Social;
