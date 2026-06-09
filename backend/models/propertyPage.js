const mongoose = require("mongoose");

const propertyPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    propertyId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: false,
    }],
     cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    metatitle: {
      type: String,
      required: true,
      trim: true,
    },
    metadescription: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Propertypage", propertyPageSchema);
