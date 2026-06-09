const express = require("express");
const {
  createBlog,
  getAllBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.single("image"), createBlog);
router.get("/", authMiddleware, isAdmin, getAllBlogs);
router.get("/:id", authMiddleware, isAdmin, getBlog);
router.put("/:id", authMiddleware, isAdmin, upload.single("image"), updateBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);

module.exports = router;
