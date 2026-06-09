"use client";

import ClientBootstrap from "@/components/common/ClientBootstrap";
import ScrollToTop from "@/components/common/ScrollTop";
import CompareBar from "@/components/compare/CompareBar";
import { CompareProvider } from "@/context/CompareContext";
import { usePathname } from "next/navigation";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/cmsadminlogin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <ClientBootstrap />
      <CompareProvider>
        <div className="wrapper ovh">{children}</div>
        <CompareBar />
      </CompareProvider>
      <ScrollToTop />
    </>
  );
}
