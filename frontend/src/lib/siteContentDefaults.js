const LEGACY_SITE_CONTENT_MARKER_PATTERN =
  /\bAI STAGING [A-Z][A-Z0-9 _-]* \d+(?: \d+)?\b/gi;

function cleanSiteContentString(value) {
  return String(value || "")
    .replace(LEGACY_SITE_CONTENT_MARKER_PATTERN, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sanitizeSiteContent(value) {
  if (typeof value === "string") return cleanSiteContentString(value);
  if (Array.isArray(value)) return value.map(sanitizeSiteContent);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitizeSiteContent(entry)])
    );
  }
  return value;
}

function deepMergeContent(defaultValue, contentValue) {
  if (contentValue === undefined || contentValue === null) return defaultValue;
  if (Array.isArray(defaultValue) || Array.isArray(contentValue)) {
    return Array.isArray(contentValue) ? contentValue : defaultValue;
  }
  if (
    defaultValue &&
    contentValue &&
    typeof defaultValue === "object" &&
    typeof contentValue === "object"
  ) {
    const keys = new Set([...Object.keys(defaultValue), ...Object.keys(contentValue)]);
    return Object.fromEntries(
      [...keys].map((key) => [
        key,
        deepMergeContent(defaultValue[key], contentValue[key]),
      ])
    );
  }
  return contentValue;
}

