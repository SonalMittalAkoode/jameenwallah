"use client";

import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";
import Link from "next/link";
import React, { useEffect, useMemo, useState, Suspense } from "react";
import { notFound, useSearchParams } from "next/navigation";

const getThankYouContent = (type) => {
  const t = type || "general-enquiry";

  if (t.includes("blog")) {
    return {
      pageTitle: "Thank You | Blog Enquiry Received | JameenWallah",
      metaDescription:
        "Your blog enquiry was submitted successfully. JameenWallah will respond with helpful information soon.",
      accent: "Blog enquiry received",
      body:
        "Thank you for reaching out through our blog. We have received your message and will reply shortly with the information you need.",
    };
  }

  if (t === "property-tour-request" || t.includes("tour-request")) {
    return {
      pageTitle: "Thank You | Property Tour Request | JameenWallah",
      metaDescription:
        "Your property viewing request was submitted. JameenWallah confirms receipt and will contact you soon to finalize your tour.",
      accent: "Property tour request received",
      body:
        "Thank you for requesting a property tour with JameenWallah. We have saved your preferred date, time, and contact details. Our team will confirm availability and reach out shortly to finalize your visit and answer any questions about the listing.",
    };
  }

  if (t.includes("consultation")) {
    return {
      pageTitle: "Thank You | Consultation Request | JameenWallah",
      metaDescription:
        "Your consultation request was received. A JameenWallah advisor will contact you shortly.",
      accent: "Consultation request received",
      body:
        "Thank you for booking a consultation. We have received your details and will connect with you shortly to discuss your requirements.",
    };
  }

  if (t.includes("become-partner")) {
    return {
      pageTitle: "Thank You | Partner Application | JameenWallah",
      metaDescription:
        "Your partner application was submitted. JameenWallah will verify your profile and contact you after review.",
      accent: "Partner application received",
      body:
        "Thank you for your interest in partnering with JameenWallah. We have received your application. Our team will verify your profile and contact you shortly with the next steps.",
    };
  }

  return {
    pageTitle: "Thank You | Contact Enquiry | JameenWallah",
    metaDescription:
      "Your enquiry was submitted successfully. JameenWallah will respond to your message shortly.",
    accent: "Contact enquiry received",
    body:
      "Your enquiry has been successfully submitted. Our team will get back to you shortly.",
  };
};

const ThankYouContent = () => {
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const type = searchParams.get("type") || "general-enquiry";
  const content = useMemo(() => getThankYouContent(type), [type]);

  useEffect(() => {
    document.title = content.pageTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content.metaDescription);
  }, [content]);

  useEffect(() => {
    // Check if the form was actually submitted
    const wasSubmitted = sessionStorage.getItem("formSubmitted");

    if (wasSubmitted === "true") {
      setIsAuthorized(true);
      // Clear the flag so the page cannot be refreshed or accessed again manually
      // sessionStorage.removeItem("formSubmitted"); 
      // Note: If we remove it immediately, refresh will 404. 
      // User might want to allow refresh but not manual direct link.
      // For strict 404 on "manual typing", keeping it in session is okay for the duration of the session,
      // but the user specifically said "if anyone tries to access manually". 
      // Usually that means from a fresh tab/link.
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authorized (manual access), trigger 404
  if (!isAuthorized) {
    return notFound();
  }

  return (
    <section className="our-error">
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-xl-6 text-center" data-aos="fade-up">
            <div className="error_page_content">
              <div className="erro_code mb20">
                <span className="text-thm">
                  <i className="fas fa-check-circle" style={{ fontSize: "100px", color: "var(--color-primary, #ff385c)" }}></i>
                </span>
              </div>
              <h1 className="h2 error_title mt-4 mb-0">
                Thank You!
              </h1>
              <p className="text fz18 fw600 text-thm mb10 mt-3">
                {content.accent}
              </p>
              <p className="text fz15 mb30">
                {content.body}
              </p>
              <Link href="/" className="ud-btn btn-thm">
                Back To Home
                <i className="fal fa-arrow-right-long" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ThankYou = () => {
  return (
    <>
      <DefaultHeader />
      <MobileMenu />
      <Suspense fallback={
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }>
        <ThankYouContent />
      </Suspense>
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
};

export default ThankYou;
