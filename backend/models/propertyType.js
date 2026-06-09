const mongoose = require("mongoose");

const propertyTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PropertyType", propertyTypeSchema);