export const DEFAULT_SITE_CONTENT = {
  home: {
    pageKey: "home",
    route: "/",
    title: "Home Page",
    metaTitle: "JameenWallah | Premium Property Consultants in Gurgaon & NCR",
    metaDescription:
      "Discover premium residential and commercial properties with trusted consultants across Gurgaon and NCR.",
    sections: {
      featured: {
        title: "Premium Properties with Trusted Consultants",
        description:
          "Trusted real estate partner for buying, selling & investing in premium residential and commercial properties across NCR.",
      },
      locations: {
        title: "Trending Locations in Gurgaon",
        description:
          "Discover the most searched and high-demand locations for property buyers and investors.",
      },
      
      cityShowcase: {
        title: "Properties by Sectors and Road",
        description:
          "Browse active property opportunities by key Gurgaon sectors, growth corridors, and location clusters that matter to buyers and investors.",
      },
      blog: {
        title: "From Our Blog",
        description:
          "Latest real estate insights, investment tips, and market trends across Gurgaon, Noida, and Delhi NCR.",
      },
      partners: {
        title: "Trusted by the world's best",
      },
    },
  },
  about: {
    pageKey: "about",
    route: "/about",
    title: "About Us",
    metaTitle:
      "About Us | JameenWallah — Your Trusted Real Estate Partner in Gurgaon",
    metaDescription:
      "Learn how JameenWallah helps buyers, investors, and families make informed property decisions in Gurgaon.",
    sections: {
      hero: {
        title: "About Us",
      },
      intro: {
        breadcrumbLabel: "About",
        heading: "Your Trusted Real Estate Partner in Gurgaon",
        summary:
          "We help buyers, investors, and families discover the right property through expert guidance, transparent processes, and reliable real estate solutions across Gurgaon.",
        emphasis: "Built on trust. Driven by expertise.",
        origin:
          "Our journey began with a personal experience that exposed the gaps in traditional real estate consulting and the lack of trustworthy guidance.",
        mission:
          "What started as a challenge evolved into a mission — to build a platform where individuals and families can make confident, informed, and secure property decisions.",
      },
      whatWeDo: {
        title: "What We Do",
        items: [
          {
            title: "Property Consulting",
            text: "Explore the best options tailored to your needs, whether for investment or self-use.",
          },
          {
            title: "Legal Assistance",
            text: "Navigate property disputes, title verification, and compliance with expert legal support.",
          },
          {
            title: "Financial Advisory",
            text: "Optimise your investments with tailored financial solutions, tax planning, and loan assistance.",
          },
          {
            title: "Property Management",
            text: "Hassle-free tenant management, maintenance, and care for local and absentee owners.",
          },
          {
            title: "AI-Powered Solutions",
            text: "Leverage technology to provide data-driven insights for smarter decisions.",
          },
          {
            title: "Growth Analysis",
            text: "Assess the future potential of locations and properties for long-term rewards.",
          },
        ],
      },
    },
  },
  contact: {
    pageKey: "contact",
    route: "/contact",
    title: "Contact Us",
    metaTitle: "Contact Us | JameenWallah",
    metaDescription:
      "Connect with JameenWallah for property buying, selling, investment, finance and tax advisory support.",
    sections: {
      hero: {
        title: "Contact Us",
      },
      intro: {
        title: "Get in Touch with Our Property & Financial Experts",
        description:
          "Looking for assistance with property buying, selling, investment, or tax advisory? Our experienced team is here to guide you with reliable, transparent, and result-driven solutions.",
        benefits: [
          "Expert guidance on property valuation and selection.",
          "Hassle-free financial planning and tax advisory.",
          "Transparent deals with verified builders and owners.",
        ],
      },
      form: {
        title: "Have questions? Get in touch!",
      },
      office: {
        title: "Visit Our Office",
        description:
          "Meet our experts in person for personalized consultation on property, investment, and financial planning.",
      },
    },
  },
  partner: {
    pageKey: "partner",
    route: "/become-partner",
    title: "Become A Partner",
    metaTitle: "Become A Partner | JameenWallah",
    metaDescription:
      "Partner with JameenWallah to grow your real estate, legal, finance, architecture, tax or property management business.",
    sections: {
      hero: {
        title: "Become A Partner",
        heading: "Become a Partner with Jameen Wallah",
        eyebrow: "Join hands to transform real estate together.",
        description:
          "At Jameen Wallah, collaboration drives measurable growth. As a partner, you become part of a trusted ecosystem that connects buyers, investors, and service professionals through a transparent, high-conversion platform.",
        secondaryDescription:
          "Whether you are a real estate advisor, legal expert, financial consultant, or property manager, we help you expand visibility, improve lead quality, and build long-term credibility in a competitive market.",
      },
      form: {
        title: "Become A Partner",
      },
      whoCanPartner: {
        title: "Who Can Partner With Jameen Wallah?",
        description:
          "We collaborate with domain experts across real estate, legal, finance, and property operations to deliver end-to-end value for clients.",
        items: [
          {
            title: "Real Estate Brokers & Agents",
            text: "Connect clients with the right property opportunities.",
          },
          {
            title: "Legal & Financial Experts",
            text: "Support property decisions with legal and financial guidance.",
          },
          {
            title: "Property Management Professionals",
            text: "Help owners manage and maintain properties with ease.",
          },
          {
            title: "Apply, Get Verified & Grow",
            text: "Join our network, get approved, and start collaborating with us.",
          },
        ],
      },
      benefits: {
        title: "Why Partner with Us?",
        description: "Let us help you unlock the full potential of your business.",
        items: [
          {
            title: "Expand Your Reach",
            text: "Gain access to a diverse and growing client base across India and abroad, including NRIs and high-net-worth individuals.",
            icon: "fas fa-globe",
          },
          {
            title: "Collaborate with Experts",
            text: "Join a network of seasoned professionals in real estate, legal, financial, and property management domains.",
            icon: "fas fa-handshake",
          },
          {
            title: "Drive Mutual Growth",
            text: "Work with a team that values collaboration and mutual success, ensuring growth for you and your clients.",
            icon: "fas fa-chart-line",
          },
          {
            title: "Enhance Your Credibility",
            text: "Partner with a trusted brand known for transparency, expertise, and customer satisfaction.",
            icon: "fas fa-shield-alt",
          },
        ],
      },
    },
  },
  footer: {
    pageKey: "footer",
    route: "/",
    title: "Footer",
    metaTitle: "Footer | JameenWallah",
    metaDescription: "Footer navigation and service links for JameenWallah.",
    sections: {
      services: {
        title: "Explore Other Services",
        links: [
          { label: "Legal Services", href: "/lawyer" },
          { label: "Financial Services", href: "/financer" },
          { label: "Architecture & Design", href: "/architect" },
          { label: "Chartered Accountant", href: "/chartered-accountant" },
          {
            label: "Property Management Services",
            href: "/property-management-services",
          },
        ],
      },
    },
  },
  legal: {
    pageKey: "legal",
    route: "/lawyer",
    title: "Legal Services",
    metaTitle: "Legal Services | JameenWallah — Expert Property Lawyers in Gurgaon",
    metaDescription:
      "Get trusted legal assistance for property disputes, title verification, RERA compliance, and real estate documentation from JameenWallah's expert legal team.",
    sections: {
      hero: {
        title: "Real Estate, Legally Secured",
        description:
          "Navigating real estate legal complexities can be challenging, but with Jameen Wallah, you're never alone. Our expert legal services protect your property interests, resolve disputes, and ensure seamless transactions.",
        primaryCta: "Consult a Lawyer",
        secondaryCta: "Our Services",
      },
      services: {
        title: "Legal Services We Provide",
        description:
          "Comprehensive legal solutions tailored for every stage of your real estate journey — from purchase to protection.",
        items: [
          { icon: "fas fa-balance-scale", title: "Property Dispute Resolution", text: "Resolve disputes with builders, tenants, or co-owners through expert legal support." },
          { icon: "fas fa-file-contract", title: "Title Verification & Due Diligence", text: "Ensure clear ownership with thorough title checks and legal verification." },
          { icon: "fas fa-gavel", title: "Agreement Drafting & Review", text: "Draft and review sale deeds, lease agreements, and contracts with precision." },
          { icon: "fas fa-file-signature", title: "Builder Dispute & Legal Action", text: "Handle possession delays, fraud, or false commitments confidently." },
          { icon: "fas fa-home", title: "NRI Legal & Compliance Support", text: "End-to-end legal assistance for NRIs managing property remotely." },
          { icon: "fas fa-shield-alt", title: "Legal Risk & Compliance Management", text: "Identify risks and ensure adherence to property laws and regulations." },
        ],
      },
      whyUs: {
        title: "Built on Trust. Driven by Legal Expertise.",
        description:
          "Our team of experienced legal professionals brings deep expertise in real estate law, ensuring every case is handled with clarity and precision.",
        items: [
          { icon: "fas fa-medal", title: "Committed to Legal Excellence", text: "Every case is handled with precision, professionalism, and attention to detail." },
          { icon: "fas fa-handshake", title: "Honest & Transparent Approach", text: "Clear communication at every step-no hidden terms, no surprises." },
          { icon: "fas fa-chart-pie", title: "Efficient Case Resolution", text: "Strategic legal solutions designed for faster, effective outcomes." },
          { icon: "fas fa-users", title: "Client-First Legal Support", text: "Every solution is tailored to your unique property needs." },
        ],
      },
      consultation: {
        title: "Book a Consultation",
        description: "Get expert advice tailored to your specific requirements.",
      },
    },
  },
  finance: {
    pageKey: "finance",
    route: "/financer",
    title: "Financial Services",
    metaTitle: "Financial Advisors | JameenWallah — Expert Property Finance in Gurgaon",
    metaDescription:
      "Trusted financial advisors for home loans, investment planning, tax optimization, and real estate portfolio management at JameenWallah.",
    sections: {
      hero: {
        title: "Smart Property Financing, \nSimplified",
        desc: "Get expert financial solutions for home loans, investments, and property funding-designed to help you make confident, future-ready decisions.",
        ctaPrimary: "Get Financial Advice",
      },
      services: {
        heading: "Comprehensive Financial Services for Real Estate",
        subheading: "End-to-end financial solutions to support every stage of your property journey-from funding and approvals to investment planning and risk management.",
        items: [
          { icon: "fas fa-hand-holding-usd", title: "Home Loans & Pre-Approvals", text: "Find the right home loan with expert guidance and quick pre-approvals. We simplify applications, documentation, and approvals to strengthen your buying power." },
          { icon: "fas fa-chart-line", title: "Mortgage & Loan Optimization", text: "Access flexible mortgage solutions tailored to your needs. We help refinance and restructure loans to reduce interest and improve repayment." },
          { icon: "fas fa-file-invoice-dollar", title: "Construction & Commercial Financing", text: "Secure funding for construction, renovation, or commercial investments. Structured financial solutions ensure smooth execution and business growth." },
          { icon: "fas fa-piggy-bank", title: "NRI Financing Solutions", text: "Seamless financing for NRIs investing in Indian real estate. We handle compliance, documentation, and approvals end-to-end." },
          { icon: "fas fa-shield-alt", title: "Investment Advisory & Portfolio Growth", text: "Make smarter property investments with expert financial insights. We help you maximize returns and build a strong real estate portfolio." },
          { icon: "fas fa-redo-alt", title: "Debt Management & Financial Planning", text: "Optimize liabilities and manage financial risks effectively. Strategic planning ensures better cash flow and long-term financial stability." },
        ],
      },
      whyUs: {
        title: "Why Choose Jameen Wallah for Financial Services?",
        features: [
          { icon: "fas fa-medal", title: "Wide Network of Partners", text: "Collaborations with banks, NBFCs, and financial institutions." },
          { icon: "fas fa-handshake", title: "Personalized Financial Solutions", text: "Tailored financing based on your property goals." },
          { icon: "fas fa-chart-pie", title: "AI-Driven Insights", text: "Advanced tools for smarter financial decisions." },
          { icon: "fas fa-phone-alt", title: "Transparency", text: "Clear communication and honest guidance." },
        ],
      },
      process: {
        title: "Your Financial Journey Made Simple",
        desc: "A clear, step-by-step approach to help you move from financial planning to property ownership with confidence.",
        steps: [
          { icon: "fas fa-user-check", title: "Financial Health Assessment", text: "We analyse your income, liabilities, credit score, and investment goals." },
          { icon: "fas fa-calculator", title: "Strategy & Product Selection", text: "We match you with the right loan product, tax strategy, and investment plan." },
          { icon: "fas fa-check-circle", title: "Execution & Ongoing Support", text: "We execute your plan and provide continuous monitoring and support." },
          { icon: "fas fa-chart-line", title: "Review & Portfolio Optimization", text: "We refine financing, tax and investment decisions as your property goals evolve." },
        ],
      },
    },
  },
  architecture: {
    pageKey: "architecture",
    route: "/architect",
    title: "Architecture & Design",
    metaTitle: "Architect Services Gurgaon | Property Design",
    metaDescription:
      "Connect with expert architects in Gurgaon for residential and commercial property design, planning, and space optimization.",
    sections: {
      hero: {
        title: "Visionary Architects,\nTimeless Spaces",
        desc: "Transform your property into a masterpiece with bespoke residential and commercial spaces that blend function with aesthetic clarity.",
        ctaPrimary: "Book a Design Consult",
      },
      services: {
        heading: "Architect & Design Services for Properties",
        subheading: "Comprehensive design solutions for every property type — from concept sketches to construction supervision and interior fit-out.",
        items: [
          { icon: "fas fa-drafting-compass", title: "Architectural Design", text: "Custom architectural plans tailored to your site, lifestyle, and budget — residential villas, apartments, and commercial spaces." },
          { icon: "fas fa-couch", title: "Interior Design", text: "Curated interior concepts that reflect your personality — furniture layout, colour palettes, materials, and lighting design." },
          { icon: "fas fa-cubes", title: "3D Visualisation", text: "Photorealistic 3D renders and walkthroughs so you see exactly how your space will look before a single brick is laid." },
          { icon: "fas fa-hard-hat", title: "Structural Consultation", text: "Expert structural engineering advice to ensure your design is safe, code-compliant, and built to last." },
          { icon: "fas fa-home", title: "Renovation Planning", text: "Assessment and redesign of existing spaces — optimising floor plans, natural light, and space utility." },
          { icon: "fas fa-compass", title: "Vastu Consultation", text: "Integration of Vastu Shastra principles into modern design — balancing positive energy with contemporary aesthetics." },
        ],
      },
      whyUs: {
        title: "Modern Architecture & Interior Design Excellence",
        desc: "Delivering innovative architecture, interior design, and space planning solutions for residential and commercial projects.",
        features: [
          { icon: "fas fa-award", title: "Award-Winning Architecture Firm", text: "Recognized for high-end residential and commercial architecture." },
          { icon: "fas fa-pencil-ruler", title: "Custom Design & Space Planning", text: "Tailor-made designs and functional layouts aligned with your goals." },
          { icon: "fas fa-clock", title: "On-Time Project Delivery", text: "Efficient project management for timely completion." },
          { icon: "fas fa-rupee-sign", title: "Transparent Cost & Budget Planning", text: "Clear project estimates and cost control throughout execution." },
        ],
      },
      process: {
        title: "End-to-End Architecture & Interior Design Process",
        desc: "A structured, client-focused approach from concept development to final project execution.",
        steps: [
          { icon: "fas fa-comments", title: "Discovery & Requirement Analysis", text: "Understanding your vision, site conditions, budget, and functional requirements." },
          { icon: "fas fa-pencil-ruler", title: "Concept Design & 3D Visualization", text: "Detailed floor plans, 3D renders, and material selection." },
          { icon: "fas fa-tools", title: "Execution & Site Supervision", text: "Vendor coordination, quality checks, and timeline tracking." },
          { icon: "fas fa-check-circle", title: "Final Delivery & Handover", text: "We complete quality checks, finishing review and project handover with clear documentation." },
        ],
      },
    },
  },
  "chartered-accountant": {
    pageKey: "chartered-accountant",
    route: "/chartered-accountant",
    title: "Chartered Accountant",
    metaTitle: "Chartered Accountants | JameenWallah — Property Tax & Finance Experts in Gurgaon",
    metaDescription:
      "Expert chartered accountants for property tax planning, capital gains, GST compliance, and real estate financial advisory at JameenWallah.",
    sections: {
      hero: {
        title: "Expert Accounting,\nPeace of Mind",
        desc: "Maximise returns and minimise tax on every property transaction with CAs who understand real estate.",
        ctaPrimary: "Consult a CA",
      },
      services: {
        heading: "CA Services for Real Estate",
        subheading: "Specialised accounting, taxation, and compliance services covering every financial dimension of property ownership and investment.",
        items: [
          { icon: "fas fa-file-invoice", title: "Property Tax Planning", text: "Strategic planning to maximise tax deductions on home loans, HRA, property depreciation, and rental income." },
          { icon: "fas fa-percentage", title: "GST on Property", text: "Expert handling of GST applicability on under-construction properties, JDA arrangements, and commercial leasing." },
          { icon: "fas fa-chart-bar", title: "Capital Gains Advisory", text: "Structuring property sales to minimise LTCG/STCG tax — including Section 54, 54EC, and 54F exemptions." },
          { icon: "fas fa-search-dollar", title: "Financial Auditing", text: "Annual audits, P&L statements, and balance sheets for real estate businesses, builders, and investors." },
          { icon: "fas fa-building", title: "Property Valuation Reports", text: "Certified valuation reports for sale, transfer, legal disputes, loan mortgage, and inheritance purposes." },
          { icon: "fas fa-handshake", title: "NRI Tax Compliance", text: "TDS on NRI property sales, ITR filing, DTAA benefits, and repatriation advisory for overseas Indians." },
        ],
      },
      whyUs: {
        title: "Why Choose Our Tax & Accounting Experts",
        desc: "Reliable, compliant, and growth-focused financial services tailored for individuals and businesses.",
        features: [
          { icon: "fas fa-user-graduate", title: "Certified Chartered Accountants", text: "Work with ICAI-qualified professionals." },
          { icon: "fas fa-bolt", title: "Fast & Hassle-Free Filing", text: "Timely income tax return, GST filing, and compliance support." },
          { icon: "fas fa-lock", title: "100% Data Security & Confidentiality", text: "Your financial data is protected with strict privacy-first processes." },
          { icon: "fas fa-comments-dollar", title: "Proactive Tax Planning & Alerts", text: "Stay ahead with smart tax-saving strategies and deadline reminders." },
        ],
      },
      process: {
        title: "Our Simple & Compliant Process",
        desc: "A streamlined approach to ensure accurate filings, maximum savings, and complete compliance.",
        steps: [
          { icon: "fas fa-folder-open", title: "Document Collection & Review", text: "We gather and verify all required documents." },
          { icon: "fas fa-calculator", title: "Tax Analysis & Optimization", text: "Identify deductions, exemptions, and tax-saving opportunities." },
          { icon: "fas fa-file-alt", title: "Accurate Filing & Compliance", text: "End-to-end filing and regulatory documents with full assurance." },
          { icon: "fas fa-bell", title: "Ongoing Advisory & Updates", text: "We support notices, deadline reminders and year-round compliance planning." },
        ],
      },
    },
  },
  "property-management": {
    pageKey: "property-management",
    route: "/property-management-services",
    title: "Property Management Services",
    metaTitle: "Property Management Services | JameenWallah",
    metaDescription:
      "End-to-end property management services for owners, investors and NRIs across Gurgaon and Delhi NCR.",
    sections: {
      hero: {
        title: "Effortless Property Care for Maximum Peace of Mind",
        description:
          "Owning a property is a significant investment — managing it shouldn't feel like a burden. We help owners, NRIs and investors maintain, monitor and optimise properties for long-term value.",
      },
      services: {
        title: "Our Property Management Services",
        description: "Comprehensive, end-to-end property care — from keys to compliance.",
        items: [
          {
            icon: "fas fa-key",
            title: "Key Holding & Handover Management",
            text: "Secure key custody, move-in and move-out coordination, and documented handovers for owners and tenants.",
          },
          {
            icon: "fas fa-user-check",
            title: "Tenant Screening & Onboarding",
            text: "Background checks, rental documentation, move-in support, and a smooth onboarding experience for quality tenants.",
          },
          {
            icon: "fas fa-rupee-sign",
            title: "Rent Collection & Owner Statements",
            text: "Timely rent follow-ups, payment tracking, and clear monthly statements so owners always know what is happening.",
          },
          {
            icon: "fas fa-tools",
            title: "Maintenance & Vendor Coordination",
            text: "Reliable vendor coordination for repairs, routine maintenance, emergency support, and cost-controlled upkeep.",
          },
          {
            icon: "fas fa-camera",
            title: "Periodic Inspections & Photo Reports",
            text: "Scheduled property visits with photo-backed reports, condition notes, and proactive recommendations.",
          },
          {
            icon: "fas fa-file-contract",
            title: "Legal, Utility & Compliance Support",
            text: "Lease renewals, utility coordination, society documentation, and compliance support for local and NRI owners.",
          },
        ],
      },
      whyUs: {
        kicker: "Why Jameen Wallah",
        title: "Your Property Deserves the Best Care",
        description:
          "We combine deep local expertise with AI-powered monitoring to give you complete confidence in how your property is managed.",
        items: [
          { icon: "fas fa-shield-halved", title: "Trusted Expertise", text: "Deep real estate knowledge and a proven track record across Gurgaon and Delhi NCR." },
          { icon: "fas fa-robot", title: "AI-Powered Efficiency", text: "Real-time monitoring, smart alerts, and data-driven property oversight." },
          { icon: "fas fa-chart-bar", title: "Full Transparency", text: "Regular photo reports, detailed statements, and instant notifications." },
          { icon: "fas fa-smile-beam", title: "Peace of Mind", text: "Whether you are next door or overseas, your property is in expert hands." },
        ],
      },
      process: {
        title: "Our Property Management Process",
        desc: "A simple, transparent workflow to onboard, protect, and manage your property with confidence.",
        steps: [
          {
            icon: "fas fa-clipboard-check",
            title: "Property Assessment & Onboarding",
            text: "We inspect the property, verify documents, capture condition details, and define the management scope.",
          },
          {
            icon: "fas fa-key",
            title: "Tenant, Vendor & Compliance Setup",
            text: "We coordinate tenants, vendors, keys, society rules, utilities, and compliance requirements.",
          },
          {
            icon: "fas fa-chart-line",
            title: "Ongoing Management & Reporting",
            text: "You receive regular updates, photo-backed reports, rent tracking, and proactive maintenance support.",
          },
          {
            icon: "fas fa-shield-alt",
            title: "Review, Renewal & Risk Control",
            text: "We review performance, renew agreements, and flag maintenance, tenant or compliance risks before they escalate.",
          },
        ],
      },
      cta: {
        title: "Ready to Hand Over the Hassle?",
        description: "Let us manage your property while you enjoy the returns.",
        button: "Get in Touch",
      },
    },
  },
};

export function mergeSiteContent(pageKey, content) {
  const defaults = DEFAULT_SITE_CONTENT[pageKey] || {};
  const cleanContent = sanitizeSiteContent(content || {});
  const nextMetaTitle =
    cleanContent?.metaTitle && !/homez - real estate nextjs template/i.test(cleanContent.metaTitle)
      ? cleanContent.metaTitle
      : defaults.metaTitle;
  const sections = deepMergeContent(defaults.sections || {}, cleanContent.sections || {});
  const defaultProcessSteps = defaults.sections?.process?.steps;
  const mergedProcessSteps = sections.process?.steps;
  if (
    Array.isArray(defaultProcessSteps) &&
    Array.isArray(mergedProcessSteps) &&
    mergedProcessSteps.length < defaultProcessSteps.length
  ) {
    sections.process = {
      ...sections.process,
      steps: [
        ...mergedProcessSteps,
        ...defaultProcessSteps.slice(mergedProcessSteps.length),
      ],
    };
  }
  return {
    ...defaults,
    ...cleanContent,
    metaTitle: nextMetaTitle,
    sections,
  };
}
