const mongoose = require("mongoose");

const agentContactEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AgentContactEnquiry",
  agentContactEnquirySchema
);
