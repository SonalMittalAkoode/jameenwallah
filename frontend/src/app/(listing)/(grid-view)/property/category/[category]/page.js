import { redirect } from "next/navigation";

const PropertyCategoryPage = async ({ params }) => {
  const resolvedParams = await params;
  const category = resolvedParams?.category || "";
  redirect(`/properties/${encodeURIComponent(category)}`);
};

export default PropertyCategoryPage;
