import { redirect } from "next/navigation";

const AgentSingleLegacyPage = async ({ params }) => {
  const resolvedParams = await params;
  const id = resolvedParams?.id || "";
  redirect(`/agent/${encodeURIComponent(String(id))}`);
};

export default AgentSingleLegacyPage;
