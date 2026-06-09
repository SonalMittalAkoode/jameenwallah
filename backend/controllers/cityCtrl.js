const City = require("../models/city");
const State = require("../models/state");
const Property = require("../models/property");
const fs = require("fs");
const path = require("path");

// delete file
const deleteFile = (filePath) => {
  if (!filePath) return;
  try {
    const normalizedPath = filePath.startsWith("/")
      ? filePath.slice(1)
      : filePath;
    const absolutePath = path.join(__dirname, "../public", normalizedPath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

// create city
const createCity = async (req, res) => {
  try {
    const {
      name,
      stateId,
      status,
      isTrending,
      description,
      metaTitle,
      metaDescription,
      cityH1Title,
    } = req.body;
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "City name is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Validate state only if provided
    if (stateId) {
      const existingState = await State.findById(stateId);
      if (!existingState) {
        return res.status(400).json({
          status: "error",
          message: "Invalid stateId or state does not exist",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Check for duplicate city name in the same state
      const existingCity = await City.findOne({ name, state: stateId });
      if (existingCity) {
        return res.status(400).json({
          status: "error",
          message: "City already exists in this state",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Check for duplicate city name without state (if state is not provided)
      const existingCity = await City.findOne({ name, state: null });
      if (existingCity) {
        return res.status(400).json({
          status: "error",
          message: "City with this name already exists without a state",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const image = req.file ? `/images/${req.file.filename}` : undefined;

    const cityData = {
      name,
      description,
      metaTitle,
      metaDescription,
      cityH1Title,
      status: status || "active",
      isTrending: isTrending || "deactive",
      image,
    };
    
    // Only include state if provided
    if (stateId) {
      cityData.state = stateId;
    }
    const city = await City.create(cityData);
    res.status(201).json({
      status: "success",
      message: "City created successfully",
      data: city,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get all cities
const getAllCities = async (req, res) => {
  try {
    const cities = await City.find().populate("state", " name");
    res.status(200).json({
      status: "success",
      message: "Cities retrieved successfully",
      data: cities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get city by state id
const getCitiesByStateId = async (req, res) => {
  try {
    const { stateId } = req.params;
    const cities = await City.find({ state: stateId }).populate(
      "state",
      " name"
    );
    if (!cities.length) {
      return res.status(404).json({
        status: "error",
        message: "No cities found for this state",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Cities retrieved successfully",
      data: cities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get city by id
const getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id).populate("state", " name");
    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "City not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "City retrieved successfully",
      data: city,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// update city
const updateCity = async (req, res) => {
  try {
    const {
      name,
      stateId,
      status,
      isTrending,
      description,
      metaTitle,
      metaDescription,
      cityH1Title,
    } = req.body;
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "City not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate state only if provided
    if (stateId !== undefined && stateId !== null && stateId !== "") {
      const existingState = await State.findById(stateId);
      if (!existingState) {
        return res.status(400).json({
          status: "error",
          message: "Invalid stateId or state does not exist",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Check for duplicate city name in the same state (excluding current city)
      const existingCity = await City.findOne({ 
        name: name || city.name, 
        state: stateId,
        _id: { $ne: req.params.id }
      });
      if (existingCity) {
        return res.status(400).json({
          status: "error",
          message: "City already exists in this state",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
    } else if (stateId === null || stateId === "") {
      // Check for duplicate city name without state (excluding current city)
      const existingCity = await City.findOne({ 
        name: name || city.name, 
        state: null,
        _id: { $ne: req.params.id }
      });
      if (existingCity) {
        return res.status(400).json({
          status: "error",
          message: "City with this name already exists without a state",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (cityH1Title !== undefined) updateData.cityH1Title = cityH1Title;
    // Only update state if stateId is explicitly provided (not undefined)
    // If stateId is undefined, don't change the state field
    // If stateId is null or empty string, clear the state
    if (stateId !== undefined) {
      updateData.state = (stateId && stateId !== "") ? stateId : null;
    }
    if (status) updateData.status = status;
    if (isTrending !== undefined) updateData.isTrending = isTrending;

    if (req.file) {
      if (city.image) {
        deleteFile(city.image);
      }
      updateData.image = `/images/${req.file.filename}`;
    }

    const updatedCity = await City.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      message: "City updated successfully",
      data: updatedCity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// delete city
const deleteCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "City not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    if (city.image) {
      deleteFile(city.image);
    }

    await City.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "City deleted successfully",
      data: city,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get cities with property counts
const getCitiesWithPropertyCounts = async (req, res) => {
  try {
    const cities = await City.find({ status: "active" })
      .populate("state", "name")
      .sort({ createdAt: 1 });

    const propertyCounts = await Property.aggregate([
      {
        $match: {
          "location.city": { $exists: true, $ne: null },
          status: { $in: ["verified", "assigned", "sold"] },
        },
      },
      {
        $group: {
          _id: "$location.city",
          count: { $sum: 1 },
        },
      },
    ]);

    const propertyCountMap = new Map();
    propertyCounts.forEach((item) => {
      const cityId = item._id ? item._id.toString() : null;
      if (cityId) {
        propertyCountMap.set(cityId, item.count);
      }
    });

    const citiesWithCounts = cities.map((city) => {
      const cityId = city._id ? city._id.toString() : null;
      const propertyCount = cityId ? propertyCountMap.get(cityId) || 0 : 0;

      const cityObj = city.toObject ? city.toObject() : city;

      let imageValue = null;
      if (
        cityObj.image &&
        typeof cityObj.image === "string" &&
        cityObj.image.trim() !== ""
      ) {
        imageValue = cityObj.image.trim();
        if (!imageValue.startsWith("/")) {
          imageValue = `/${imageValue}`;
        }
      }

      return {
        _id: cityObj._id,
        id: cityId,
        name: cityObj.name,
        state: cityObj.state && cityObj.state.name ? cityObj.state.name : null,
        image: imageValue,
        propertyCount: propertyCount,
        status: cityObj.status,
      };
    });

    res.status(200).json({
      status: "success",
      message: "Cities with property counts retrieved successfully",
      data: citiesWithCounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  createCity,
  getAllCities,
  getCitiesByStateId,
  getCityById,
  updateCity,
  deleteCity,
  getCitiesWithPropertyCounts,
};
