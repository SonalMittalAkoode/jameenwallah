const express = require("express");
const {
  createPropertymanagement,
  getAllPropertymanagements,
  getPropertymanagementById,
  updatePropertymanagement,
  deletePropertymanagement,
} = require("../controllers/propertymanagementCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadImage.js");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.fields([{ name: "image", maxCount: 1 }, { name: "featuredImage", maxCount: 1 }]), createPropertymanagement);
router.get("/", authMiddleware, isAdmin, getAllPropertymanagements);
router.get("/:id", authMiddleware, isAdmin, getPropertymanagementById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "featuredImage", maxCount: 1 }]),
  updatePropertymanagement
);
router.delete("/:id", authMiddleware, isAdmin, deletePropertymanagement);

module.exports = router;
