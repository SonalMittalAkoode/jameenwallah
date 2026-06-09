import React from "react";
import Image from "next/image";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const MasterPlan = ({ property }) => {
  const { masterPlanImage, title } = normalizePropertyDetail(property);

  if (!masterPlanImage) return null;

  return (
    <div className="col-md-12">
      <div className="overflow-hidden bdrs12">
        <Image
          width={736}
          height={544}
          className="w-100 h-auto cover bdrs12"
          src={masterPlanImage}
          alt={`${title} master plan`}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
};

export default MasterPlan;
