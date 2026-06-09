"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Tooltip as ReactTooltip } from "react-tooltip";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const resolveMediaUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const path = value.trim();

  if (path.startsWith("data:")) {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
};

// Helper function to compare arrays by content
const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      // For File objects, compare by name, size, and lastModified
      if (a[i] instanceof File && b[i] instanceof File) {
        if (
          a[i].name !== b[i].name ||
          a[i].size !== b[i].size ||
          a[i].lastModified !== b[i].lastModified
        ) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  return true;
};

const UploadPhotoGallery = ({
  title,
  description,
  files = [],
  onFilesChange,
  multiple = true,
  accept = "image/*",
  resetSignal = 0,
}) => {
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const prevFilesRef = useRef(null);
  const prevResetSignalRef = useRef(resetSignal);
  const prevPreviewsRef = useRef([]);

  useEffect(() => {
    const fileArray = Array.isArray(files) ? files.filter(Boolean) : [];
    
    // Check if files actually changed by comparing content
    const filesChanged = !arraysEqual(prevFilesRef.current, fileArray);
    const resetSignalChanged = prevResetSignalRef.current !== resetSignal;
    
    // Only update if files actually changed or resetSignal changed
    if (!filesChanged && !resetSignalChanged) {
      return;
    }
    
    // Clean up previous object URLs
    prevPreviewsRef.current.forEach((preview) => {
      if (preview.file) {
        URL.revokeObjectURL(preview.url);
      }
    });
    
    // Update refs before creating new previews
    prevFilesRef.current = fileArray;
    prevResetSignalRef.current = resetSignal;
    
    // Create new previews
    const nextPreviews = fileArray.map((item) => {
      if (typeof item === "string") {
        return { url: resolveMediaUrl(item), original: item };
      }
      const url = URL.createObjectURL(item);
      return { url, file: item };
    });
    
    // Store new previews in ref for next cleanup
    prevPreviewsRef.current = nextPreviews;
    setPreviews(nextPreviews);

    // Cleanup function for when component unmounts or effect re-runs
    return () => {
      nextPreviews.forEach((preview) => {
        if (preview.file) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [files, resetSignal]);

  const handleFiles = (fileList, event) => {
    if (!onFilesChange) return;
    
    // Prevent event from bubbling up to label
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    const selectedFiles = Array.from(fileList || []);

    // Reset the file input value so the same file can be selected again
    // Use setTimeout to ensure it happens after the file is processed
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 0);

    if (!selectedFiles.length) {
      onFilesChange([]);
      return;
    }

    if (multiple) {
      const existing = Array.isArray(files) ? files.filter(Boolean) : [];
      onFilesChange([...existing, ...selectedFiles]);
    } else {
      onFilesChange([selectedFiles[0]]);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDelete = (index) => {
    if (!onFilesChange) return;
    const remaining =
      Array.isArray(files) && files.length
        ? files.filter((_, itemIndex) => itemIndex !== index)
        : [];
    onFilesChange(remaining);
  };

  const openFilePicker = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <>
      <div
        className="upload-img position-relative overflow-hidden bdrs12 text-center mb30 px-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="icon mb30">
          <span className="flaticon-upload" />
        </div>
        <h4 className="title fz17 mb10">{title}</h4>
        {description && <p className="text mb25">{description}</p>}
        <button
          type="button"
          className="ud-btn btn-white"
          onClick={openFilePicker}
        >
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="d-none"
          onChange={(e) => handleFiles(e.target.files, e)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            // Prevent Enter key from triggering the file picker again
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        />
      </div>

      {previews.length > 0 && (
        <div className="row profile-box position-relative d-md-flex align-items-end mb50">
          {previews.map((preview, index) => (
            <div className="col-3 col-sm-2" key={`${preview.url}-${index}`}>
              <div className="profile-img mb20 position-relative">
                <Image
                  width={212}
                  height={194}
                  className="w-100 bdrs12 cover"
                  src={preview.url}
                  alt={`Uploaded media ${index + 1}`}
                />
                <button
                  type="button"
                  style={{ border: "none" }}
                  className="tag-del"
                  title="Delete Image"
                  onClick={() => handleDelete(index)}
                  data-tooltip-id={`delete-${preview.url}`}
                >
                  <span className="fas fa-trash-can" />
                </button>
                <ReactTooltip
                  id={`delete-${preview.url}`}
                  place="right"
                  content="Delete Image"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default UploadPhotoGallery;
