const mongoose = require("mongoose");

const propertyenquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: String,
    },
    scheduledTime: {
      type: String,
    },
    budget: {
      type: String,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PropertyEnquiry", propertyenquirySchema);
