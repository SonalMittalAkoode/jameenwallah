"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import adminAxios, { setupGlobalAxiosInterceptor, removeGlobalAxiosInterceptor } from "@/utils/adminAxios";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Set up global axios interceptor for admin pages
    setupGlobalAxiosInterceptor();

    // Cleanup interceptor on unmount
    return () => {
      removeGlobalAxiosInterceptor();
    };
  }, []);

  useEffect(() => {
    // Check if user is authenticated and verify token validity
    const checkAuth = async () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("adminToken");
      const isLoginPage = pathname === "/cmsadminlogin" || pathname === "/cmsadminlogin/";

      // If user is not authenticated and trying to access any admin page (except login)
      if (!token && !isLoginPage) {
        router.replace("/cmsadminlogin");
        return;
      }

      // If no token and on login page, allow access
      if (!token && isLoginPage) {
        setIsAuthorized(true);
        return;
      }

      // If user has token, verify it's still valid by making a test API call
      if (token && !isLoginPage) {
        try {
          // Make a lightweight API call to verify token validity
          // Using dashboard counts endpoint as it's lightweight
          await adminAxios.get("/admin/api/dashboard/counts");
          
          // Token is valid, user is authorized
          setIsAuthorized(true);
        } catch (error) {
          // Token is invalid or expired - interceptor will handle redirect
          // Just clear the state here
          setIsAuthorized(false);
          return;
        }
      }

      // If user is authenticated and on login page, redirect to dashboard
      if (token && isLoginPage) {
        try {
          // Verify token before redirecting
          await adminAxios.get("/admin/api/dashboard/counts");
          router.replace("/cmsadminlogin/dashboard");
        } catch (error) {
          // Token is invalid, clear it and stay on login page
          localStorage.removeItem("adminToken");
          setIsAuthorized(true);
        }
        return;
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state while checking authentication
  // This prevents flash of content before redirect
  if (!isAuthorized) {
    const isLoginPage = pathname === "/cmsadminlogin" || pathname === "/cmsadminlogin/";
    
    // Allow login page to render immediately
    if (isLoginPage) {
      return <>{children}</>;
    }

    // Show loading for other pages while redirecting
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f7f7f7"
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

