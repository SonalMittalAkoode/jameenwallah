const mongoose = require("mongoose");

const becomeaenquirySchema = new mongoose.Schema(
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
    partnertype: {
      type: String,
      required: true,
    },
    // scheduledDate: {
    //   type: String,
    // },
    // scheduledTime: {
    //   type: String,
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Becomeaenquiry", becomeaenquirySchema);
