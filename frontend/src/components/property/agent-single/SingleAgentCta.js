import Image from "next/image";
import React from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const resolveImageSrc = (image) => {
  if (!image || typeof image !== "string") return "/images/team/agent-1.jpg";
  const t = image.trim();
  if (!t) return "/images/team/agent-1.jpg";
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return `${API_BASE_URL}${t}`;
  return `${API_BASE_URL}/${t}`;
};

const SingleAgentCta = ({ agent }) => {
  const agentData = {
    name: agent?.name || "Agent",
    company: agent?.metaTitle || "Property Consultant",
  };
  return (
    <>
      <div className="agent-single d-sm-flex align-items-center">
        <div className="single-img mb30-sm">
          <Image
            width={172}
            height={172}
            style={{borderRadius:'50%',objectFit:'cover'}}
            src={resolveImageSrc(agent?.image)}
            alt="agents"
          />
        </div>
        {/* End single image */}
        <div className="single-contant ml30 ml0-xs">
          <h2 className="title mb-0">{agentData.name}</h2>
          <p className="fz15">
            Company Agent at <b>{agentData.company}</b>
          </p>
        </div>
      </div>
    </>
  );
};

export default SingleAgentCta;
