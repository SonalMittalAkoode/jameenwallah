const Amenity = require("../models/amenity");

// create amenity
const createAmenity = async (req, res) => {
  try {
    const { title, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Amenity title is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status must be either 'active' or 'inactive'",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const existingAmenity = await Amenity.findOne({
      title: title.trim(),
    });
    if (existingAmenity) {
      return res.status(400).json({
        status: "error",
        message: "Amenity with this title already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const amenity = await Amenity.create({
      title: title.trim(),
      status: status || "active",
    });

    res.status(201).json({
      status: "success",
      message: "Amenity created successfully",
      data: amenity,
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

// get all
const getAllAmenity = async (req, res) => {
  try {
    const { status, sortBy = "title", sortOrder = "asc" } = req.query;

    const query = {};
    if (status) {
      if (["active", "inactive"].includes(status)) {
        query.status = status;
      }
    }

    const sort = {};
    const validSortFields = ["title", "status", "createdAt", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "title";
    const order = sortOrder === "desc" ? -1 : 1;
    sort[sortField] = order;

    const amenities = await Amenity.find(query).sort(sort);

    res.status(200).json({
      status: "success",
      message: "Amenities fetched successfully",
      data: amenities,
      count: amenities.length,
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

// get amenity by id
const getAmenityById = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) {
      return res.status(404).json({
        status: "error",
        message: "Amenity not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Amenity fetched successfully",
      data: amenity,
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

// update amenity
const updateAmenity = async (req, res) => {
  try {
    const { title, status } = req.body;
    const { id } = req.params;

    const existingAmenity = await Amenity.findById(id);
    if (!existingAmenity) {
      return res.status(404).json({
        status: "error",
        message: "Amenity not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    const updateData = {};

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Amenity title cannot be empty",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }

      const duplicateAmenity = await Amenity.findOne({
        title: title.trim(),
        _id: { $ne: id },
      });
      if (duplicateAmenity) {
        return res.status(400).json({
          status: "error",
          message: "Amenity with this title already exists",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }

      updateData.title = title.trim();
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          status: "error",
          message: "Status must be either 'active' or 'inactive'",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      updateData.status = status;
    }

    const amenity = await Amenity.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: "Amenity updated successfully",
      data: amenity,
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

// delete amenity
const deleteAmenity = async (req, res) => {
  try {
    const amenity = await Amenity.findByIdAndDelete(req.params.id);
    if (!amenity) {
      return res.status(404).json({
        status: "error",
        message: "Amenity not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Amenity deleted successfully",
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
  createAmenity,
  getAllAmenity,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
};
