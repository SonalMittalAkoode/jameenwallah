const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const DEFAULT_FINANCER_IMAGE = "/images/lawyer/lawyer-demo-1.jpg";

const DEFAULT_EXPERTISE = [
  "Home Loan Guidance",
  "Property Investment Planning",
  "Financial Structuring Support",
  "Documentation Assistance",
  "Client Consultation",
];

const DEFAULT_HIGHLIGHTS = [
  {
    degree: "Tailored Financing Support",
    institute: "Guidance aligned to your property goals and funding needs",
  },
  {
    degree: "Responsive Consultation",
    institute: "Phone and email assistance for smooth decision-making",
  },
];

const stripHtml = (value = "") =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const hashString = (value = "") =>
  Array.from(value).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    0
  );

export const resolveFinancerImageSrc = (value) => {
  if (!value || typeof value !== "string") {
    return DEFAULT_FINANCER_IMAGE;
  }

  const normalized = value.trim();

  if (!normalized) {
    return DEFAULT_FINANCER_IMAGE;
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }

  if (normalized.startsWith("/images/")) {
    return `${API_BASE_URL}${normalized}`;
  }

  if (normalized.startsWith("/")) {
    return `${API_BASE_URL}${normalized}`;
  }

  return `${API_BASE_URL}/${normalized}`;
};

const buildExpertise = (description = "") => {
  const normalized = stripHtml(description).toLowerCase();
  const keywordMap = [
    {
      test: /loan|mortgage|emi|fund/i,
      label: "Home Loan & Mortgage Guidance",
    },
    {
      test: /investment|portfolio|wealth|return/i,
      label: "Investment & Portfolio Planning",
    },
    {
      test: /tax|capital gains|deduction/i,
      label: "Tax-Efficient Structuring",
    },
    {
      test: /nri|overseas|repatriation|fema/i,
      label: "NRI Property Finance",
    },
    {
      test: /insurance|risk|cover/i,
      label: "Insurance & Risk Advisory",
    },
    {
      test: /construction|commercial|project/i,
      label: "Commercial & Construction Funding",
    },
  ];

  const matched = keywordMap
    .filter((item) => item.test.test(normalized))
    .map((item) => item.label);

  return [...new Set([...matched, ...DEFAULT_EXPERTISE])].slice(0, 5);
};

const buildDescriptionParts = (description = "", name = "Our advisor") => {
  const clean = stripHtml(description);

  if (!clean) {
    return {
      bio: "",
      bio2: "",
    };
  }

  const sentences =
    clean.match(/[^.!?]+[.!?]?/g)?.map((item) => item.trim()).filter(Boolean) ||
    [];

  if (sentences.length >= 2) {
    const midpoint = Math.ceil(sentences.length / 2);
    return {
      bio: sentences.slice(0, midpoint).join(" "),
      bio2: sentences.slice(midpoint).join(" "),
    };
  }

  const words = clean.split(/\s+/);
  if (words.length > 24) {
    const midpoint = Math.ceil(words.length / 2);
    return {
      bio: `${words.slice(0, midpoint).join(" ")}`,
      bio2: `${words.slice(midpoint).join(" ")}`,
    };
  }

  return {
    bio: clean,
    bio2: "",
  };
};

const buildHighlights = (role) => [
  {
    degree: role,
    institute: "Dedicated support for property finance consultation",
  },
  ...DEFAULT_HIGHLIGHTS,
].slice(0, 2);

const buildServiceFocus = (expertise) =>
  expertise.slice(0, 4).map((item) => item.replace(/\s*&\s*/g, " / "));

export const mapFinancerToProfile = (financer) => {
  const identifier =
    financer?.slug || financer?._id || financer?.name || "financer-profile";
  const seed = hashString(identifier);
  const expertise = buildExpertise(financer?.description);
  const role = stripHtml(financer?.metaTitle) || "Senior Financial Advisor";
  const descriptionParts = buildDescriptionParts(
    financer?.description,
    financer?.name
  );
  const yearsOfExperience = 8 + (seed % 9);

  return {
    slug: financer?.slug || financer?._id,
    name: financer?.name || "Financial Advisor",
    role,
    exp: `${yearsOfExperience} Years Experience`,
    img: resolveFinancerImageSrc(financer?.image),
    speciality: expertise[0],
    rating: 4 + (seed % 2),
    phone: financer?.phoneNumber || "+91 00000 00000",
    email: financer?.email || "contact@jameenwallah.com",
    bio: descriptionParts.bio,
    bio2: descriptionParts.bio2,
    expertise,
    education: buildHighlights(role),
    caseswon: 150 + (seed % 351),
    successrate: 94 + (seed % 5),
    courts: buildServiceFocus(expertise),
  };
};

export const getPublicFinancers = async () => {
  const response = await fetch(`${API_BASE_URL}/frontend/api/financer`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch financers: ${response.status}`);
  }

  const payload = await response.json();
  const items = Array.isArray(payload?.data) ? payload.data : [];

  return items.filter((item) => item?.status !== "inactive");
};

export const getPublicFinancerBySlug = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/frontend/api/financer/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch financer ${slug}: ${response.status}`);
  }

  const payload = await response.json();
  const financer = payload?.data;

  if (!financer || financer?.status === "inactive") {
    throw new Error("Financer not found");
  }

  return financer;
};
