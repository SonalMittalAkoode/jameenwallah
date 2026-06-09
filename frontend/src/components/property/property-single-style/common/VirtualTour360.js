import Image from "next/image";
import React from "react";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const VirtualTour360 = ({ property }) => {
  const { virtualTour, title } = normalizePropertyDetail(property);

  if (!virtualTour) return null;

  if (/\.(mp4|webm|ogg)$/i.test(virtualTour)) {
    return (
      <div className="col-md-12">
        <video className="w-100 bdrs12" controls playsInline>
          <source src={virtualTour} />
        </video>
      </div>
    );
  }

  return (
    <div className="col-md-12">
      <Image
        width={736}
        height={373}
        src={virtualTour}
        alt={`${title} virtual tour`}
        className="w-100 bdrs12 h-100 cover"
      />
    </div>
  );
};

export default VirtualTour360;
