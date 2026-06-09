import React from "react";
import Link from "next/link";
import { resolveImageSrc } from "@/utils/resolveImage";

const AboutBuilder = ({ builder }) => {
  if (!builder) return null;
  const builderImage = resolveImageSrc(builder.image, "");

  return (
    <>
      <div className="d-flex align-items-center mb30">
        {builderImage ? (
          <div className="agency-img flex-shrink-0" style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #eee' }}>
            <img
              className="w-100 h-100"
              style={{ objectFit: 'contain' }}
              src={builderImage}
              alt={builder.title || "Builder Logo"}
              loading="lazy"
            />
          </div>
        ) : null}
        <div className={`agency-content flex-grow-1${builderImage ? " ms-3" : ""}`}>
          <h5 className="title mb-1">{builder.title}</h5>
          
          <div className="d-flex flex-wrap gap-3 mt-2">
            {builder.experience && (
              <div>
                <span className="fw-bold me-1">{builder.experience}</span>
                <span className="text-muted">Experience</span>
              </div>
            )}
            {builder.projectsCompleted && (
              <div className="border-start ps-3">
                <span className="fw-bold me-1">{builder.projectsCompleted}</span>
                <span className="text-muted">Completed Projects</span>
              </div>
            )}
            {builder.ongoingProjects && (
              <div className="border-start ps-3">
                <span className="fw-bold me-1">{builder.ongoingProjects}</span>
                <span className="text-muted">Ongoing Projects</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {builder.description && (
        <div 
          className="mb20" 
          dangerouslySetInnerHTML={{ __html: builder.description }}
        />
      )}
      
      {builder.slug && (
        <Link href={`/builders/${builder.slug}`} className="ud-btn btn-white2 mt10">
          View All Projects<i className="fal fa-arrow-right-long" />
        </Link>
      )}
    </>
  );
};

export default AboutBuilder;
