const express = require("express");
const {
  createPropertyType,
  getAllPropertyTypes,
  getPropertyTypeById,
  getPropertyTypesByCategoryId,
  updatePropertyType,
  deletePropertyType,
} = require("../controllers/propertyTypeCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/", authMiddleware, isAdmin, createPropertyType);
router.get("/", getAllPropertyTypes);
router.get("/single/:id", getPropertyTypeById);
router.get("/category/:categoryId", getPropertyTypesByCategoryId);
router.put("/:id", authMiddleware, isAdmin, updatePropertyType);
router.delete("/:id", authMiddleware, isAdmin, deletePropertyType);

module.exports = router;
