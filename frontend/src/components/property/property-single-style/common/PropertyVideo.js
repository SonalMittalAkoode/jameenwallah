import React from "react";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const getEmbedUrl = (url) => {
  if (!url) return "";

  const youtubeMatch =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/i) ||
    url.match(/youtube\.com\/embed\/([^&?/]+)/i);

  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  return url;
};

const PropertyVideo = ({ property }) => {
  const { videoLink } = normalizePropertyDetail(property);
  const embedUrl = getEmbedUrl(videoLink);

  if (!embedUrl) return null;

  return (
    <div className="col-md-12">
      <div className="ratio ratio-16x9 overflow-hidden bdrs12">
        <iframe
          src={embedUrl}
          title="Property video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default PropertyVideo;
