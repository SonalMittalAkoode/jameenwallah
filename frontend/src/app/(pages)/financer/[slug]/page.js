import { notFound } from "next/navigation";
import ProfessionDetailPage from "@/components/profession/ProfessionDetailPage";
import {
  getPublicFinancerBySlug,
  mapFinancerToProfile,
} from "@/utils/financerProfile";

export async function generateMetadata({ params }) {
  try {
    const financer = await getPublicFinancerBySlug(params.slug);
    const profile = mapFinancerToProfile(financer);

    return {
      title:
        financer?.metaTitle ||
        `${profile.name} | JameenWallah Financial Services`,
      description:
        financer?.metaDescription ||
        `${profile.role} - ${profile.speciality}. ${profile.exp}. Speak with ${profile.name} at JameenWallah.`,
    };
  } catch (error) {
    return {
      title: "Financial Advisor | JameenWallah Financial Services",
    };
  }
}

export default async function FinancerDetailPage({ params }) {
  let financer;

  try {
    financer = await getPublicFinancerBySlug(params.slug);
  } catch (error) {
    console.error("Failed to fetch financer details", error);
    notFound();
  }

  const member = mapFinancerToProfile(financer);
  member.accountType = "Financer";
  member.accountId = financer?._id ? String(financer._id) : "";

  if (!member?.slug) {
    notFound();
  }

  return (
    <ProfessionDetailPage
      member={member}
      breadcrumbLabel="Financial Services"
      breadcrumbHref="/financer"
      statLabel="Clients Served"
      sectionTitles={{
        education: "Consultation Highlights",
        courts: "Service Focus",
      }}
    />
  );
}
