const mongoose = require("mongoose");

const tourRequestEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    tourType: {
      type: String,
      enum: ["in-person", "video-chat"],
      required: true,
    },
    preferredTourDate: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TourRequestEnquiry", tourRequestEnquirySchema);
