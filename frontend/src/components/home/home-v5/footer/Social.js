import React from "react";

const socialLinks = [
  { icon: "fab fa-facebook-f", href: "https://www.facebook.com/jameenwallah", label: "Facebook" },
  { icon: "fab fa-instagram", href: "https://www.instagram.com/jameenwallah", label: "Instagram" },
  { icon: "fab fa-linkedin-in", href: "https://www.linkedin.com/company/jameenwallah", label: "LinkedIn" },
];

const Social = () => {
  return (
    <div className="social-style1 d-flex align-items-center justify-content-end">
      {/* <h6 className="text-white mb-0">Follow Us</h6> */}
      {socialLinks.map((social) => (
        <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer">
          <i className={social.icon + " list-inline-item"} />
        </a>
      ))}
    </div>
  );
};

export default Social;
