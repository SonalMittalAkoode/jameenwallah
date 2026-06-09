const mongoose = require("mongoose");
const Faq = require("../models/faq");

const propertySchema = new mongoose.Schema(
  {
    personalDetails: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
    },
    description: {
      title: {
        type: String,
      },
      slug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
      },
      metaTitle: {
        type: String,
        trim: true,
      },
      metaDescription: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
      },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
      propertyType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PropertyType",
      },
      inferredPropertyType: {
        type: String,
        trim: true,
      },
      inferredCategory: {
        type: String,
        trim: true,
      },
      builder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Builder",
      },
      price: {
        type: Number,
      },
      paymentPlan: {
        type: String,
      },
      reraApproved: {
        type: String,
        enum: ["Yes", "No"],
      },
      reraNumber: {
        type: String,
      },
      featuredProperty: {
        type: String,
        enum: ["Yes", "No"],
      },
      floorPlans: [
        {
          unitType: {
            type: String,
          },
          carpetArea: {
            type: String,
          },
          builtUpArea: {
            type: String,
          },
          superBuiltUpArea: {
            type: Number,
          },
          price: {
            type: String,
          },
          image: {
            type: String,
          },
        },
      ],
    },
    media: {
      images: [
        {
          type: String,
        },
      ],
      floorPlanImages: [
        {
          type: String,
        },
      ],
      videoLink: {
        type: String,
      },
      virtualTour: {
        type: String,
      },
      sitePlanImage: {
        type: String,
      },
      masterPlanImage: {
        type: String,
      },
    },
    location: {
      address: {
        type: String,
      },
      state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "State",
      },
      city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
      },
      area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Area",
      },
      zip: {
        type: String,
      },
      nearBy: {
        type: String,
      },
      mapEmbedCode: {
        type: String,
      },
      inferredAddress: {
        type: String,
        trim: true,
      },
      mapQuery: {
        type: String,
        trim: true,
      },
      googleMapsUrl: {
        type: String,
        trim: true,
      },
    },
    details: {
      sizeInSqFt: {
        type: Number,
      },
      totalAreaInSqFt: {
        type: Number,
      },
      rooms: {
        type: Number,
      },
      bedrooms: {
        type: Number,
      },
      bathrooms: {
        type: String,
      },
      customId: {
        type: String,
      },
      parking: {
        type: String,
        enum: [
          "Open",
          "Covered",
          "Reserved",
          "Visitor",
          "Basement",
          "Street",
          "Truck",
          "Not Available",
        ],
      },
      numberOfParkings: {
        type: Number,
        min: 0,
      },
      completionDate: {
        type: String,
      },
      possessionDate: {
        type: String,
      },
      revisedPossessionDate: {
        type: String,
      },
      availableFrom: {
        type: String,
      },
      basement: {
        type: String,
        enum: ["No", "Single", "Double", "Triple", "Parking", "Service"],
      },
      balcony: {
        type: Number,
      },
      bhk: {
        type: String,
      },
      totalFloors: {
        type: Number,
      },
      totalTowers: {
        type: Number,
      },
      ceilingHeight: {
        type: Number,
      },
      floorLoadCapacity: {
        type: Number,
      },
      plotSize: {
        type: Number,
      },
      plotDimensionLength: {
        type: Number,
      },
      plotDimensionWidth: {
        type: Number,
      },
      facing: {
        type: String,
        enum: [
          "north",
          "south",
          "east",
          "west",
          "north-east",
          "north-west",
          "south-east",
          "south-west",
        ],
      },
      shellStatus: {
        type: String,
        enum: ["bare shell", "warm shell", "full furnished"],
      },
      washroomAvailability: {
        type: String,
        enum: ["Yes", "No"],
      },
      pantryAvailability: {
        type: String,
        enum: ["Yes", "No"],
      },
      numberOfEntrances: {
        type: Number,
      },
      boundaryWall: {
        type: String,
        enum: ["Yes", "No"],
      },
      gatedCommunity: {
        type: String,
        enum: ["Yes", "No"],
      },
      cornerPlot: {
        type: String,
        enum: ["Yes", "No"],
      },
      legalStatus: {
        type: String,
        enum: ["Yes", "No"],
      },
      construction: {
        type: String,
        enum: ["Yes", "No"],
      },
      waterSource: {
        type: String,
        enum: ["Borewell", "Municipal", "Mixed", "Tanker"],
      },
      electricityPhase: {
        type: String,
        enum: ["Single Phase", "Three Phase"],
      },
      boundaryStatus: {
        type: String,
        enum: ["Gated", "Boundary Wall", "Fenced"],
      },
      furnishingStatus: {
        type: String,
        enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
      },
      ownershipType: {
        type: String,
        enum: [
          "Freehold",
          "Leasehold",
          "Co-operative",
          "Share of Freehold",
          "Government Lease",
          "Pending",
        ],
      },
      propertyStatus: {
        type: String,
        enum: [
          "Ready to Move",
          "Under Construction",
          "Completed",
          "New Launch",
          "Delayed",
        ],
      },
      buildingStatus: {
        type: String,
        enum: ["Ready", "Under Construction", "Incomplete", "Needs Renovation"],
      },
    },
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenity",
      },
    ],
    createdBy: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "assigned", "rejected", "sold"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    assignedAgent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
        default: null,
      },
    ],
  },
  { timestamps: true }
);

propertySchema.virtual("url").get(function () {
  if (!this.description?.slug) return null;

  return `${process.env.FRONTEND_URL}/properties/${this.description.slug}`;
});

propertySchema.set("toJSON", { virtuals: true });
propertySchema.set("toObject", { virtuals: true });



propertySchema.virtual('faqs', {
  ref: 'Faq', // Make sure this matches the model name for your images schema
  localField: '_id',
  foreignField: 'propertyId',
});

propertySchema.set('toObject', { virtuals: true });
propertySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Property", propertySchema);
