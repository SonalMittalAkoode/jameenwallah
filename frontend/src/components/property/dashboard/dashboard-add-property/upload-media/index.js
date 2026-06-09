import { useMemo } from "react";
import UploadPhotoGallery from "./UploadPhotoGallery";
import VideoOptionFiled from "./VideoOptionFiled";

// Stable empty array references to prevent unnecessary re-renders
const EMPTY_ARRAY = [];

const UploadMedia = ({
  media,
  onImagesChange,
  onVideoLinkChange,
  onVirtualTourChange,
  onSitePlanImageChange,
  onMasterPlanImageChange,
  resetSignal,
}) => {
  // Use useMemo to ensure stable array references and prevent infinite loops
  const images = useMemo(() => {
    if (Array.isArray(media?.images)) {
      return media.images;
    }
    return EMPTY_ARRAY;
  }, [media?.images]);

  const virtualTourFiles = useMemo(() => {
    return media?.virtualTour ? [media.virtualTour] : EMPTY_ARRAY;
  }, [media?.virtualTour]);

  const sitePlanImageFiles = useMemo(() => {
    return media?.sitePlanImage ? [media.sitePlanImage] : EMPTY_ARRAY;
  }, [media?.sitePlanImage]);

  const masterPlanImageFiles = useMemo(() => {
    return media?.masterPlanImage ? [media.masterPlanImage] : EMPTY_ARRAY;
  }, [media?.masterPlanImage]);

  return (
    <div className="ps-widget bgc-white bdrs12 p30 overflow-hidden position-relative">
      <h4 className="title fz17 mb30">Upload photos of your property</h4>
      <div className="form-style1">
        <div className="row">
          <div className="col-lg-12">
            <UploadPhotoGallery
              title="Upload/Drag photos of your property"
              description="Photos must be JPEG, PNG, or WebP format and at least 2048x768"
              files={images}
              multiple
              onFilesChange={onImagesChange}
              resetSignal={resetSignal}
            />
          </div>
        </div>

        <div className="row">
          <h4 className="title fz17 mb30">Video Option</h4>
          <VideoOptionFiled
            value={media.videoLink}
            onChange={onVideoLinkChange}
          />
        </div>

        <div className="row">
          <div className="col-sm-6 col-xl-12">
            <div className="mb30">
              <label className="heading-color ff-heading fw600 mb10">
                360 Degree Virtual Image
              </label>
              <div className="row">
                <div className="col-lg-12">
                  <UploadPhotoGallery
                    title="Upload/Drag 360° virtual image"
                    description="Upload a single 360° image (JPEG, PNG, or WebP)."
                    files={virtualTourFiles}
                    multiple={false}
                    onFilesChange={(files) =>
                      onVirtualTourChange(files[0] || null)
                    }
                    resetSignal={resetSignal}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <h4 className="title fz17 mb30">Site Plan Image</h4>
          <div className="col-lg-12">
            <UploadPhotoGallery
              title="Upload/Drag site plan image"
              description="Photos must be JPEG, PNG, or WebP format and at least 2048x768"
              files={sitePlanImageFiles}
              multiple={false}
              onFilesChange={(files) => onSitePlanImageChange(files[0] || null)}
              resetSignal={resetSignal}
            />
          </div>
        </div>

        <div className="row">
          <h4 className="title fz17 mb30">Master Plan Image</h4>
          <div className="col-lg-12">
            <UploadPhotoGallery
              title="Upload/Drag master plan image"
              description="Photos must be JPEG, PNG, or WebP format and at least 2048x768"
              files={masterPlanImageFiles}
              multiple={false}
              onFilesChange={(files) =>
                onMasterPlanImageChange(files[0] || null)
              }
              resetSignal={resetSignal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadMedia;
