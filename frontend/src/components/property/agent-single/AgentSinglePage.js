import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";
import FormContact from "@/components/property/FormContact";

import ProfessionalInfo from "@/components/property/ProfessionalInfo";
import ListingItemsContainer from "@/components/property/agency-single/ListingItems";

import SingleAgentCta from "@/components/property/agent-single/SingleAgentCta";
import Image from "next/image";

import React from "react";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Agent Single || JameenWallah",
};

const AgentSingle = async props => {
  const params = await props.params;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const idOrSlug = params?.id;

  const apiKey =
    process.env.NEXT_PUBLIC_END_API_KEY || process.env.NEXT_PUBLIC_API_KEY || "";

  const response = await fetch(
    `${API_BASE_URL}/frontend/api/agent/${encodeURIComponent(String(idOrSlug || ""))}`,
    {
      cache: "no-store",
      headers: apiKey ? { "x-api-key": apiKey } : undefined,
    }
  );
  if (!response.ok) notFound();
  const result = await response.json();
  const agent = result?.data || null;
  if (!agent) notFound();

  const descriptionHtml = agent?.description?.trim()
    ? agent.description
    : "<p>Agent profile description will be updated soon.</p>";

  return (
    <>
      {/* Main Header Nav */}
      <DefaultHeader />
      {/* End Main Header Nav */}

      {/* Mobile Nav  */}
      <MobileMenu />
      {/* End Mobile Nav  */}

      {/* Agent Single Section Area */}
      <section className="agent-single pt60">
        <div className="cta-agent bgc-thm-light mx-auto maxw1600 pt60 pb60 bdrs12 position-relative mx20-lg">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-xl-7">
                <SingleAgentCta agent={agent} />
                <div className="img-box-11 position-relative d-none d-xl-block">
                  <Image
                    width={120}
                    height={120}
                    className="img-1 spin-right"
                    src="/images/about/element-3.png"
                    alt="agents"
                  />
                  <Image
                    width={41}
                    height={11}
                    className="img-2 bounce-x"
                    src="/images/about/element-5.png"
                    alt="agents"
                  />
                  <Image
                    width={57}
                    height={49}
                    className="img-3 bounce-y"
                    src="/images/about/element-7.png"
                    alt="agents"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End cta-agent */}

        <div className="container">
          <div className="row wow fadeInUp" data-aos-delay="300">
            <div className="col-lg-8 pr40 pr20-lg">
              <div className="row">
                <div className="col-lg-12">
                  <div className="agent-single-details mt30 pb30 bdrb1">
                    <h6 className="fz17 mb10">{agent?.name || "Agent"}</h6>
                    <p className="text mb30">{agent?.metaTitle || "Property Consultant"}</p>
                    <div
                      className="text"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  </div>
                </div>
              </div>
              {/* End .row */}

              <ListingItemsContainer agentId={String(agent?._id || "")} />
            </div>
            {/* End .col-lg-8 */}

            <div className="col-lg-4">
              <div className="agent-single-form home8-contact-form default-box-shadow1 bdrs12 bdr1 p30 mb30-md bgc-white position-relative">
                <h4 className="form-title mb25">Contact Form</h4>
                <FormContact />
              </div>
              <div className="agen-personal-info position-relative bgc-white default-box-shadow1 bdrs12 p30 mt30">
                <ProfessionalInfo />
              </div>
            </div>
            {/* End .col-lg-4 */}
          </div>
        </div>
      </section>
      {/* End Agent Single Section Area */}

      {/* Start Our Footer */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
      {/* End Our Footer */}
    </>
  );
};

export default AgentSingle;
