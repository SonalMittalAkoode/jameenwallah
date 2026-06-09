import { notFound } from "next/navigation";
import { resolveImageSrc } from "@/utils/resolveImage";
import ProfessionDetailPage from "@/components/profession/ProfessionDetailPage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API_BASE_URL}/frontend/api/architect/${params.slug}`);
    const result = await res.json();
    const item = result.data;

    if (!item) return {};

    return {
      title: `${item.name || "Architect"} | JameenWallah Architecture & Design`,
      description: `${item.metaTitle || item.description || "Expert Design Services"}. Book a design consultation with ${item.name} at JameenWallah.`,
    };
  } catch (err) {
    return { title: "Architect | JameenWallah Architecture & Design" };
  }
}

export default async function ArchitectDetailPage({ params }) {
  let dbItem = null;

  try {
    const res = await fetch(`${API_BASE_URL}/frontend/api/architect/${params.slug}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) notFound();
    
    const result = await res.json();
    dbItem = result.data;
  } catch (error) {
    console.error("Failed to fetch architect details:", error);
    notFound();
  }

  if (!dbItem) notFound();

  // Map to the shape expected by ProfessionDetailPage
  const member = {
    slug: params.slug,
    accountType: "Architect",
    accountId: dbItem._id ? String(dbItem._id) : "",
    name: dbItem.name || "Architect",
    role: dbItem.metaTitle || "Senior Architect",
    speciality: dbItem.description ? (dbItem.description.length > 50 ? dbItem.description.substring(0, 50).replace(/(<([^>]+)>)/gi, "") + "..." : dbItem.description.replace(/(<([^>]+)>)/gi, "")) : "Architecture & Design",
    exp: "Expert",
    caseswon: "50", // Static/Fallback for projects
    successrate: "98",
    rating: 5,
    bio: dbItem.description || "Expert architectural designer.",
    bio2: "",
    expertise: ["Residential Design", "Commercial Architecture", "Interior Planning"],
    education: [{ degree: "B.Arch", institute: "Recognized Institute" }],
    courts: ["Council of Architecture", "IIA"],
    phone: dbItem.phoneNumber || "+91 00000 00000",
    email: dbItem.email || "contact@jameenwallah.com",
    img: resolveImageSrc(dbItem.image)
  };

  return (
    <ProfessionDetailPage
      member={member}
      breadcrumbLabel="Architecture & Design"
      breadcrumbHref="/architect"
      statLabel="Projects"
    />
  );
}
