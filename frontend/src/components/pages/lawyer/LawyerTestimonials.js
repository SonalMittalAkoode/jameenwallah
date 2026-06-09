"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { resolveImageSrc } from "@/utils/resolveImage";
import staticLawyerTeam from "@/data/lawyerTeam";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const StarRating = ({ rating }) => (
  <div className="lc-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <i
        key={s}
        className={s <= rating ? "fas fa-star" : "far fa-star"}
      />
    ))}
  </div>
);

const LawyerTeam = () => {
  const [lawyers, setLawyers] = useState(staticLawyerTeam);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE_URL}/frontend/api/lawyer`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data && data.status === "success" && Array.isArray(data.data)) {
          if (data.data.length > 0) {
            const mappedLawyers = data.data.map((l) => ({
              slug: l.slug || l._id,
              name: l.name || "Legal Expert",
              role: l.metaTitle || "Senior Legal Expert",
              exp: "Expert Professional",
              img: resolveImageSrc(l.image),
              speciality: l.description ? (l.description.length > 30 ? l.description.substring(0, 30) + "..." : l.description) : "Legal Services & Consultation",
              rating: 5,
            }));
            setLawyers(mappedLawyers);
          }
        }
      })
      .catch((err) => console.error("Error fetching lawyers:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="pt80 pt60-md pb80 pb60-md">
      <div className="container">
        {/* Header */}
        <div className="row justify-content-center mb45 mb30-md">
          <div className="col-lg-7 text-center" data-aos="fade-up">
            <h2 className="title mb15">Meet Our Expert Real Estate Legal Team</h2>
            <p className="text fz15">
              Our experienced real estate lawyers specialize in property disputes, title verification, and legal documentation. With a client-first approach, we deliver transparent, reliable, and result-driven legal solutions to protect your property rights and ensure secure transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="lawyer-team-scroll-wrapper">
        <div className="lawyer-team-scroll-track">
          {lawyers.map((member, i) => (
            <Link
              href={`/lawyer/${member.slug}`}
              key={member.slug || i}
              className="lawyer-team-card"
              data-aos="fade-up"
              data-aos-delay={i * 80}
            >
              {/* Photo */}
              <div className="lawyer-team-card__img-wrap">
                {/* Rating Badge */}
                <span className="lawyer-team-card__rating-badge">
                  <i className="fas fa-star me-1" />
                  {member.rating || 5} Rating
                </span>
                <Image
                  src={member.img}
                  alt={member.name || "Lawyer"}
                  width={300}
                  height={340}
                  className="lawyer-team-card__img"
                />
              </div>

              {/* Info */}
              <div className="lawyer-team-card__body">
                <h5 className="lawyer-team-card__name">{member.name}</h5>
                <p className="lawyer-team-card__role">{member.role}</p>
                <span className="lawyer-team-card__tag">
                  <i className="fas fa-gavel me-1" />
                  {member.speciality}
                </span>
                <div className="d-flex align-items-center justify-content-between mt10">
                  <StarRating rating={member.rating || 5} />
                  <span className="lawyer-team-card__exp">
                    <i className="fas fa-clock me-1" />
                    {member.exp}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LawyerTeam;
