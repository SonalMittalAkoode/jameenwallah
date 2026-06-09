"use client";
import Image from "next/image";
import Link from "next/link";

const StarRating = ({ rating }) => (
  <div className="lc-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <i key={s} className={s <= rating ? "fas fa-star" : "far fa-star"} />
    ))}
  </div>
);

const ProfessionTeam = ({ team, basePath, heading, subheading }) => (
  <section className="pt80 pt60-md pb80 pb60-md">
    <div className="container">
      <div className="row justify-content-center mb45 mb30-md">
        <div className="col-lg-7 text-center" data-aos="fade-up">
          {/* <p className="section-kicker">Our Experts</p> */}
          <h2 className="title mb15">{heading || "Meet Our Team"}</h2>
          <p className="text fz15">{subheading}</p>
        </div>
      </div>
    </div>
    <div className="lawyer-team-scroll-wrapper">
      <div className="lawyer-team-scroll-track">
        {team.map((member, i) => (
          <Link
            href={`${basePath}/${member.slug}`}
            key={member.slug}
            className="lawyer-team-card"
            data-aos="fade-up"
            data-aos-delay={i * 80}
          >
            <div className="lawyer-team-card__img-wrap">
              <span className="lawyer-team-card__rating-badge">
                <i className="fas fa-star me-1" />
                {member.rating} Rating
              </span>
              <Image
                src={member.img}
                alt={member.name}
                width={300}
                height={340}
                className="lawyer-team-card__img"
              />
            </div>
            <div className="lawyer-team-card__body">
              <h5 className="lawyer-team-card__name">{member.name}</h5>
              <p className="lawyer-team-card__role">{member.role}</p>
              <span className="lawyer-team-card__tag">
                <i className="fas fa-briefcase me-1" />
                {member.speciality}
              </span>
              <div className="d-flex align-items-center justify-content-between mt10">
                <StarRating rating={member.rating} />
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
export default ProfessionTeam;
