import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    bed: { type: Number, required: true },
    bath: { type: Number },
    sqft: { type: Number },
    price: { type: Number, required: true }, // Storing as Number for numeric queries
    priceDisplay: { type: String }, // For original display (e.g., "$14,000")
    propertyType: { type: String, required: true },
    forRent: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    image: { type: String },
    features: [{ type: String }],
    tags: [{ type: String }],
    lat: { type: Number },
    long: { type: Number },
    yearBuilding: { type: Number },
  },
  { timestamps: true }
);

// Add text index for better location/title search
PropertySchema.index({ title: "text", location: "text", city: "text" });

export default mongoose.models.Property || mongoose.model("Property", PropertySchema);
