const mongoose = require("mongoose");

const callRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    service: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    sourcePage: {
      type: String,
      trim: true,
      maxlength: 240,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallRequest", callRequestSchema);
