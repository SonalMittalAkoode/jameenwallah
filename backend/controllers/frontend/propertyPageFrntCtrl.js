const PropertyPage = require("../../models/propertyPage");
const City = require("../../models/city");
const asyncHandler = require("express-async-handler");

// Get active property pages (optionally filtered by city slug/name)
const getPropertyPages = asyncHandler(async (req, res) => {
  try {
    const { city, limit } = req.query;
    let filter = { status: "active" };

    if (city) {
      // Find the city first by name (case insensitive)
      const cityDoc = await City.findOne({
        name: { $regex: new RegExp(`^${city}$`, "i") },
      });
      if (cityDoc) {
        filter.cityId = cityDoc._id;
      } else {
        return res.json({ status: "success", data: [] });
      }
    }

    const pages = await PropertyPage.find(filter)
      .select("title slug cityId status description metatitle metadescription createdAt propertyId")
      .populate("cityId", "name slug")
      .sort("-createdAt")
      .limit(Math.min(Math.max(Number(limit) || 100, 1), 500));

    res.json({ status: "success", data: pages });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Get single property page by slug or id
const getPropertyPageBySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    let filter = { status: "active" };
    
    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      filter = { $and: [{ status: "active" }, { $or: [{ _id: slug }, { slug: slug }] }] };
    } else {
      const titleMatchStr = slug.replace(/-/g, '.*');
      filter = { 
        status: "active", 
        $or: [
          { slug: slug },
          { title: { $regex: new RegExp(`^.*${titleMatchStr}.*$`, "i") } }
        ] 
      };
    }

    const page = await PropertyPage.findOne(filter)
      .populate("cityId", "name slug")
      .populate({
        path: "propertyId",
        match: { status: "verified" },
        populate: [
          { path: "location.city", select: "name slug" },
          { path: "location.state", select: "name slug" },
        ],
      });

    if (!page) {
      return res.status(404).json({ status: "fail", message: "Property page not found" });
    }

    res.json({ status: "success", data: page });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = {
  getPropertyPages,
  getPropertyPageBySlug,
};
