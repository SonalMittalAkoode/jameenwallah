const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Agent = require("../../models/agent");

// create agent
const createAgent = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    description,
    status,
    slug,
    metaTitle,
    metaDescription,
  } = req.body;

  if (!name || !email || !phoneNumber) {
    return res.status(400).json({
      status: "error",
      message: "Name, email and phone number are required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const agentSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existingAgent = await Agent.findOne({ slug: agentSlug });
  if (existingAgent) {
    return res.status(400).json({
      status: "error",
      message: "Agent with this slug already exists",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : null;

  const agent = await Agent.create({
    name,
    email,
    phoneNumber,
    slug: agentSlug,
    description,
    metaTitle,
    metaDescription,
    status: status || "active",
    image,
  });

  res.status(201).json({
    status: "success",
    message: "Agent created successfully",
    data: agent,
    timestamp: new Date().toISOString(),
  });
});

//get all agents
const getAllAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    messages: "Agents fetched successfully",
    data: agents,
    timestamp: new Date().toISOString(),
  });
});

// get agent by id or slug
const getAgentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let agent = null;

  agent = await Agent.findOne({ slug: id });

  if (!agent && mongoose.Types.ObjectId.isValid(id)) {
    agent = await Agent.findById(id);
  }

  if (!agent) {
    return res.status(404).json({
      status: "error",
      message: "Agent not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Agent fetched successfully",
    data: agent,
    timestamp: new Date().toISOString(),
  });
});

//update agent
const updateAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNumber,
    description,
    status,
    slug,
    metaTitle,
    metaDescription,
  } = req.body;

  const existingAgent = await Agent.findById(id);
  if (!existingAgent) {
    return res.status(404).json({
      status: "error",
      message: "Agent not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  const updateData = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (email !== undefined) {
    updateData.email = email;
  }

  if (phoneNumber !== undefined) {
    updateData.phoneNumber = phoneNumber;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (metaTitle !== undefined) {
    updateData.metaTitle = metaTitle;
  }

  if (metaDescription !== undefined) {
    updateData.metaDescription = metaDescription;
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  if (slug !== undefined) {
    const agentSlug =
      slug ||
      (name
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : existingAgent.slug);

    const slugExists = await Agent.findOne({
      slug: agentSlug,
      _id: { $ne: id },
    });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Agent with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = agentSlug;
  }

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  const updatedAgent = await Agent.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedAgent) {
    return res.status(404).json({
      status: "error",
      message: "Agent not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Agent updated successfully",
    data: updatedAgent,
    timestamp: new Date().toISOString(),
  });
});

// delete agent
const deleteAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      status: "error",
      message: "Agent not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  await agent.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Agent deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
};
