const mongoose = require("mongoose");

const consultancyenquirySchema = new mongoose.Schema(
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
    issuetype: {
      type: String,
      required: true,
    },
    accounttype: {
    type: String,
    enum: ["Charteredaccountant", "Lawyer", "Financer", "Architect"] // must match model names
  },
  accountid: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "accounttype", // 🔥 dynamic reference
  }
    // scheduledDate: {
    //   type: String,
    // },
    // scheduledTime: {
    //   type: String,
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConsultancyEnquiry", consultancyenquirySchema);
