// frontend/src/app/(pages)/terms-and-condition/page.js
// Shares legal-pages.css with privacy-policy page.
// Place legal-pages.css in src/styles/

import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import Link from "next/link";


export const metadata = {
  title: "Terms & Conditions | JameenWallah",
  description:
    "Read JameenWallah's terms of service governing the use of our real estate platform, property listings, professional services, and related offerings.",
};

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: (
      <>
        <p>
          By accessing or using JameenWallah's website, mobile application, or any
          related services (collectively, the "Platform"), you agree to be bound by
          these Terms and Conditions ("Terms"). Please read them carefully before
          using the Platform.
        </p>
        <div className="legal-callout">
          <p>
            <strong>If you do not agree to these Terms, you must not access or use
            the Platform.</strong> Your continued use of the Platform following any
            changes to these Terms constitutes your acceptance of those changes.
          </p>
        </div>
        <p>
          These Terms constitute a legally binding agreement between you ("User",
          "you", or "your") and JameenWallah Real Estate Services Pvt. Ltd.
          ("JameenWallah", "we", "us", or "our"), a company incorporated under the
          laws of India with its registered office at A Tower, A Block, Salwa Road,
          Sec-49, Gurgaon 122018, Haryana.
        </p>
      </>
    ),
  },
  {
    id: "platform-use",
    title: "Use of the Platform",
    content: (
      <>
        <p>
          The Platform is designed to connect property buyers, sellers, investors,
          and tenants with real estate listings, professional services, and financial
          products across Gurgaon and the NCR region. You agree to use the Platform
          only for lawful purposes and in accordance with these Terms.
        </p>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">You May Not</h4>
          <ul>
            <li>Use the Platform for any unlawful, fraudulent, or malicious purpose</li>
            <li>Post false, misleading, or inaccurate property listings or information</li>
            <li>Scrape, crawl, or extract data from the Platform without written permission</li>
            <li>Impersonate any person, company, or entity, including JameenWallah staff</li>
            <li>Upload or transmit viruses, malware, or any other malicious code</li>
            <li>Interfere with or disrupt the integrity or performance of the Platform</li>
            <li>Attempt to gain unauthorised access to any part of the Platform or its systems</li>
            <li>Use the Platform to send unsolicited commercial communications (spam)</li>
          </ul>
        </div>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">Eligibility</h4>
          <p>
            You must be at least 18 years of age and legally capable of entering into
            binding contracts under applicable Indian law to use the Platform. By
            using the Platform, you represent and warrant that you meet these requirements.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "account-registration",
    title: "Account Registration",
    content: (
      <>
        <p>
          Certain features of the Platform require you to create an account. When
          registering, you agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information during registration</li>
          <li>Maintain and promptly update your account information to keep it accurate</li>
          <li>Keep your login credentials confidential and not share them with third parties</li>
          <li>Notify us immediately of any unauthorised use of your account</li>
          <li>Accept responsibility for all activities conducted through your account</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate your account at our sole
          discretion if we reasonably believe you have violated these Terms or if your
          account has been inactive for more than 24 months.
        </p>
        <div className="legal-callout">
          <p>
            <strong>One account per user.</strong> You may not create multiple accounts
            to circumvent suspensions, access restrictions, or for any other purpose.
            Duplicate accounts will be terminated without notice.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "property-listings",
    title: "Property Listings & Accuracy",
    content: (
      <>
        <p>
          JameenWallah aggregates property listings from verified developers, agents,
          and individual owners. While we strive for accuracy, we do not guarantee the
          completeness, accuracy, or timeliness of any listing.
        </p>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">Listing Standards</h4>
          <p>
            All users who post property listings on the Platform agree that their
            listings will:
          </p>
          <ul>
            <li>Accurately describe the property, including its condition, size, and location</li>
            <li>Include only photographs of the actual property being listed</li>
            <li>State the correct asking price or rental amount without hidden charges</li>
            <li>Disclose any known encumbrances, disputes, or legal complications</li>
            <li>Comply with applicable RERA and local regulatory requirements</li>
          </ul>
        </div>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">Disclaimer on Listing Accuracy</h4>
          <p>
            JameenWallah acts as an intermediary platform and is not a party to any
            property transaction. We do not verify ownership, title, or the accuracy
            of every listing. Users are strongly advised to conduct independent due
            diligence and engage legal counsel before committing to any transaction.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "professional-services",
    title: "Professional Services",
    content: (
      <>
        <p>
          The Platform provides access to third-party professionals including architects,
          chartered accountants, lawyers, financial advisors, and property managers
          ("Professionals"). JameenWallah facilitates introductions but is not responsible
          for the quality, legality, or outcome of services provided by Professionals.
        </p>
        <ul>
          <li>Professionals are independent service providers, not employees of JameenWallah</li>
          <li>JameenWallah does not guarantee the credentials, qualifications, or reliability of any Professional</li>
          <li>Any contract for professional services is directly between you and the Professional</li>
          <li>Disputes with Professionals must be resolved directly between the parties</li>
          <li>JameenWallah may, at its discretion, assist in dispute resolution but is not obligated to do so</li>
        </ul>
        <div className="legal-callout">
          <p>
            <strong>Before engaging any Professional:</strong> Verify their credentials
            independently, obtain a written engagement letter, and confirm fees upfront.
            JameenWallah's verification of a Professional does not constitute an
            endorsement of their services.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "financial-services",
    title: "Financial Products & Loan Services",
    content: (
      <>
        <p>
          JameenWallah facilitates access to home loans, loan-against-property products,
          and investment advisory services through our platform. All financial product
          information is indicative only and subject to the lender's terms.
        </p>
        <ul>
          <li>Interest rates and loan eligibility are determined solely by the lending institution</li>
          <li>Loan approval is not guaranteed by JameenWallah or any of our partners</li>
          <li>We act as a referral platform and do not provide financial advice regulated under SEBI or RBI guidelines</li>
          <li>Processing fees, pre-payment charges, and other costs are set by lenders independently</li>
          <li>You should review the lender's Key Fact Statement (KFS) before accepting any loan offer</li>
        </ul>
        <p>
          JameenWallah may receive referral commissions from financial partners. This
          does not affect the interest rates or terms you receive. We are committed to
          recommending products in your best interest.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <>
        <p>
          All content on the Platform — including text, graphics, logos, icons,
          images, audio clips, digital downloads, data compilations, and software —
          is the property of JameenWallah or its content suppliers and is protected
          by applicable intellectual property laws.
        </p>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">What You May Not Do</h4>
          <ul>
            <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Platform without express written permission</li>
            <li>Use JameenWallah's trademarks, logos, or brand elements without prior written consent</li>
            <li>Create derivative works based on Platform content without authorisation</li>
            <li>Reverse-engineer, decompile, or disassemble any software component of the Platform</li>
          </ul>
        </div>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">User-Generated Content</h4>
          <p>
            By submitting content to the Platform (property listings, reviews, images,
            messages), you grant JameenWallah a non-exclusive, royalty-free, worldwide
            licence to use, reproduce, modify, and display such content in connection
            with operating the Platform. You retain ownership of your content and
            warrant that you have the right to grant this licence.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "payments-fees",
    title: "Payments & Fees",
    content: (
      <>
        <p>
          Certain services on the Platform may require payment of fees. All fees are
          stated in Indian Rupees (INR) and are inclusive of applicable GST unless
          stated otherwise.
        </p>
        <ul>
          <li>Subscription and listing fees are non-refundable once the service period has commenced</li>
          <li>Consultation fees are charged per session as displayed at the time of booking</li>
          <li>Failed transactions will be automatically reversed to your payment source within 7 business days</li>
          <li>JameenWallah is not liable for payment gateway failures or bank-side delays</li>
          <li>GST invoices are issued electronically and available in your account dashboard</li>
        </ul>
        <div className="legal-callout">
          <p>
            <strong>Refund Policy:</strong> Refund requests must be raised within 7 days
            of the transaction. Refunds are processed within 14 business days subject
            to our review. To raise a refund request, contact{" "}
            <a href="mailto:support@jameenwallah.com">support@jameenwallah.com</a>.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers & Limitation of Liability",
    content: (
      <>
        <p>
          The Platform and all its content are provided on an "as is" and "as
          available" basis without warranties of any kind, either express or implied,
          including but not limited to warranties of merchantability, fitness for a
          particular purpose, or non-infringement.
        </p>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">JameenWallah is Not Liable For</h4>
          <ul>
            <li>Any loss or damage arising from reliance on property listing information</li>
            <li>Losses resulting from property transactions facilitated through the Platform</li>
            <li>The professional conduct, advice, or negligence of listed Professionals</li>
            <li>Technical failures, service interruptions, or data loss on the Platform</li>
            <li>Indirect, incidental, special, or consequential damages of any nature</li>
            <li>Any actions or omissions of third-party lenders, agents, or service providers</li>
          </ul>
        </div>
        <p>
          To the maximum extent permitted by applicable law, JameenWallah's total
          liability to you for any claim arising out of or relating to these Terms
          shall not exceed the amount you paid to JameenWallah in the 12 months
          preceding the claim.
        </p>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "Indemnification",
    content: (
      <>
        <p>
          You agree to defend, indemnify, and hold harmless JameenWallah, its
          affiliates, directors, officers, employees, and agents from and against
          any claims, damages, obligations, losses, liabilities, costs, or expenses
          (including legal fees) arising from:
        </p>
        <ul>
          <li>Your use of and access to the Platform</li>
          <li>Your violation of any term of these Terms</li>
          <li>Your violation of any third-party right, including intellectual property or privacy rights</li>
          <li>Any content you submit, post, or transmit through the Platform</li>
          <li>Any property listing you post that contains inaccurate or fraudulent information</li>
        </ul>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law & Disputes",
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the laws
          of India. Any dispute, controversy, or claim arising out of or in connection
          with these Terms, including their validity, breach, or termination, shall
          be subject to the exclusive jurisdiction of the courts in Gurgaon, Haryana.
        </p>
        <div className="legal-subsection">
          <h4 className="legal-subsection__title">Dispute Resolution Process</h4>
          <ol>
            <li><strong>Informal Resolution</strong> — Contact us at legal@jameenwallah.com. We will attempt to resolve the dispute within 30 days</li>
            <li><strong>Mediation</strong> — If informal resolution fails, either party may request mediation through a mutually agreed mediator</li>
            <li><strong>Arbitration</strong> — Unresolved disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, with a sole arbitrator appointed by mutual consent</li>
            <li><strong>Litigation</strong> — Only if arbitration is not feasible shall disputes be referred to courts in Gurgaon</li>
          </ol>
        </div>
      </>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    content: (
      <>
        <p>
          We reserve the right to suspend or terminate your access to the Platform at
          any time, with or without cause, and with or without notice. Grounds for
          termination include but are not limited to:
        </p>
        <ul>
          <li>Breach of any provision of these Terms</li>
          <li>Conduct that is harmful to other users, third parties, or JameenWallah</li>
          <li>Fraudulent, misleading, or illegal activity on the Platform</li>
          <li>Non-payment of fees for paid services</li>
          <li>Requests by law enforcement or government authorities</li>
        </ul>
        <p>
          Upon termination, your right to use the Platform ceases immediately. Sections
          relating to intellectual property, disclaimers, indemnification, and governing
          law shall survive termination and remain in full force and effect.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    content: (
      <>
        <p>
          JameenWallah reserves the right to modify these Terms at any time. We will
          provide notice of material changes by:
        </p>
        <ul>
          <li>Updating the "Last Updated" date at the top of this page</li>
          <li>Sending a notification to registered users via email</li>
          <li>Displaying a prominent notice on the Platform for 30 days following the update</li>
        </ul>
        <p>
          It is your responsibility to review these Terms periodically. Your continued
          use of the Platform after changes are posted constitutes your acceptance of
          the revised Terms. If you do not agree to the revised Terms, you must
          discontinue use of the Platform.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Information",
    content: (
      <>
        <p>
          For any questions or concerns regarding these Terms and Conditions, please
          contact us:
        </p>
        <div className="legal-callout">
          <p>
            <strong>JameenWallah Real Estate Services Pvt. Ltd.</strong><br />
            Email: <a href="mailto:legal@jameenwallah.com">legal@jameenwallah.com</a><br />
            Address: A Tower, A Block, Salwa Road, Sec-49, Gurgaon 122018, Haryana<br />
            Support: <a href="mailto:support@jameenwallah.com">support@jameenwallah.com</a><br />
            <strong>Business hours:</strong> Monday – Saturday, 9:00 AM – 6:00 PM IST
          </p>
        </div>
        <p>
          We aim to respond to all legal enquiries within 10 business days. For urgent
          matters, please mark your email subject line as <strong>"URGENT — Legal"</strong>.
        </p>
      </>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="legal-page">
      <DefaultHeader />
      <MobileMenu />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <div className="legal-hero">
        <div className="legal-hero__inner">
          <span className="legal-hero__eyebrow">JameenWallah Legal</span>
          <h1 className="legal-hero__title">
            Terms &amp; <em>Conditions</em>
          </h1>
          <div className="legal-hero__meta">
            <span className="legal-hero__date">
              Last Updated: <strong>1 June 2025</strong>
            </span>
            <span className="legal-hero__badge">
              {/* Document SVG */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 1h5l2 2v8H3V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M5 5h3M5 7h3M5 9h1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              Legally Binding Agreement
            </span>
          </div>
          <div className="legal-hero__rule" />
        </div>
      </div>

      {/* ── MARQUEE STRIP ─────────────────────────────────────── */}
      <div className="legal-marquee-strip">
        <div className="legal-marquee-inner">
          {[
            "Platform Usage",
            "User Obligations",
            "Listing Standards",
            "Professional Services",
            "Financial Products",
            "Intellectual Property",
            "Dispute Resolution",
            "Governing Law",
            "Platform Usage",
            "User Obligations",
            "Listing Standards",
            "Professional Services",
            "Financial Products",
            "Intellectual Property",
            "Dispute Resolution",
            "Governing Law",
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
            <h4 className="legal-sidebar__card-title">Legal questions?</h4>
            <p className="legal-sidebar__card-text">
              Our legal team responds to enquiries within 10 business days.
            </p>
            <a href="mailto:legal@jameenwallah.com" className="legal-sidebar__card-link">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 3h8l-4 4-4-4z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                <path d="M2 3v6h8V3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
              </svg>
              Contact Legal Team
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
      <div className="legal-cta">
        <div className="legal-cta__left">
          <span className="legal-cta__eyebrow">Questions about our Terms?</span>
          <h2 className="legal-cta__title">
            We're Here <em>to Help</em>
          </h2>
          <p className="legal-cta__text">
            If any part of these Terms is unclear, our legal team is happy to
            clarify before you commit to using our platform.
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
                <span className="legal-cta__link-title">Contact Legal Team</span>
                <span className="legal-cta__link-sub">legal@jameenwallah.com</span>
              </div>
              <div className="legal-cta__link-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
            <Link href="/privacy-policy" className="legal-cta__link">
              <div className="legal-cta__link-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <rect x="3" y="8" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
              </div>
              <div>
                <span className="legal-cta__link-title">Privacy Policy</span>
                <span className="legal-cta__link-sub">How we protect your data</span>
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