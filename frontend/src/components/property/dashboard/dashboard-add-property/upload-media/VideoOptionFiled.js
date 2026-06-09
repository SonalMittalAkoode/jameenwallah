"use client";

const VideoOptionFiled = ({ value, onChange }) => {
  return (
    <div className="col-sm-6 col-xl-4">
      <div className="mb30">
        <label className="heading-color ff-heading fw600 mb10">
          Video Link
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Paste video link (optional)"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    </div>
  );
};

export default VideoOptionFiled;
