import SingleProperty from "@/components/property/PropertyDetailBySlugPage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const resolveSlug = async (paramsPromise) => {
  const resolvedParams = await paramsPromise;
  const segments = Array.isArray(resolvedParams?.segments)
    ? resolvedParams.segments
    : [];

  return segments.length >= 2 ? segments[segments.length - 1] : segments[0];
};

export const generateMetadata = async ({ params }) => {
  const slug = await resolveSlug(params);

  if (!slug) {
    return {
      title: "Property Detail || JameenWallah",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/frontend/api/properties/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return {
        title: "Property Detail || JameenWallah",
      };
    }

    const result = await response.json();
    const property = result?.data;
    const metaTitle =
      property?.description?.metaTitle ||
      property?.description?.title ||
      "Property Detail";
    const metaDescription =
      property?.description?.metaDescription ||
      property?.description?.description ||
      "Explore property details on JameenWallah.";

    return {
      title: `${metaTitle} || JameenWallah`,
      description: metaDescription,
    };
  } catch (error) {
    return {
      title: "Property Detail || JameenWallah",
    };
  }
};

const PropertyDynamicPage = async ({ params }) => {
  const slug = await resolveSlug(params);

  return <SingleProperty params={{ slug }} />;
};

export default PropertyDynamicPage;
