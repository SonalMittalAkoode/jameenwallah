// frontend/src/app/(pages)/privacy-policy/page.js
// Architect palette + pattern. Shared CSS: src/styles/legal-pages.css

import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import Link from "next/link";

// Place legal-pages.css in src/styles/
// import "@/styles/legal-pages.css";

export const metadata = {
  title: "Privacy Policy | JameenWallah",
  description:
    "Learn how JameenWallah collects, uses, and protects your personal information when you use our real estate platform.",
};

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <>
        <p>
          JameenWallah collects information you provide directly to us, as well as
          information generated through your use of our platform. This helps us
          deliver personalised real estate services across Gurgaon and NCR.
        </p>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">Information You Provide</h4>
          <ul>
            <li>Name, email address, phone number, and contact details when you register or enquire</li>
            <li>Property preferences, search history, and saved listings</li>
            <li>Financial details submitted for loan or legal consultation requests</li>
            <li>Identity documents uploaded for KYC or professional verification</li>
            <li>Communications and messages sent through our platform</li>
          </ul>
        </div>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">Information Collected Automatically</h4>
          <ul>
            <li>Device identifiers, IP address, browser type, and operating system</li>
            <li>Pages visited, time spent, links clicked, and search queries</li>
            <li>Location data (with your permission) to show nearby properties</li>
            <li>Cookies, pixel tags, and similar tracking technologies</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    content: (
      <>
        <p>
          We use the information we collect to operate, improve, and personalise
          JameenWallah's services. We never sell your personal data to third parties.
        </p>
        <ul>
          <li>Provide, maintain, and improve our real estate platform and related services</li>
          <li>Match you with relevant properties, professionals, and financial products</li>
          <li>Process enquiries, consultations, and transaction-related communications</li>
          <li>Send you property alerts, market updates, and service notifications</li>
          <li>Detect, investigate, and prevent fraudulent transactions and misuse</li>
          <li>Comply with applicable laws, regulations, and legal obligations</li>
          <li>Conduct analytics and research to improve user experience</li>
        </ul>
        <div className="legal-callout">
          <p>
            <strong>Marketing communications:</strong> We will only send you promotional
            emails or SMS messages with your explicit consent. You may opt out at any
            time by clicking "Unsubscribe" or contacting us directly.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "sharing-information",
    title: "Sharing of Information",
    content: (
      <>
        <p>
          We share your information only as described in this policy or with your
          explicit consent. We may share data with:
        </p>
        <ul>
          <li>
            <strong>Service Professionals</strong> — architects, lawyers, chartered
            accountants, and financial advisors you choose to connect with through
            our platform
          </li>
          <li>
            <strong>Lending and Financial Partners</strong> — banks and NBFCs when you
            submit a loan enquiry, subject to their own privacy policies
          </li>
          <li>
            <strong>Technology Providers</strong> — cloud hosting, analytics, payment
            processing, and communication tools under strict data processing agreements
          </li>
          <li>
            <strong>Legal and Regulatory Authorities</strong> — when required by law,
            court order, or to protect the rights and safety of our users
          </li>
        </ul>
        <div className="legal-callout">
          <p>
            <strong>Note:</strong> Any professional listed on JameenWallah who receives
            your contact details must agree to our Partner Data Policy and may not use
            your information for purposes beyond the scope of your enquiry.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: (
      <>
        <p>
          We retain your personal information for as long as your account is active or
          as needed to provide services. We will retain and use your information to the
          extent necessary to:
        </p>
        <ul>
          <li>Comply with our legal obligations (e.g. tax, RERA, and financial record-keeping)</li>
          <li>Resolve disputes and enforce our agreements</li>
          <li>Improve platform safety and prevent fraud</li>
        </ul>
        <p>
          When you delete your account, we will delete or anonymise your personal data
          within 30 days, unless a longer retention period is required by law. Certain
          transaction records may be retained for up to 7 years for statutory compliance.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & Tracking Technologies",
    content: (
      <>
        <p>
          We use cookies and similar technologies to operate our platform, remember
          your preferences, and understand how you interact with our services.
        </p>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">Types of Cookies We Use</h4>
          <ul>
            <li><strong>Essential Cookies</strong> — required for the platform to function (authentication, security)</li>
            <li><strong>Preference Cookies</strong> — remember your settings and personalisation choices</li>
            <li><strong>Analytics Cookies</strong> — help us understand usage patterns to improve our service</li>
            <li><strong>Marketing Cookies</strong> — used to show relevant property listings and advertisements</li>
          </ul>
        </div>
        <p>
          You can control cookie settings through your browser preferences. Disabling
          certain cookies may affect platform functionality. We do not use cookies to
          track you across third-party sites without your consent.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights & Choices",
    content: (
      <>
        <p>
          Under applicable Indian data protection law and, where relevant, GDPR, you
          have the following rights regarding your personal information:
        </p>
        <ol>
          <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
          <li><strong>Correction</strong> — ask us to correct inaccurate or incomplete data</li>
          <li><strong>Deletion</strong> — request deletion of your data, subject to legal retention requirements</li>
          <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
          <li><strong>Objection</strong> — object to processing of your data for marketing purposes</li>
          <li><strong>Withdrawal of Consent</strong> — withdraw consent at any time where processing is based on consent</li>
        </ol>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:privacy@jameenwallah.com">privacy@jameenwallah.com</a>. We
          will respond within 30 days.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    content: (
      <>
        <p>
          We implement industry-standard technical and organisational measures to
          protect your personal information against unauthorised access, alteration,
          disclosure, or destruction. These include:
        </p>
        <ul>
          <li>SSL/TLS encryption for all data transmitted to and from our platform</li>
          <li>AES-256 encryption for sensitive data stored at rest</li>
          <li>Role-based access controls limiting employee access to personal data</li>
          <li>Regular security audits, penetration testing, and vulnerability assessments</li>
          <li>Incident response procedures with mandatory breach notification</li>
        </ul>
        <div className="legal-callout">
          <p>
            <strong>No method of transmission over the internet is 100% secure.</strong>{" "}
            While we strive to protect your data, we cannot guarantee absolute security.
            If you believe your account has been compromised, contact us immediately.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's Privacy",
    content: (
      <>
        <p>
          JameenWallah's services are not directed to individuals under the age of 18.
          We do not knowingly collect personal information from children. If you believe
          we have inadvertently collected data from a minor, please contact us
          immediately at{" "}
          <a href="mailto:privacy@jameenwallah.com">privacy@jameenwallah.com</a> and
          we will take prompt steps to delete such information.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our
          practices, technology, legal requirements, or other factors. When we make
          material changes, we will:
        </p>
        <ul>
          <li>Update the "Last Updated" date at the top of this page</li>
          <li>Send a notification to registered users via email or in-app alert</li>
          <li>Display a prominent banner on the platform for 30 days after the update</li>
        </ul>
        <p>
          Continued use of JameenWallah after such changes constitutes your acceptance
          of the revised policy. We encourage you to review this policy periodically.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact & Grievance Officer",
    content: (
      <>
        <p>
          For any questions, concerns, or requests regarding this Privacy Policy or the
          processing of your personal data, please contact our Data Protection Officer:
        </p>
        <div className="legal-callout">
          <p>
            <strong>JameenWallah Privacy Team</strong><br />
            Email: <a href="mailto:privacy@jameenwallah.com">privacy@jameenwallah.com</a><br />
            Address: A Tower, A Block, Salwa Road, Sec-49, Gurgaon 122018<br />
            Phone: Available through the Contact Us page<br />
            <strong>Response time:</strong> Within 30 working days
          </p>
        </div>
        <p>
          If you are not satisfied with our response, you have the right to lodge a
          complaint with the relevant data protection supervisory authority in your
          jurisdiction.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <DefaultHeader />
      <MobileMenu />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <div className="legal-hero">
        <div className="legal-hero__inner">
          <span className="legal-hero__eyebrow">JameenWallah Legal</span>
          <h1 className="legal-hero__title">
            Privacy <em>Policy</em>
          </h1>
          <div className="legal-hero__meta">
            <span className="legal-hero__date">
              Last Updated: <strong>1 June 2025</strong>
            </span>
            <span className="legal-hero__badge">
              {/* Lock SVG */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              GDPR &amp; IT Act Compliant
            </span>
          </div>
          <div className="legal-hero__rule" />
        </div>
      </div>

      {/* ── MARQUEE STRIP ─────────────────────────────────────── */}
      <div className="legal-marquee-strip">
        <div className="legal-marquee-inner">
          {[
            "Data Protection",
            "User Privacy",
            "Secure Platform",
            "GDPR Compliant",
            "IT Act 2000",
            "Transparent Practices",
            "Your Rights Matter",
            "Zero Data Selling",
            "Data Protection",
            "User Privacy",
            "Secure Platform",
            "GDPR Compliant",
            "IT Act 2000",
            "Transparent Practices",
            "Your Rights Matter",
            "Zero Data Selling",
          ].map((txt, i) => (
            <span className="legal-marquee-item" key={i}>{txt}</span>
          ))}
        </div>
      </div>

      {/* ── BODY — sidebar TOC + prose ────────────────────────── */}
      <div className="legal-body">

        {/* Sidebar */}
        <aside className="legal-sidebar">
          <span className="legal-sidebar__label">Contents</span>
          <ol className="legal-toc">
            {sections.map((s, i) => (
              <li className="legal-toc__item" key={s.id}>
                <a href={`#${s.id}`}>
                  <span className="legal-toc__num">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>

          {/* Contact card */}
          <div className="legal-sidebar__card">
            <h4 className="legal-sidebar__card-title">Questions about your data?</h4>
            <p className="legal-sidebar__card-text">
              Our privacy team responds within 30 working days to all data-related requests.
            </p>
            <a href="mailto:privacy@jameenwallah.com" className="legal-sidebar__card-link">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 3h8l-4 4-4-4z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                <path d="M2 3v6h8V3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
              </svg>
              Contact Privacy Team
            </a>
          </div>
        </aside>

        {/* Prose content */}
        <main className="legal-content">
          {sections.map((s, i) => (
            <div className="legal-section-block legal-fade-up" id={s.id} key={s.id}>
              <div className="legal-section-block__header">
                <span className="legal-section-block__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="legal-section-block__title">{s.title}</h2>
              </div>
              <div className="legal-prose">{s.content}</div>
            </div>
          ))}
        </main>
      </div>

      {/* ── BOTTOM CTA — amber left / dark right ──────────────── */}
      <div    className="legal-cta">
        <div className="legal-cta__left">
          <span className="legal-cta__eyebrow">Your Privacy Matters</span>
          <h2 className="legal-cta__title">
            Questions or <em>Concerns?</em>
          </h2>
          <p className="legal-cta__text">
            Our team is here to help with any privacy-related questions. Reach out
            directly or explore our other legal pages.
          </p>
        </div>
        <div className="legal-cta__right">
          <div className="legal-cta__links">
            <Link href="/contact" className="legal-cta__link">
              <div className="legal-cta__link-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 4h14l-7 7-7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M2 4v10h14V4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <span className="legal-cta__link-title">Contact Our Team</span>
                <span className="legal-cta__link-sub">We respond within 30 working days</span>
              </div>
              <div className="legal-cta__link-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
            <Link href="/terms-and-condition" className="legal-cta__link">
              <div className="legal-cta__link-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4 2h10l2 2v12H4V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M7 7h4M7 10h4M7 13h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="legal-cta__link-title">Terms &amp; Conditions</span>
                <span className="legal-cta__link-sub">Read our full terms of service</span>
              </div>
              <div className="legal-cta__link-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </div>
  );
}