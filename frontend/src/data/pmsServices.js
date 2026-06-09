export const pmsServices = [
  {
    slug: "home-fit-outs",
    icon: "fas fa-couch",
    title: "Home Fit-Outs",
    short:
      "Transform your property into a beautifully fitted, ready-to-live space, from space planning and material selection to lighting, storage, and handover readiness.",
    points: [
      "Space planning for functional, flow-friendly layouts",
      "Aesthetic style, colour schemes, and material selection",
      "Smart home systems and technology integration",
      "Professional contractor and designer coordination",
      "Sustainable, eco-friendly options prioritised",
    ],
    fitFor: [
      "Newly handed-over apartments",
      "NRI owners preparing a home remotely",
      "Rental units being upgraded for premium tenants",
      "Families planning a move-in-ready finish",
    ],
    process: [
      {
        title: "Site Review & Brief",
        text: "We assess the unit, understand your use-case, and define a practical fit-out scope before execution begins.",
      },
      {
        title: "Design & Coordination",
        text: "Layouts, materials, vendors, and timelines are aligned into one clear execution plan with regular updates.",
      },
      {
        title: "Execution & Handover",
        text: "We supervise finishing, quality checks, and final readiness so the space is delivered clean and usable.",
      },
    ],
  },
  {
    slug: "regular-home-health-checks",
    icon: "fas fa-heartbeat",
    title: "Regular Home Health Checks",
    short:
      "Scheduled inspections that keep your property in peak condition, catching issues early and helping you avoid larger repair costs later.",
    points: [
      "Monthly safety device and plumbing leak checks",
      "Quarterly gutter, pest, and garage door inspections",
      "Bi-annual roof, HVAC, and water-heater servicing",
      "Annual electrical, chimney, and plumbing audit",
      "Detailed written reports after every inspection",
    ],
    fitFor: [
      "Vacant homes between occupancies",
      "Investor-owned properties needing periodic care",
      "Holiday homes and second residences",
      "Owners wanting preventive maintenance oversight",
    ],
    process: [
      {
        title: "Maintenance Schedule Setup",
        text: "We create a visit plan based on occupancy, age of property, and operational risk points.",
      },
      {
        title: "Inspection & Reporting",
        text: "Each visit is documented with practical observations, urgent flags, and recommended next steps.",
      },
      {
        title: "Follow-up Action",
        text: "Where needed, we coordinate repairs, vendor calls, and issue closure without owner stress.",
      },
    ],
  },
  {
    slug: "property-monitoring",
    icon: "fas fa-eye",
    title: "Property Monitoring",
    short:
      "Real-time oversight of your property whether you are in the city or overseas, with regular checks, updates, and immediate escalation when something needs attention.",
    points: [
      "Regular photo and video progress reports",
      "On-site visits by a dedicated property manager",
      "AI-powered alert systems for unusual activity",
      "Immediate escalation for emergency situations",
      "NRI-friendly remote access to property status",
    ],
    fitFor: [
      "NRI-owned homes",
      "Vacant premium apartments",
      "Properties under fit-out or renovation",
      "Owners wanting remote peace of mind",
    ],
    process: [
      {
        title: "Monitoring Plan",
        text: "We decide visit frequency, reporting style, and emergency triggers based on how the property is being used.",
      },
      {
        title: "Routine Oversight",
        text: "The property is checked for condition, occupancy risk, utility issues, and any visual changes that need review.",
      },
      {
        title: "Alert & Action",
        text: "When an issue appears, we escalate quickly, coordinate on-ground support, and keep you updated until closure.",
      },
    ],
  },
  {
    slug: "taking-possession-from-builder",
    icon: "fas fa-key",
    title: "Taking Possession from Builder",
    short:
      "We inspect every corner before sign-off so the builder handover is documented properly and any visible defects are identified before possession.",
    points: [
      "Complete snagging and defect inspection",
      "Structural, electrical, and plumbing verification",
      "OC and completion certificate verification",
      "Builder defect documentation and follow-up",
      "Handover checklist and sign-off assistance",
    ],
    fitFor: [
      "First-time homebuyers",
      "Buyers unable to attend possession personally",
      "NRI investors taking remote handover",
      "Units with finishing or defect concerns",
    ],
    process: [
      {
        title: "Pre-Possession Review",
        text: "We review unit readiness, common-area status, and required documents before the final handover meeting.",
      },
      {
        title: "Snagging & Documentation",
        text: "Visible defects and finishing gaps are logged clearly for builder correction and follow-up.",
      },
      {
        title: "Possession Support",
        text: "We help ensure sign-off happens with clarity, documentation, and practical closure on pending issues.",
      },
    ],
  },
  {
    slug: "dealing-with-the-developer",
    icon: "fas fa-handshake",
    title: "Dealing with the Developer",
    short:
      "We act as your representative in follow-ups, escalations, and practical coordination with the developer so your concerns are handled with persistence and clarity.",
    points: [
      "Escalation of maintenance and defect complaints",
      "Negotiation for timely possession and compensation",
      "Legal compliance monitoring on builder promises",
      "RERA complaint filing and follow-up",
      "Coordination of warranty claims",
    ],
    fitFor: [
      "Delayed possession matters",
      "Defect rectification disputes",
      "Post-handover service concerns",
      "Owners needing structured developer follow-up",
    ],
    process: [
      {
        title: "Issue Mapping",
        text: "We organise the concern into a clear action trail with documents, timelines, and responsible parties.",
      },
      {
        title: "Developer Coordination",
        text: "We handle calls, emails, site discussions, and escalation paths to move the matter forward.",
      },
      {
        title: "Closure Tracking",
        text: "Open commitments are monitored until they are resolved, acknowledged, or escalated appropriately.",
      },
    ],
  },
  {
    slug: "dealing-with-paperwork",
    icon: "fas fa-file-contract",
    title: "Dealing with Paperwork",
    short:
      "From sale deeds to society paperwork, we keep your property documents organised, accessible, and easier to manage through every stage of ownership.",
    points: [
      "Property document verification and safe storage",
      "Society maintenance and electricity bill management",
      "Tax returns and stamp-duty documentation",
      "Tenancy agreement drafting and renewal",
      "NOC and other statutory document procurement",
    ],
    fitFor: [
      "Busy owners managing multiple properties",
      "NRI owners needing remote paperwork support",
      "Rental properties with recurring documentation",
      "Families wanting clean property records",
    ],
    process: [
      {
        title: "Document Audit",
        text: "We identify what exists, what is missing, and what should be organised for smoother ownership management.",
      },
      {
        title: "Arrangement & Follow-up",
        text: "Bills, approvals, agreements, and supporting records are tracked and maintained in a usable structure.",
      },
      {
        title: "Renewal & Support",
        text: "We stay on top of recurring paperwork so nothing important gets missed at the wrong time.",
      },
    ],
  },
];

export const getPmsServiceBySlug = (slug) =>
  pmsServices.find((service) => service.slug === slug);
