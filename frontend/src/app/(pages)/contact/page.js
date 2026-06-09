import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";
import ContactClient from "./ContactClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  const response = await getSiteContentByPageKeyFrontend("contact");
  const content = response?.data || {};

  return {
    title: content.metaTitle || "Contact JameenWallah",
    description:
      content.metaDescription ||
      "Contact JameenWallah for property consultation, investment guidance, and real estate support in Gurgaon.",
  };
}

export default async function ContactPage() {
  const response = await getSiteContentByPageKeyFrontend("contact");

  return <ContactClient content={response?.data || {}} />;
}
