const mongoose = require("mongoose");

const bankerConnectSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    employmentType: {
      type: String,
      required: true,
      enum: [
        "salaried",
        "self-employed",
        "business-owner",
        "professional",
        "retired",
      ],
    },
    loanType: {
      type: String,
      required: true,
      enum: [
        "home-loan",
        "commercial-loan",
        "plot-loan",
        "construction-loan",
        "balance-transfer",
        "top-up-loan",
      ],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankerConnect", bankerConnectSchema);
