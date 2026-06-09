import { redirect } from "next/navigation";
import { AI_STAGING_ADMIN_PATH } from "@/lib/aiStagingAccess";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AiSuggestionsStagingAliasPage = () => {
  redirect(AI_STAGING_ADMIN_PATH);
};

export default AiSuggestionsStagingAliasPage;
