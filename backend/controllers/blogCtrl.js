const { timeStamp, time } = require("console");
const Blog = require("../models/blog");
const asyncHandler = require("express-async-handler");
const path = require("path");
const { notifySubscribersAboutBlog } = require("../utils/emailService");

// create blog
const createBlog = asyncHandler(async (req, res) => {
  const {
    title,
    blogCategory,
    slug,
    source,
    date,
    description,
    tags,
    metaTitle,
    metaDescription,
    status,
  } = req.body;

  if (!title) {
    return res.status(400).json({
      status: "error",
      message: "Blog title is required",
      code: 400,
      timeStamp: new Date().toISOString(),
    });
  }

  if (!blogCategory) {
    return res.status(400).json({
      status: "error",
      message: "Blog category is required",
      code: 400,
      timeStamp: new Date().toISOString(),
    });
  }

  if (!description) {
    return res.status(400).json({
      status: "error",
      message: "Blog description is required",
      code: 400,
      timeStamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : null;

  const blogSlug =
    slug ||
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existingBlog = await Blog.findOne({ slug: blogSlug });
  if (existingBlog) {
    return res.status(400).json({
      status: "error",
      message: "Blog with this slug already exists",
      code: 400,
      timeStamp: new Date().toISOString(),
    });
  }

  let tagsArray = [];
  if (tags) {
    if (Array.isArray(tags)) {
      tagsArray = tags
        .map((tag) => String(tag).trim())
        .filter((tag) => tag.length > 0);
    } else if (typeof tags === "string") {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) {
          tagsArray = parsed
            .map((tag) => String(tag).trim())
            .filter((tag) => tag.length > 0);
        } else {
          tagsArray = [String(parsed).trim()].filter((tag) => tag.length > 0);
        }
      } catch (e) {
        tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }
    }
  }

  const blog = await Blog.create({
    title,
    blogCategory,
    slug: blogSlug,
    source,
    date,
    image,
    description,
    tags: tagsArray,
    metaTitle,
    metaDescription,
    status: status || "active",
  });

  // Send email notifications to active subscribers (non-blocking)
  // Don't wait for emails to complete - send them in the background
  if (blog.status === "active") {
    notifySubscribersAboutBlog(blog).catch((error) => {
      console.error("Error sending blog notifications:", error);
      // Don't fail the request if email sending fails
    });
  }

  res.status(201).json({
    status: "success",
    message: "Blog created successfully",
    data: blog,
    timeStamp: new Date().toISOString(),
  });
});

// get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find()
    .populate("blogCategory", "title status")
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    message: "Blogs fetched successfully",
    data: blogs,
    timeStamp: new Date().toISOString(),
  });
});

// get single blog
const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate(
    "blogCategory",
    "title status"
  );
  if (!blog)
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  res.status(200).json({
    status: "success",
    message: "Blogs fetched successfully",
    data: blog,
    timestamp: new Date().toISOString(),
  });
});

// update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    blogCategory,
    slug,
    source,
    date,
    description,
    tags,
    metaTitle,
    metaDescription,
    status,
  } = req.body;

  const existingBlog = await Blog.findById(id);
  if (!existingBlog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  const updateData = {};

  if (title) {
    updateData.title = title;
  }

  if (blogCategory) {
    updateData.blogCategory = blogCategory;
  }

  if (slug !== undefined) {
    const blogSlug =
      slug ||
      (title
        ? title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : existingBlog.slug);

    const slugExists = await Blog.findOne({ slug: blogSlug, _id: { $ne: id } });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Blog with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = blogSlug;
  }

  if (source !== undefined) {
    updateData.source = source;
  }

  if (date !== undefined) {
    updateData.date = date;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (tags !== undefined) {
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags
          .map((tag) => String(tag).trim())
          .filter((tag) => tag.length > 0);
      } else if (typeof tags === "string") {
        try {
          const parsed = JSON.parse(tags);
          if (Array.isArray(parsed)) {
            tagsArray = parsed
              .map((tag) => String(tag).trim())
              .filter((tag) => tag.length > 0);
          } else {
            tagsArray = [String(parsed).trim()].filter((tag) => tag.length > 0);
          }
        } catch (e) {
          tagsArray = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        }
      }
    }
    updateData.tags = tagsArray;
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

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("blogCategory", "title status");

  if (!updatedBlog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Blog updated successfully",
    data: updatedBlog,
    timestamp: new Date().toISOString(),
  });
});

// delete blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedBlog = await Blog.findByIdAndDelete(id);
  if (!deletedBlog)
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  res.status(200).json({
    status: "success",
    message: "Blog deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createBlog,
  getAllBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
};
