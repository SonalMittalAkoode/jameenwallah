const Blog = require("../../models/blog");
const BlogCategory = require("../../models/blogCategory");
const asyncHandler = require("express-async-handler");

// get limited blogs
const getLimitedBlogs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 3;

  const blogs = await Blog.find({ status: "active" })
    .select("title description date blogCategory createdAt image slug")
    .populate("blogCategory", "title")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const formattedBlogs = blogs.map((blog) => {
    return {
      _id: blog._id,
      title: blog.title,
      description: blog.description,
      date: blog.date || blog.createdAt,
      category: blog.blogCategory ? blog.blogCategory.title : null,
      image: blog.image || null,
      slug: blog.slug || null,
      createdAt: blog.createdAt,
    };
  });

  res.status(200).json({
    status: "success",
    message: "Blogs fetched successfully",
    data: formattedBlogs,
    count: formattedBlogs.length,
    timestamp: new Date().toISOString(),
  });
});

// get all blogs with pagination
const getAllBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search ? String(req.query.search).trim() : "";
  const category = req.query.category ? String(req.query.category).trim() : "";
  const tag = req.query.tag ? String(req.query.tag).trim() : "";

  const query = { status: "active" };

  if (category) {
    query.blogCategory = category;
  }

  if (tag) {
    query.tags = tag;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .populate("blogCategory", "title")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    status: "success",
    message: "Blogs fetched successfully",
    data: blogs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// get latest 3 blogs
const getLatestBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ status: "active" })
    .populate("blogCategory", "title")
    .sort({ createdAt: -1 })
    .limit(3);

  res.status(200).json({
    status: "success",
    message: "Latest blogs fetched successfully",
    data: blogs,
  });
});

// get popular tags
const getPopularTags = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ status: "active" }).select("tags");

  const tagCount = {};
  blogs.forEach((blog) => {
    blog.tags?.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  const popularTags = Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.status(200).json({
    status: "success",
    message: "Popular tags fetched successfully",
    data: popularTags,
  });
});

// get blog categories
const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = await BlogCategory.find({ status: "active" })
    .select("title")
    .sort({ title: 1 });

  res.status(200).json({
    status: "success",
    message: "Blog categories fetched successfully",
    data: categories,
  });
});

// get single blog by ID or slug
const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let blog = await Blog.findOne({
    slug: id,
    status: "active",
  }).populate("blogCategory", "title");

  if (!blog) {
    blog = await Blog.findOne({
      _id: id,
      status: "active",
    }).populate("blogCategory", "title");
  }

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Blog fetched successfully",
    data: blog,
  });
});

// get related blogs
const getRelatedBlogs = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let blog = await Blog.findOne({
    slug: id,
    status: "active",
  });

  if (!blog) {
    blog = await Blog.findOne({
      _id: id,
      status: "active",
    });
  }

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  const relatedBlogs = await Blog.find({
    status: "active",
    _id: { $ne: blog._id },
    blogCategory: blog.blogCategory,
  })
    .populate("blogCategory", "title")
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit) || 3);

  res.status(200).json({
    status: "success",
    message: "Related blogs fetched successfully",
    data: relatedBlogs,
  });
});

module.exports = {
  getLimitedBlogs,
  getAllBlogs,
  getLatestBlogs,
  getPopularTags,
  getBlogCategories,
  getBlogById,
  getRelatedBlogs,
};
