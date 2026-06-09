import { formatPriceInLakhsCrores } from "@/utils/formatPrice";
import {
  getCleanPropertyImageCandidates,
  getRawImageValue,
  resolveImageSrc,
} from "@/utils/resolveImage";

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const getName = (value) => {
  if (!value) return "";
  return typeof value === "object" ? value.name || "" : value;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (value) => {
  const number = toNumber(value);
  return number ? number.toLocaleString("en-IN") : "";
};

const formatSqft = (value) => {
  const formatted = formatNumber(value);
  return formatted ? `${formatted} sq ft` : "";
};

const formatTextValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const formatDimension = (length, width) => {
  const safeLength = formatTextValue(length);
  const safeWidth = formatTextValue(width);
  if (!safeLength || !safeWidth) return "";
  return `${safeLength} x ${safeWidth}`;
};

const splitColumns = (items) => {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
};

const extractMapSrc = (embedCode) => {
  if (!embedCode || typeof embedCode !== "string") return "";
  const match = embedCode.match(/src="([^"]+)"/i);
  return match?.[1] || "";
};

const splitNearby = (value) =>
  String(value || "")
    .split(/[;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatFloorPlanPrice = (value) => {
  if (typeof value === "string" && /price\s*on\s*request|on\s*request|request/i.test(value)) {
    return "Price on request";
  }

  return formatPriceInLakhsCrores(
    toNumber(typeof value === "string" ? value.replace(/[^0-9.]/g, "") : value)
  );
};

const buildOverviewItems = (data) => {
  const items = [
    {
      icon: "flaticon-home-1",
      label: "Property Type",
      value: data.propertyType,
    },
    {
      icon: "flaticon-house-price",
      label: "Category",
      value: data.category,
    },
    {
      icon: "flaticon-corporation",
      label: "Builder",
      value: data.builder,
    },
    {
      icon: "flaticon-expand",
      label: data.isPlotLike ? "Plot Size" : "Size",
      value: data.displayPlotSize || data.displaySize,
    },
    {
      icon: "flaticon-map",
      label: "Facing",
      value: data.facing,
    },
    {
      icon: "flaticon-house-key",
      label: "Ownership",
      value: data.ownershipType,
    },
    {
      icon: "flaticon-garage",
      label: "Parking",
      value: data.parking,
    },
    {
      icon: "flaticon-security",
      label: "Gated Community",
      value: data.gatedCommunity,
    },
  ].filter((item) => item.value);

  return items.slice(0, 6);
};

export const normalizePropertyDetail = (property) => {
  const images = getCleanPropertyImageCandidates(property);
  const floorPlans = Array.isArray(property?.description?.floorPlans)
    ? property.description.floorPlans
    : [];
  const floorPlanImages = [
    ...(Array.isArray(property?.media?.floorPlanImages)
      ? property.media.floorPlanImages.map((image) => resolveImageSrc(getRawImageValue(image), "")).filter(Boolean)
      : []),
    ...floorPlans.map((item) => resolveImageSrc(getRawImageValue(item?.image), "")).filter(Boolean),
  ];

  const city = getName(property?.location?.city);
  const state = getName(property?.location?.state);
  const area = getName(property?.location?.area);
  const address =
    (typeof property?.location?.address === "string"
      ? property.location.address
      : "") ||
    (typeof property?.externalSource?.googleMapsPlaceAddress === "string"
      ? property.externalSource.googleMapsPlaceAddress
      : "");
  const sizeInFt =
    property?.details?.sizeInSqFt ||
    property?.details?.sizeInFt ||
    property?.details?.totalAreaInSqFt ||
    property?.sqft ||
    null;
  const isPlotLike = /plot|sco/i.test(
    [
      property?.description?.title,
      getName(property?.description?.propertyType),
      property?.details?.bhk,
    ]
      .filter(Boolean)
      .join(" ")
  );
  const priceValue =
    property?.description?.price ?? property?.minPrice ?? property?.price ?? null;
  const numericPrice = toNumber(
    typeof priceValue === "string"
      ? priceValue.replace(/[^0-9.]/g, "")
      : priceValue
  );
  const numericSizeInFt = toNumber(sizeInFt);
  const numericPlotSize = toNumber(property?.details?.plotSize) || (isPlotLike ? numericSizeInFt : null);
  const displaySize = formatSqft(numericSizeInFt);
  const displayPlotSize = formatSqft(numericPlotSize);
  const nearbyItems = splitNearby(property?.location?.nearBy);
  const mapSrc =
    extractMapSrc(property?.location?.mapEmbedCode) ||
    `https://maps.google.com/maps?q=${encodeURIComponent(
      [address, area, city, state].filter(Boolean).join(", ") || "India"
    )}&t=m&z=14&output=embed&iwloc=near`;

  const detailItems = [
    ["Price", formatPriceInLakhsCrores(numericPrice) || "Price on request"],
    ["Size", displaySize],
    ["Property Status", property?.details?.propertyStatus || "For Sale"],
    ["Possession", property?.details?.possessionDate],
    ["Property Type", getName(property?.description?.propertyType)],
    ["Category", getName(property?.description?.category)],
    ["Builder", getName(property?.description?.builder?.title || property?.description?.builder)],
    ["Payment Plan", property?.description?.paymentPlan],
    ["Ownership Type", property?.details?.ownershipType],
    ["Parking", property?.details?.parking],
    ["Facing", property?.details?.facing],
    ["Plot Size", displayPlotSize && displayPlotSize !== displaySize ? displayPlotSize : ""],
    [
      "Plot Dimensions",
      formatDimension(
        property?.details?.plotDimensionLength,
        property?.details?.plotDimensionWidth
      ),
    ],
    ["Boundary Wall", property?.details?.boundaryWall],
    ["Gated Community", property?.details?.gatedCommunity],
    ["Construction", property?.details?.construction],
  ]
    .map(([label, value]) => ({
      label,
      value: formatTextValue(value),
    }))
    .filter((item) => item.value);

  const addressItems = [
    ["Address", address],
    ["City", city],
    ["State/County", state],
    ["Zip Code", property?.location?.zip],
    ["Area", area],
    ["Country", "India"],
  ]
    .map(([label, value]) => ({
      label,
      value: formatTextValue(value),
    }))
    .filter((item) => item.value);

  const data = {
    id: property?._id || property?.id || "",
    title: property?.description?.title || property?.title || "Property",
    description: property?.description?.description || "",
    price: formatPriceInLakhsCrores(numericPrice) || "Price on request",
    pricePerSqft:
      numericPrice && toNumber(sizeInFt)
        ? `Rs ${Math.round(numericPrice / Number(sizeInFt)).toLocaleString("en-IN")}/sq ft`
        : null,
    listingType:
      property?.details?.listingType ||
      (property?.forRent ? "For Rent" : "For Sale"),
    yearBuilt: property?.details?.yearBuilt || property?.yearBuilding || null,
    bedrooms: property?.details?.bedrooms || property?.bed || null,
    bathrooms: property?.details?.bathrooms || property?.bath || null,
    parking:
      property?.details?.numberOfParkings ||
      property?.details?.parking ||
      null,
    sizeInFt,
    plotSize: displayPlotSize,
    displaySize,
    displayPlotSize,
    isPlotLike,
    propertyType:
      getName(property?.description?.propertyType) ||
      property?.propertyType ||
      null,
    propertyStatus:
      property?.details?.propertyStatus || property?.status || null,
    category: getName(property?.description?.category),
    builder: getName(property?.description?.builder?.title || property?.description?.builder),
    builderDetails: property?.description?.builder && typeof property.description.builder === 'object' ? {
      title: property.description.builder.title,
      slug: property.description.builder.slug,
      description: property.description.builder.description,
      image: property.description.builder.image,
      experience: property.description.builder.experience,
      projectsCompleted: property.description.builder.projectsCompleted,
      ongoingProjects: property.description.builder.ongoingProjects,
    } : null,
    ownershipType: formatTextValue(property?.details?.ownershipType),
    facing: formatTextValue(property?.details?.facing),
    boundaryWall: formatTextValue(property?.details?.boundaryWall),
    gatedCommunity: formatTextValue(property?.details?.gatedCommunity),
    construction: formatTextValue(property?.details?.construction),
    customId:
      property?.details?.customId ||
      property?.externalSource?.bigCatPropertyId ||
      property?.externalSource?.previousSaleOnlyCustomId ||
      property?.externalSource?.previousCustomId ||
      property?._id ||
      property?.id ||
      null,
    address,
    location: [address, area, city, state].filter(Boolean).join(", "),
    city,
    state,
    zip: property?.location?.zip || "",
    area,
    amenities: Array.isArray(property?.amenities)
      ? property.amenities
          .map((item) => (typeof item === "object" ? item?.title : item))
          .filter(Boolean)
      : Array.isArray(property?.features)
        ? property.features
        : [],
    images: images.length ? images : ["/images/listings/g1-1.jpg"],
    floorPlanImages,
    floorPlans: floorPlans.map((item, index) => ({
      id: item?._id || item?.title || `floor-plan-${index + 1}`,
      title: item?.title || item?.name || item?.unitType || `Floor Plan ${index + 1}`,
      size: formatTextValue(
        item?.superBuiltUpArea || item?.carpetArea || item?.builtUpArea || item?.size || item?.area
      ),
      bedrooms: formatTextValue(item?.bedrooms),
      bathrooms: formatTextValue(item?.bathrooms),
      price: formatFloorPlanPrice(item?.price),
      image:
        resolveImageSrc(getRawImageValue(item?.image), "") ||
        floorPlanImages[index] ||
        floorPlanImages[0] ||
        "",
    })),
    mapQuery: [address, area, city, state].filter(Boolean).join(", "),
    mapSrc,
    nearbyItems,
    videoLink: property?.media?.videoLink || "",
    virtualTour: property?.media?.virtualTour
      ? resolveImageSrc(property.media.virtualTour)
      : "",
    sitePlanImage: property?.media?.sitePlanImage
      ? resolveImageSrc(property.media.sitePlanImage)
      : "",
    masterPlanImage: property?.media?.masterPlanImage
      ? resolveImageSrc(property.media.masterPlanImage)
      : "",
    createdAt: property?.createdAt || "",
    updatedAt: property?.updatedAt || "",
    publishedOn: formatDate(property?.createdAt),
    detailItems,
    detailColumns: splitColumns(detailItems),
    addressColumns: splitColumns(addressItems),
  };

  data.overviewItems = buildOverviewItems(data);

  return data;
};
