const mongoose = require("mongoose");

const builderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    reraRegistration: {
      type: String,
    },
    experience: {
      type: String,
    },
    projectsCompleted: {
      type: String,
    },
    ongoingProjects: {
      type: String,
    },
    certifications: [
      {
        type: String,
      },
    ],
    partnerships: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Builder", builderSchema);
