import React from "react";
import Image from "next/image";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const SitePlan = ({ property }) => {
  const { sitePlanImage, title } = normalizePropertyDetail(property);

  if (!sitePlanImage) return null;

  return (
    <div className="col-md-12">
      <div className="overflow-hidden bdrs12">
        <Image
          width={736}
          height={544}
          className="w-100 h-auto cover bdrs12"
          src={sitePlanImage}
          alt={`${title} site plan`}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
};

export default SitePlan;
