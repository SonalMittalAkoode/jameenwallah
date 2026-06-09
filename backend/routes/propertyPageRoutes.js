const express = require("express");
const {
  createPropertyPage,
  getAllPropertyPages,
  getPropertyPagesByProperty,
  getPropertyPage,
  updatePropertyPage,
  deletePropertyPage,
} = require("../controllers/propertyPageCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/", authMiddleware, isAdmin, createPropertyPage);
router.get("/", authMiddleware, isAdmin, getAllPropertyPages);
router.get("/property/:propertyId", authMiddleware, isAdmin, getPropertyPagesByProperty);
router.get("/:id", authMiddleware, isAdmin, getPropertyPage);
router.put("/:id", authMiddleware, isAdmin, updatePropertyPage);
router.delete("/:id", authMiddleware, isAdmin, deletePropertyPage);

module.exports = router;
