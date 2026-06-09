import {
  AI_STAGING_ADMIN_PATH,
  AI_STAGING_PRODUCTION_ORIGINS,
  AI_STAGING_STAGED_ORIGIN,
  hasAiStagingAccess,
  getAiStagingAccessSecret,
} from "@/lib/aiStagingAccess";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import AiSuggestionStaging from "@/components/property/dashboard/ai-suggestion-staging/AiSuggestionStaging";

export const metadata = {
  title: "AI Suggestion Staging || BigCat",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AiSuggestionStagingPage = async ({ searchParams }) => {
  const accessGranted = await hasAiStagingAccess();
  const secretConfigured = Boolean(getAiStagingAccessSecret());
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  if (!accessGranted) {
    return (
      <main style={{ minHeight: "100vh", background: "#f7f7f7", display: "grid", placeItems: "center", padding: 24 }}>
        <section
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#fff",
            border: "1px solid #dde3ea",
            borderRadius: 12,
            padding: 28,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h1 style={{ margin: "0 0 10px", fontSize: 24 }}>Restricted Admin Tool</h1>
          <p style={{ margin: "0 0 16px", color: "#667085", lineHeight: 1.6 }}>
            This staging workflow is intentionally hidden from the public site and available only to authenticated admins
            with staging access.
          </p>
          {secretConfigured ? (
            <form action="/api/ai-staging-access" method="POST" style={{ display: "grid", gap: 12 }}>
              <input type="hidden" name="redirectTo" value={AI_STAGING_ADMIN_PATH} />
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#344054" }}>Access key</span>
                <input
                  type="password"
                  name="accessKey"
                  placeholder="Enter staging access key"
                  style={{
                    border: "1px solid #cfd8e3",
                    borderRadius: 8,
                    padding: "12px 14px",
                    fontSize: 14,
                  }}
                />
              </label>
              {error === "invalid" ? (
                <div style={{ color: "#b42318", fontSize: 13 }}>The staging access key was invalid.</div>
              ) : null}
              {error === "disabled" ? (
                <div style={{ color: "#b42318", fontSize: 13 }}>
                  Staging access is not configured for this environment.
                </div>
              ) : null}
              <button
                type="submit"
                style={{
                  border: 0,
                  borderRadius: 8,
                  padding: "12px 16px",
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Unlock staging
              </button>
            </form>
          ) : (
            <div style={{ color: "#667085", fontSize: 14 }}>
              Staging access is available to CMS admins at{" "}
              {AI_STAGING_PRODUCTION_ORIGINS.map((origin) => `${origin}${AI_STAGING_ADMIN_PATH}`).join(", ")} and{" "}
              {AI_STAGING_STAGED_ORIGIN}
              {AI_STAGING_ADMIN_PATH}.
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <>
      <DashboardHeader />
      <MobileMenu />

      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard_wrapper pr30 pr0-xl">
          <SidebarDashboard />

          <div className="dashboard__main pl0-md">
            <div className="dashboard__content bgc-f7">
              <div className="row pb40">
                <div className="col-lg-12">
                  <DboardMobileNavigation />
                </div>
                <div className="col-lg-12">
                  <div className="dashboard_title_area">
                    <h2>AI Suggestion Staging</h2>
                    <p className="text">
                      Review monthly property description, rate, SEO and status suggestions before approving live API
                      updates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <AiSuggestionStaging />
                  </div>
                </div>
              </div>
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default AiSuggestionStagingPage;
