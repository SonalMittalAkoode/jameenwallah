"use client";

import { getAllAgentsFrontend } from "@/api/agent";
import { resolveImageSrc } from "@/utils/resolveImage";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const plainText = (html = "") =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const roleLine = (description) => {
  const t = plainText(description);
  if (!t) return "Property Specialist";
  return t.length > 45 ? `${t.slice(0, 45)}…` : t;
};

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAllAgentsFrontend();
        const raw = Array.isArray(res?.data) ? res.data : [];
        const active = raw.filter((a) => a?.status !== "inactive");
        if (!cancelled) setAgents(active);
      } catch {
        if (!cancelled) setAgents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-center text-muted mb-0">Loading team…</p>;
  }

  if (agents.length === 0) {
    return (
      <p className="text-center text-muted mb-0">
        Our specialists will appear here soon.
      </p>
    );
  }

  return (
    <div className="agent-slider-wrapper">
      <Swiper
        spaceBetween={20}
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: ".agent_next__active",
          prevEl: ".agent_prev__active",
        }}
        pagination={{
          el: ".agent_pagination__active",
          clickable: true,
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={agents.length > 2}
        breakpoints={{
          320: { 
            slidesPerView: 1.2, 
            spaceBetween: 12,
            centeredSlides: true,
          },
          480: { 
            slidesPerView: 2, 
            spaceBetween: 15,
            centeredSlides: false,
          },
          768: { 
            slidesPerView: 3, 
            spaceBetween: 20,
          },
          1024: { 
            slidesPerView: 4,
            spaceBetween: 25,
          },
          1200: { 
            slidesPerView: 4,
            spaceBetween: 30,
          },
        }}
        className="agent-swiper"
      >
        {agents.map((agent) => {
          const href = `/agent/${agent.slug || agent._id}`;
          const imgSrc = resolveImageSrc(agent.image, "/images/listings/g1-1.jpg");
          return (
            <SwiperSlide key={agent._id || agent.slug}>
              <div className="agent-slide-item">
                <Link href={href} className="agent-card-link">
                  <div className="team-style1 agent-card">
                    <div className="team-img agent-img-wrapper">
                      <Image
                        width={217}
                        height={248}
                        className="w-100 h-100 cover agent-image"
                        src={imgSrc}
                        alt={agent.name || "Agent"}
                        unoptimized={imgSrc.startsWith("http")}
                      />
                    </div>
                    <div className="team-content agent-content pt15 pt10-sm">
                      <h6 className="name mb-1 agent-name">{agent.name}</h6>
                      <p className="text fz14 fz12-sm mb-0 agent-role">{roleLine(agent.description)}</p>
                    </div>
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      
      {/* Navigation Arrows */}
      <div className="agent-slider-controls">
        <button className="agent_prev__active agent-nav-btn" aria-label="Previous agent">
          <i className="fal fa-arrow-left" />
        </button>
        <div className="agent_pagination__active agent-pagination" />
        <button className="agent_next__active agent-nav-btn" aria-label="Next agent">
          <i className="fal fa-arrow-right" />
        </button>
      </div>
    </div>
  );
};

export default Agents;
